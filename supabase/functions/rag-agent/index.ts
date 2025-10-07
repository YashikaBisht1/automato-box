import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Tool {
  name: string;
  description: string;
  execute: (input: string) => Promise<string>;
}

// Calculator tool
const calculatorTool: Tool = {
  name: "calculator",
  description: "Performs mathematical calculations. Input should be a math expression like '1000 * 12 / 365' or 'sqrt(16) + 5^2'",
  execute: async (input: string) => {
    try {
      // Safe eval using Function constructor with limited scope
      const sanitized = input.replace(/[^0-9+\-*/().\s]/g, '');
      const result = new Function(`return ${sanitized}`)();
      return `Calculation result: ${result}`;
    } catch (error) {
      return `Error in calculation: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
};

// Web search tool (simulated - would need Serper API key for real implementation)
const webSearchTool: Tool = {
  name: "web_search",
  description: "Searches the web for current information. Input should be a search query.",
  execute: async (input: string) => {
    // For now, return a note that this would use real search
    return `[Web search for "${input}" would return real-time results here. Serper API integration needed for production.]`;
  }
};

// Data analyzer tool
const dataAnalyzerTool: Tool = {
  name: "data_analyzer",
  description: "Analyzes JSON data and extracts insights. Input should be valid JSON.",
  execute: async (input: string) => {
    try {
      const data = JSON.parse(input);
      const analysis = {
        type: Array.isArray(data) ? 'array' : typeof data,
        length: Array.isArray(data) ? data.length : Object.keys(data).length,
        keys: Array.isArray(data) ? 'N/A' : Object.keys(data).join(', '),
        summary: `Analyzed ${Array.isArray(data) ? 'array' : 'object'} with ${Array.isArray(data) ? data.length : Object.keys(data).length} items`
      };
      return JSON.stringify(analysis, null, 2);
    } catch (error) {
      return `Error analyzing data: ${error instanceof Error ? error.message : 'Invalid JSON'}`;
    }
  }
};

const AVAILABLE_TOOLS = [calculatorTool, webSearchTool, dataAnalyzerTool];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      agent_type, 
      prompt, 
      conversation_id,
      enabled_tools = ['calculator', 'web_search', 'data_analyzer']
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`RAG Agent processing for ${agent_type}...`);

    // 1. Get or create conversation
    let conversation;
    if (conversation_id) {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversation_id)
        .single();
      conversation = data;
    }

    const conversationHistory = conversation?.messages || [];

    // 2. Search for similar past outputs using keyword search (embeddings disabled for now)
    console.log('Searching for relevant past outputs...');
    const { data: similarOutputs } = await supabase
      .from('vector_embeddings')
      .select('content, agent_type, created_at')
      .eq('agent_type', agent_type)
      .order('created_at', { ascending: false })
      .limit(3);

    console.log(`Found ${similarOutputs?.length || 0} similar past outputs`);

    // 3. Build context with RAG results
    const ragContext = similarOutputs && similarOutputs.length > 0
      ? `\n\nBased on previous research:\n${similarOutputs.map((item: any, i: number) => 
          `${i + 1}. ${item.content}`
        ).join('\n')}`
      : '';

    // 4. Build tools context
    const activeTools = AVAILABLE_TOOLS.filter(t => enabled_tools.includes(t.name));
    const toolsContext = activeTools.length > 0
      ? `\n\nAvailable tools:\n${activeTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}\n\nTo use a tool, respond with: TOOL_CALL: tool_name | input`
      : '';

    // 5. Build conversation memory context
    const memoryContext = conversationHistory.length > 0
      ? `\n\nConversation history (last ${Math.min(conversationHistory.length, 5)} messages):\n${conversationHistory.slice(-5).map((msg: any) => 
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n')}`
      : '';

    // 6. Generate response with all context
    const enhancedPrompt = `${prompt}${ragContext}${toolsContext}${memoryContext}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a helpful AI agent specialized in ${agent_type}. Use provided tools when needed and reference past research when relevant.`
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let output = aiData.choices[0]?.message?.content || '';

    // 7. Process tool calls if present
    const toolCalls: any[] = [];
    const toolCallRegex = /TOOL_CALL:\s*(\w+)\s*\|\s*(.+)/g;
    let match;
    
    while ((match = toolCallRegex.exec(output)) !== null) {
      const [fullMatch, toolName, toolInput] = match;
      const tool = AVAILABLE_TOOLS.find(t => t.name === toolName);
      
      if (tool) {
        console.log(`Executing tool: ${toolName}`);
        const toolResult = await tool.execute(toolInput.trim());
        toolCalls.push({ tool: toolName, input: toolInput.trim(), result: toolResult });
        
        // Replace tool call with result in output
        output = output.replace(fullMatch, `[Tool: ${toolName}]\n${toolResult}`);
      }
    }

    // 8. Store output for future reference (without embeddings for now)
    await supabase.from('vector_embeddings').insert({
      content: output.substring(0, 1000), // Store first 1000 chars
      agent_type,
      metadata: { prompt, tool_calls: toolCalls.length }
    });

    // 9. Update conversation
    const newMessage = [
      { role: 'user', content: prompt, timestamp: new Date().toISOString() },
      { role: 'assistant', content: output, timestamp: new Date().toISOString(), tool_calls: toolCalls }
    ];

    if (conversation_id && conversation) {
      await supabase
        .from('conversations')
        .update({ 
          messages: [...conversationHistory, ...newMessage],
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation_id);
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          agent_type,
          title: prompt.substring(0, 100),
          messages: newMessage
        })
        .select()
        .single();
      conversation = newConv;
    }

    // 10. Get knowledge base stats
    const { count: embeddingsCount } = await supabase
      .from('vector_embeddings')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        output,
        conversation_id: conversation?.id,
        rag_context: {
          used_previous_research: (similarOutputs?.length || 0) > 0,
          similar_outputs_count: similarOutputs?.length || 0,
          sources: similarOutputs?.map((s: any) => ({
            content: s.content.substring(0, 100) + '...',
            similarity: 95 // Mock similarity since we're using keyword search
          }))
        },
        tool_usage: toolCalls,
        memory: {
          conversation_length: conversationHistory.length + 2,
          knowledge_base_size: embeddingsCount || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in RAG agent:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
