import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackRequest {
  decisionId: string;
  feedback: 'positive' | 'negative' | 'neutral';
  preferenceType?: string;
  selectedOutput?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { decisionId, feedback, preferenceType, selectedOutput }: FeedbackRequest = await req.json();

    console.log(`Learning from feedback: ${feedback} for decision ${decisionId}`);

    // Step 1: Update decision with feedback
    await supabaseClient
      .from('agent_decisions')
      .update({ user_feedback: feedback })
      .eq('id', decisionId);

    // Step 2: Learn from positive feedback
    if (feedback === 'positive' && preferenceType && selectedOutput) {
      // Check if preference exists
      const { data: existing } = await supabaseClient
        .from('user_preferences')
        .select('*')
        .eq('preference_type', preferenceType)
        .single();

      if (existing) {
        // Update existing preference
        const examples = Array.isArray(existing.examples) ? existing.examples : [];
        const newExamples = [...examples, selectedOutput].slice(-10); // Keep last 10
        const newConfidence = Math.min(existing.confidence_score + 0.05, 1.0);

        await supabaseClient
          .from('user_preferences')
          .update({
            examples: newExamples,
            confidence_score: newConfidence,
          })
          .eq('id', existing.id);
      } else {
        // Create new preference
        await supabaseClient
          .from('user_preferences')
          .insert({
            preference_type: preferenceType,
            preference_value: selectedOutput,
            examples: [selectedOutput],
            confidence_score: 0.60,
          });
      }
    }

    // Step 3: Decrease confidence on negative feedback
    if (feedback === 'negative' && preferenceType) {
      await supabaseClient.rpc('decrease_preference_confidence', {
        p_type: preferenceType,
        amount: 0.10,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Feedback processed and learned' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});