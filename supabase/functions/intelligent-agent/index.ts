import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentRequest {
  agentType: 'market-analyst' | 'branding' | 'content' | 'outreach';
  task: string;
  context?: any;
  includeReasoning?: boolean;
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

    const { agentType, task, context, includeReasoning = true }: AgentRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`Processing ${agentType} task:`, task);

    // Step 1: Retrieve relevant knowledge from knowledge base
    const { data: knowledgeEntries } = await supabaseClient
      .from('knowledge_entries')
      .select('*')
      .eq('source_type', agentType)
      .eq('is_outdated', false)
      .order('confidence_score', { ascending: false })
      .limit(5);

    // Step 2: Get user preferences for this agent type
    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('preference_type', agentType)
      .order('confidence_score', { ascending: false })
      .limit(3);

    // Step 3: Build enhanced prompt with knowledge and preferences
    const knowledgeContext = knowledgeEntries?.map(k => k.content).join('\n') || 'No prior knowledge';
    const preferenceContext = preferences?.map(p => JSON.stringify(p.preference_value)).join('\n') || 'No user preferences';

    const systemPrompt = `You are an intelligent ${agentType} agent with access to knowledge and user preferences.

REASONING MODE: ${includeReasoning ? 'ENABLED - Show your thinking step-by-step' : 'DISABLED'}

Knowledge Base:
${knowledgeContext}

User Preferences:
${preferenceContext}

${includeReasoning ? `
When responding, structure your output as:

## Reasoning Chain
Step 1: [Understanding the request]
Step 2: [Analyzing available information]
Step 3: [Considering options]
Step 4: [Making recommendation]

## Sources Used
- [List knowledge entries referenced]

## Alternatives Considered
- Option A: [Description with pros/cons]
- Option B: [Description with pros/cons]
- Option C (Selected): [Why this was chosen]

## Confidence Score
[0-100]% confidence based on available data

## Main Output
[Your actual deliverable]
` : 'Provide your output directly and concisely.'}`;

    // Step 4: Call AI with enhanced context
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: task }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const output = aiData.choices[0]?.message?.content || '';

    // Step 5: Extract reasoning components if enabled
    let reasoningChain = [];
    let alternativesConsidered = [];
    let sourcesUsed = [];
    let confidenceScore = 0.80;

    if (includeReasoning && output.includes('## Reasoning Chain')) {
      const reasoningMatch = output.match(/## Reasoning Chain\n([\s\S]*?)(?=\n## |$)/);
      if (reasoningMatch) {
        reasoningChain = reasoningMatch[1].split('\n').filter((l: string) => l.trim());
      }

      const alternativesMatch = output.match(/## Alternatives Considered\n([\s\S]*?)(?=\n## |$)/);
      if (alternativesMatch) {
        alternativesConsidered = alternativesMatch[1].split('\n').filter((l: string) => l.trim().startsWith('-'));
      }

      const sourcesMatch = output.match(/## Sources Used\n([\s\S]*?)(?=\n## |$)/);
      if (sourcesMatch) {
        sourcesUsed = sourcesMatch[1].split('\n').filter((l: string) => l.trim().startsWith('-'));
      }

      const confidenceMatch = output.match(/## Confidence Score\n(\d+)%/);
      if (confidenceMatch) {
        confidenceScore = parseInt(confidenceMatch[1]) / 100;
      }
    }

    // Step 6: Log decision for learning
    await supabaseClient.from('agent_decisions').insert({
      agent_type: agentType,
      decision_context: task,
      reasoning_chain: reasoningChain,
      alternatives_considered: alternativesConsidered,
      sources_used: knowledgeEntries?.map(k => k.id) || [],
      confidence_score: confidenceScore,
    });

    // Step 7: Store new knowledge if applicable
    if (agentType === 'market-analyst' && output.includes('competitor')) {
      await supabaseClient.from('knowledge_entries').insert({
        content: output.substring(0, 1000),
        source_type: 'market_research',
        category: 'competitor_analysis',
        confidence_score: confidenceScore,
      });
    }

    return new Response(
      JSON.stringify({
        output,
        reasoning: includeReasoning ? {
          chain: reasoningChain,
          alternatives: alternativesConsidered,
          sources: sourcesUsed,
          confidence: confidenceScore
        } : null,
        knowledgeUsed: knowledgeEntries?.length || 0,
        preferencesApplied: preferences?.length || 0,
      }),
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