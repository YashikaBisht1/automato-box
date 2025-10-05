import Groq from 'groq-sdk';

export type AgentType = 'market-analyst' | 'branding' | 'content' | 'outreach';

export interface TaskAnalysis {
  intent: string;
  complexity: 'simple' | 'moderate' | 'complex';
  recommendedAgents: AgentType[];
  recommendedModel: string;
  suggestedWorkflow: string;
  confidence: number;
  estimatedTime: string;
  subtasks?: string[];
}

export interface OrchestratorResult {
  analysis: TaskAnalysis;
  results: Array<{
    agent: AgentType;
    output: any;
    status: 'completed' | 'failed';
  }>;
}

export const analyzeIntent = async (
  apiKey: string,
  userInput: string
): Promise<TaskAnalysis> => {
  const groq = new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const prompt = `You are an AI task analyzer. Analyze this user request and provide a structured response.

User Request: "${userInput}"

Available Agents:
- market-analyst: Competitive analysis, market research, trends
- branding: Brand identity, taglines, positioning, pitches
- content: LinkedIn posts, blog articles, marketing content
- outreach: Email sequences, cold outreach campaigns

Analyze and respond in this EXACT format:

INTENT: [One line describing what user wants]
COMPLEXITY: [simple/moderate/complex]
AGENTS: [comma-separated list of recommended agents]
MODEL: llama-3.1-8b-instant
WORKFLOW: [Brief description of suggested workflow]
CONFIDENCE: [number 0-100]
TIME: [estimated time like "5 minutes" or "15 minutes"]
SUBTASKS: [if complex, list numbered subtasks, otherwise write "N/A"]

Be concise and specific.`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert task analyzer for AI agent orchestration.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    max_tokens: 500,
  });

  const response = completion.choices[0]?.message?.content || '';
  
  // Parse the structured response
  const lines = response.split('\n').filter(line => line.trim());
  const analysis: TaskAnalysis = {
    intent: '',
    complexity: 'moderate',
    recommendedAgents: [],
    recommendedModel: 'llama-3.1-8b-instant',
    suggestedWorkflow: '',
    confidence: 80,
    estimatedTime: '10 minutes',
  };

  lines.forEach(line => {
    if (line.startsWith('INTENT:')) {
      analysis.intent = line.replace('INTENT:', '').trim();
    } else if (line.startsWith('COMPLEXITY:')) {
      const complexity = line.replace('COMPLEXITY:', '').trim().toLowerCase();
      if (complexity === 'simple' || complexity === 'moderate' || complexity === 'complex') {
        analysis.complexity = complexity;
      }
    } else if (line.startsWith('AGENTS:')) {
      const agents = line.replace('AGENTS:', '').trim().split(',').map(a => a.trim());
      analysis.recommendedAgents = agents.filter(a => 
        ['market-analyst', 'branding', 'content', 'outreach'].includes(a)
      ) as AgentType[];
    } else if (line.startsWith('MODEL:')) {
      analysis.recommendedModel = line.replace('MODEL:', '').trim();
    } else if (line.startsWith('WORKFLOW:')) {
      analysis.suggestedWorkflow = line.replace('WORKFLOW:', '').trim();
    } else if (line.startsWith('CONFIDENCE:')) {
      const conf = parseInt(line.replace('CONFIDENCE:', '').trim());
      if (!isNaN(conf)) analysis.confidence = conf;
    } else if (line.startsWith('TIME:')) {
      analysis.estimatedTime = line.replace('TIME:', '').trim();
    } else if (line.startsWith('SUBTASKS:')) {
      const subtasksText = line.replace('SUBTASKS:', '').trim();
      if (subtasksText !== 'N/A') {
        analysis.subtasks = [];
      }
    } else if (line.match(/^\d+\./)) {
      // This is a numbered subtask
      if (!analysis.subtasks) analysis.subtasks = [];
      analysis.subtasks.push(line.replace(/^\d+\./, '').trim());
    }
  });

  return analysis;
};

export const executeWorkflow = async (
  apiKey: string,
  userInput: string,
  analysis: TaskAnalysis,
  onProgress?: (agent: AgentType, status: string) => void
): Promise<OrchestratorResult> => {
  const results: OrchestratorResult['results'] = [];

  // Execute agents in sequence based on recommendations
  for (const agent of analysis.recommendedAgents) {
    try {
      onProgress?.(agent, 'in-progress');
      
      // For now, we'll return placeholder results
      // In a full implementation, this would call the actual agent functions
      results.push({
        agent,
        output: `${agent} analysis for: ${userInput}`,
        status: 'completed',
      });
      
      onProgress?.(agent, 'completed');
    } catch (error) {
      results.push({
        agent,
        output: error instanceof Error ? error.message : 'Failed',
        status: 'failed',
      });
      onProgress?.(agent, 'failed');
    }
  }

  return {
    analysis,
    results,
  };
};

export const decomposeTask = async (
  apiKey: string,
  complexTask: string
): Promise<string[]> => {
  const groq = new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const prompt = `Break down this complex task into 5-7 specific, actionable subtasks.

Complex Task: "${complexTask}"

Provide ONLY a numbered list of subtasks, nothing else. Each subtask should be specific and executable.

Example format:
1. Research competitor pricing strategies
2. Analyze target audience demographics
3. Identify unique value propositions

Now break down the task above:`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert at breaking down complex tasks into manageable subtasks.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.5,
    max_tokens: 400,
  });

  const response = completion.choices[0]?.message?.content || '';
  
  // Extract numbered items
  const subtasks = response
    .split('\n')
    .filter(line => line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\./, '').trim());

  return subtasks;
};
