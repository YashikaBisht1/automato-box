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

export const generateBrandIdentity = async (
  apiKey: string,
  company: string,
  description: string,
  audience: string,
  personality: string[],
  industry: string
) => {
  const groq = createGroqClient(apiKey);

  const prompt = `You are a brand strategist. Create a comprehensive brand identity for ${company}.

Company Description: ${description}
Target Audience: ${audience}
Brand Personality: ${personality.join(', ')}
Industry: ${industry}

Provide the following in markdown format:

## Taglines
[Generate 10 creative tagline variations]

## Elevator Pitches
### 30-Second Pitch
[Brief pitch]

### 1-Minute Pitch
[Medium pitch]

### 2-Minute Pitch
[Detailed pitch]

## Value Proposition
[Clear, compelling value proposition statement]

## Pitch Deck Outline
[Provide 10-slide outline with slide titles and key points for each]`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert brand strategist who creates compelling brand identities.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.8,
    max_tokens: 4000,
  });

  return completion.choices[0]?.message?.content || '';
};

export const generateLogoPrompts = (
  company: string,
  personality: string[],
  industry: string
): string[] => {
  const basePrompt = `minimalist logo for ${company}, ${industry} industry, professional, vector art, white background, simple design, clean`;
  
  return personality.slice(0, 3).map(trait => 
    `${basePrompt}, ${trait} style, modern aesthetic`
  );
};

export const generateContent = async (
  apiKey: string,
  contentType: 'linkedin' | 'blog' | 'email',
  topic: string,
  tone: number,
  audience: string,
  style?: string[],
  instructions?: string
) => {
  const groq = createGroqClient(apiKey);

  const toneMap = {
    0: 'Very Formal',
    25: 'Formal',
    50: 'Balanced',
    75: 'Casual',
    100: 'Very Casual'
  };
  
  const closestTone = Object.entries(toneMap).reduce((prev, curr) => 
    Math.abs(Number(curr[0]) - tone) < Math.abs(Number(prev[0]) - tone) ? curr : prev
  )[1];

  let prompt = '';
  
  if (contentType === 'linkedin') {
    prompt = `Generate 10 LinkedIn post variations about: ${topic}

Target Audience: ${audience}
Tone: ${closestTone}
${style ? `Style: ${style.join(', ')}` : ''}
${instructions ? `Special Instructions: ${instructions}` : ''}

Each post should:
- Have an engaging hook
- Provide valuable content
- Include a clear CTA
- Add relevant hashtags
- Be under 3000 characters

Format each post clearly separated with "---"`;
  } else if (contentType === 'blog') {
    prompt = `Write a comprehensive blog article about: ${topic}

Target Audience: ${audience}
Tone: ${closestTone}
${instructions ? `Special Instructions: ${instructions}` : ''}

Include:
- Compelling headline
- Introduction
- 3-5 main sections with subheadings
- Conclusion with CTA
- Make it engaging and informative`;
  }

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert content creator who writes engaging, valuable content.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.8,
    max_tokens: 4000,
  });

  return completion.choices[0]?.message?.content || '';
};

export const generateOutreachSequence = async (
  apiKey: string,
  prospectName: string,
  company: string,
  industry: string,
  valueProp: string,
  goal: string
) => {
  const groq = createGroqClient(apiKey);

  const prompt = `Create a 5-email cold outreach sequence for ${prospectName} at ${company} in the ${industry} industry.

Our Value Proposition: ${valueProp}
Campaign Goal: ${goal}

Generate a sequence with:

## Email 1: Initial Outreach
Subject: [Subject line]
Body: [Personalized opener, brief value prop, soft CTA]
Timing: Day 1

## Email 2: Value-Add Follow-up
Subject: [Subject line]
Body: [Share valuable insight or resource, reinforce value]
Timing: Day 3

## Email 3: Social Proof
Subject: [Subject line]
Body: [Case study or testimonial, build credibility]
Timing: Day 7

## Email 4: Direct CTA
Subject: [Subject line]
Body: [Clear call-to-action, easy next step]
Timing: Day 10

## Email 5: Breakup Email
Subject: [Subject line]
Body: [Final attempt, door-in-the-face technique]
Timing: Day 14

Make each email concise, personalized, and action-oriented.`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert sales copywriter who creates high-converting email sequences.',
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
