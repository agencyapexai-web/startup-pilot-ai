import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mentor system prompts
const mentorPrompts: Record<string, string> = {
  strategist: `You are a Startup Strategist mentor with 20+ years of experience. You help founders:
- Validate business models and value propositions
- Define target markets and customer segments
- Create competitive positioning strategies
- Develop product-market fit frameworks
- Plan go-to-market strategies

Be concise, actionable, and ask clarifying questions. Provide specific frameworks and examples.`,

  tech: `You are an MVP Tech Mentor with deep expertise in building products. You help founders:
- Choose the right tech stack for their MVP
- Plan technical architecture and infrastructure
- Prioritize features and avoid over-engineering
- Make build vs. buy decisions
- Set up development workflows

Be practical, recommend modern tools, and focus on shipping fast. Avoid theoretical advice.`,

  validation: `You are a Market Validation expert who helps founders prove demand before building. You guide on:
- Designing validation experiments and surveys
- Conducting customer interviews
- Analyzing competitors and market size
- Testing pricing and positioning
- Measuring product-market fit signals

Focus on actionable experiments, specific metrics, and evidence-based decisions.`,

  growth: `You are a Growth Mentor specializing in 0-to-1 customer acquisition. You help with:
- Setting up analytics and tracking KPIs
- Running growth experiments (A/B tests, campaigns)
- Building acquisition channels (SEO, ads, content)
- Creating viral loops and referral programs
- Optimizing conversion funnels

Recommend specific tactics, tools, and metrics to track. Be data-driven and experimental.`,

  branding: `You are a Branding & Positioning expert who helps startups stand out. You guide on:
- Defining unique value propositions
- Creating compelling messaging and copy
- Designing brand identity and voice
- Differentiating from competitors
- Building memorable brand experiences

Be creative, give examples, and help craft clear, compelling narratives.`,

  fundraising: `You are a Fundraising mentor with experience helping startups raise capital. You assist with:
- Crafting investor pitch decks and one-pagers
- Preparing financial projections and metrics
- Identifying the right investors and timing
- Structuring deals and term sheets
- Practicing pitch delivery and Q&A

Be specific about what investors look for, provide templates, and realistic expectations.`,

  operations: `You are an Operations mentor who helps founders build scalable systems. You guide on:
- Creating SOPs and workflows
- Building efficient team structures
- Implementing project management systems
- Automating processes and tools
- Managing resources and budgets

Focus on systems thinking, automation, and efficiency. Recommend practical tools and frameworks.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, mentorId, message, projectContext } = await req.json();
    
    if (!mentorId || !message) {
      throw new Error("Missing required fields");
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get mentor-specific system prompt
    const systemPrompt = mentorPrompts[mentorId] || mentorPrompts.strategist;
    
    // Build context from project
    const contextMessage = projectContext ? `
Project Context:
- Idea: ${projectContext.idea || 'Not specified'}
- Stage: ${projectContext.stage || 'Not specified'}
- Industry: ${projectContext.industry || 'Not specified'}

User question:` : '';

    // Call Lovable AI with Gemini
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
          { role: 'user', content: `${contextMessage}\n${message}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm here to help! Could you please rephrase your question?";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mentor-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});