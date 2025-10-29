import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const chatSchema = z.object({
  message: z.string().min(1),
  userId: z.string(),
  isAdmin: z.boolean(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = chatSchema.parse(body)

    const supabase = await createClient()

    // Fetch user's data (or all data if admin)
    let scenarios
    if (validatedData.isAdmin) {
      // Admin: Get all scenarios
      const { data } = await supabase
        .from('roi_scenarios')
        .select('*, calculator_sessions(*), users(email)')
        .order('created_at', { ascending: false })
        .limit(100)

      scenarios = data
    } else {
      // Regular user: Get only their scenarios
      const { data } = await supabase
        .from('roi_scenarios')
        .select('*, calculator_sessions(*)')
        .eq('user_id', validatedData.userId)
        .order('created_at', { ascending: false })

      scenarios = data
    }

    // Build context for AI
    const context = buildContext(scenarios || [], validatedData.isAdmin)

    // Call OpenAI API (or Anthropic)
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { response: "AI features are not configured. Please add your OpenAI API key to enable this feature." },
        { status: 200 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: validatedData.isAdmin
              ? `You are an AI ROI Assistant with ADMIN ACCESS to all platform data. You can analyze all users' scenarios, identify trends across the platform, and provide strategic insights. ${context}`
              : `You are an AI ROI Assistant helping a user analyze their marketing performance. ${context}`,
          },
          ...validatedData.conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: validatedData.message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API request failed')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Save conversation to database
    try {
      // Create conversation if needed
      const { data: conversation } = await supabase
        .from('ai_chat_conversations')
        .insert([{
          user_id: validatedData.userId,
          title: validatedData.message.substring(0, 100),
          is_active: true,
        }] as any)
        .select('id')
        .single()

      if (conversation) {
        // Save messages
        await (supabase
          .from('ai_chat_messages')
          // @ts-ignore - Supabase type inference issue
          .insert([
            {
              conversation_id: (conversation as any).id,
              role: 'user',
              content: validatedData.message,
            },
            {
              conversation_id: (conversation as any).id,
              role: 'assistant',
              content: aiResponse,
            },
          ]))
      }
    } catch (dbError) {
      console.error('Failed to save conversation:', dbError)
      // Don't fail the request if DB save fails
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    )
  }
}

function buildContext(scenarios: any[], isAdmin: boolean): string {
  if (scenarios.length === 0) {
    return isAdmin
      ? 'No scenarios exist in the platform yet.'
      : 'The user has not created any scenarios yet. Encourage them to create their first scenario.'
  }

  const summary = {
    totalScenarios: scenarios.length,
    avgSalesIncrease: scenarios.reduce((sum, s) => sum + s.sales_increase, 0) / scenarios.length,
    avgRevenueIncrease: scenarios.reduce((sum, s) => sum + s.revenue_increase, 0) / scenarios.length,
    avgCPAImprovement: scenarios.reduce((sum, s) => sum + s.cpa_improvement_percent, 0) / scenarios.length,
  }

  if (isAdmin) {
    const uniqueUsers = new Set(scenarios.map(s => s.user_id)).size
    return `
Platform Summary:
- Total Users: ${uniqueUsers}
- Total Scenarios: ${summary.totalScenarios}
- Average Sales Increase: ${Math.round(summary.avgSalesIncrease)}
- Average Revenue Increase: $${Math.round(summary.avgRevenueIncrease).toLocaleString()}
- Average CPA Improvement: ${summary.avgCPAImprovement.toFixed(1)}%

You have access to all user data. Provide strategic, platform-wide insights.
`
  }

  return `
User's Data Summary:
- Total Scenarios: ${summary.totalScenarios}
- Average Sales Increase: ${Math.round(summary.avgSalesIncrease)}
- Average Revenue Increase: $${Math.round(summary.avgRevenueIncrease).toLocaleString()}
- Average CPA Improvement: ${summary.avgCPAImprovement.toFixed(1)}%

Recent Scenarios:
${scenarios.slice(0, 5).map(s => `- ${s.scenario_name}: +${s.sales_increase} sales, +$${Math.round(s.revenue_increase).toLocaleString()} revenue, ${s.cpa_improvement_percent.toFixed(1)}% CPA improvement`).join('\n')}

Use this data to answer the user's questions with specific numbers and recommendations.
`
}
