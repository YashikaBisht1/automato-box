import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      content,
      source_type, // 'competitor', 'market_research', 'user_preference'
      entity_name, // Company name, competitor name
      category, // 'pricing', 'features', 'funding'
      source_url,
      confidence_score = 0.80,
      metadata = {}
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Storing knowledge: ${entity_name} - ${category}`);

    // Check if similar knowledge exists
    const { data: existing } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('entity_name', entity_name)
      .eq('category', category)
      .eq('is_outdated', false)
      .limit(1);

    let result;
    
    if (existing && existing.length > 0) {
      // Update existing entry
      const { data, error } = await supabase
        .from('knowledge_entries')
        .update({
          content,
          confidence_score,
          last_validated_at: new Date().toISOString(),
          metadata: { ...existing[0].metadata, ...metadata, updated: true }
        })
        .eq('id', existing[0].id)
        .select()
        .single();

      if (error) throw error;
      result = data;
      
      console.log('Updated existing knowledge entry');
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('knowledge_entries')
        .insert({
          content,
          source_type,
          entity_name,
          category,
          source_url,
          confidence_score,
          metadata
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
      
      console.log('Created new knowledge entry');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        knowledge_id: result.id,
        action: existing && existing.length > 0 ? 'updated' : 'created'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in store-knowledge:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
