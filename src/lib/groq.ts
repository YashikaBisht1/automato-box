import Groq from 'groq-sdk';

export const createGroqClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error('Groq API key is required. Please add it in Settings.');
  }
  
  return new Groq({
    apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side usage
  });
};

export const generateMarketAnalysis = async (
  apiKey: string,
  company: string,
  industry: string,
  competitors: string[]
) => {
  const groq = createGroqClient(apiKey);

  const prompt = `You are a market research analyst. Analyze the competitive landscape for ${company} in the ${industry} industry competing with ${competitors.join(', ')}.

Provide a comprehensive analysis in the following markdown format:

## Executive Summary
[Provide a brief overview of the market positioning and competitive landscape]

## Competitor Comparison Matrix

| Feature | ${company} | ${competitors.join(' | ')} |
|---------|-----------|${competitors.map(() => '-----------|').join('')}
[Fill in key features, pricing, strengths, and weaknesses for each competitor]

## Market Trends
1. [Trend 1]
2. [Trend 2]
3. [Trend 3]
4. [Trend 4]
5. [Trend 5]

## Opportunity Gaps
- [Gap 1 and how ${company} can leverage it]
- [Gap 2 and differentiation opportunity]
- [Gap 3 and strategic recommendation]

## Strategic Recommendations
[Provide 3-5 specific, actionable recommendations for ${company}]`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert market research analyst who provides detailed, actionable insights.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_tokens: 4000,
  });

  return completion.choices[0]?.message?.content || '';
};
