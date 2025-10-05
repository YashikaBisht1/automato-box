import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { agent_type, prompt, entity_name, category } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating with reasoning for ${agent_type}...`);

    // Retrieve relevant knowledge from the knowledge base
    let relevantKnowledge: any[] = [];
    if (entity_name) {
      const { data: knowledge } = await supabase
        .from('knowledge_entries')
        .select('*')
        .eq('entity_name', entity_name)
        .eq('is_outdated', false)
        .limit(5);
      
      relevantKnowledge = knowledge || [];
    }

    // Retrieve user preferences for this agent type
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('preference_type', `${agent_type}_successful_pattern`)
      .limit(3);

    const userPreferences = preferences || [];

    // Build enhanced prompt with knowledge and preferences
    const knowledgeContext = relevantKnowledge.length > 0
      ? `\n\nRelevant Knowledge:\n${relevantKnowledge.map(k => `- ${k.category}: ${k.content} (Confidence: ${k.confidence_score})`).join('\n')}`
      : '';

    const preferenceContext = userPreferences.length > 0
      ? `\n\nUser Preferences (learned from past successes):\n${userPreferences.map(p => `- ${JSON.stringify(p.preference_value)}`).join('\n')}`
      : '';

    const enhancedPrompt = `${prompt}${knowledgeContext}${preferenceContext}

IMPORTANT: Structure your response as follows:

## Output
[Your main generated content here]

## Reasoning
Step 1: [First reasoning step]
Step 2: [Second reasoning step]
Step 3: [Third reasoning step]
...

## Decision Factors
- [Factor 1 and why it matters]
- [Factor 2 and why it matters]
- [Factor 3 and why it matters]

## Alternatives Considered
Option A: [Brief description] - Rejected because [reason]
Option B: [Brief description] - Rejected because [reason]

## Confidence Score
[0-100]: [Explanation of confidence level]

## Sources Used
${relevantKnowledge.length > 0 ? relevantKnowledge.map(k => `- ${k.source_type}: ${k.entity_name}`).join('\n') : '- No prior knowledge available'}`;

    // Generate with AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an AI agent that provides transparent, well-reasoned outputs. Always show your reasoning process step-by-step, cite sources, and explain your decision-making.`
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', response.status, error);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const fullOutput = data.choices[0]?.message?.content || '';

    // Parse the structured output
    const outputMatch = fullOutput.match(/## Output\n([\s\S]*?)(?=\n## Reasoning|$)/);
    const reasoningMatch = fullOutput.match(/## Reasoning\n([\s\S]*?)(?=\n## Decision Factors|$)/);
    const factorsMatch = fullOutput.match(/## Decision Factors\n([\s\S]*?)(?=\n## Alternatives Considered|$)/);
    const alternativesMatch = fullOutput.match(/## Alternatives Considered\n([\s\S]*?)(?=\n## Confidence Score|$)/);
    const confidenceMatch = fullOutput.match(/## Confidence Score\n([\s\S]*?)(?=\n## Sources Used|$)/);
    const sourcesMatch = fullOutput.match(/## Sources Used\n([\s\S]*?)$/);

    const output = outputMatch ? outputMatch[1].trim() : fullOutput;
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : '';
    const factors = factorsMatch ? factorsMatch[1].trim() : '';
    const alternatives = alternativesMatch ? alternativesMatch[1].trim() : '';
    const confidence = confidenceMatch ? confidenceMatch[1].trim() : '';
    const sources = sourcesMatch ? sourcesMatch[1].trim() : '';

    // Extract confidence score
    const confidenceScore = confidence ? parseFloat(confidence.match(/\d+/)?.[0] || '80') / 100 : 0.80;

    // Log the decision to database
    const { error: decisionError } = await supabase
      .from('agent_decisions')
      .insert({
        agent_type,
        decision_context: prompt,
        reasoning_chain: reasoning.split('\n').filter((l: string) => l.trim()),
        alternatives_considered: alternatives.split('\n').filter((l: string) => l.trim()),
        sources_used: relevantKnowledge.map(k => ({ id: k.id, content: k.content })),
        confidence_score: confidenceScore
      });

    if (decisionError) {
      console.error('Error logging decision:', decisionError);
    }

    return new Response(
      JSON.stringify({
        output,
        transparency: {
          reasoning,
          decision_factors: factors,
          alternatives,
          confidence,
          sources,
          confidence_score: confidenceScore
        },
        knowledge_used: relevantKnowledge.length,
        preferences_applied: userPreferences.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-with-reasoning:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
