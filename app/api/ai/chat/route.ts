import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { userFunctions, adminFunctions } from '@/lib/ai/function-definitions'
import { executeFunctionCall } from '@/lib/ai/function-handlers'

const chatSchema = z.object({
  message: z.string().min(1),
  userId: z.string(),
  isAdmin: z.boolean(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'tool', 'system']),
    content: z.string(),
    name: z.string().optional(),
    tool_call_id: z.string().optional(),
  })),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = chatSchema.parse(body)

    const supabase = await createClient()

    // Get OpenAI configuration
    let apiKey: string | null = null
    let model = 'gpt-4o' // Default to latest model
    let temperature = 0.7
    let maxTokens = 2000
    let systemInstructions = ''

    // Check if user has personal API key
    const { data: userSettings } = await supabase
      .from('user_openai_settings')
      .select('*')
      .eq('user_id', validatedData.userId)
      .single()

    const userSettingsData = userSettings as any
    if (userSettingsData && userSettingsData.api_key && !userSettingsData.use_platform_key) {
      // Use user's personal API key
      apiKey = userSettingsData.api_key
    } else {
      // Use platform API key
      const { data: adminSettings } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'openai_api_key',
          'openai_model',
          'openai_temperature',
          'openai_max_tokens',
          'openai_system_instructions',
        ])

      adminSettings?.forEach((s: any) => {
        if (s.setting_key === 'openai_api_key') apiKey = s.setting_value
        if (s.setting_key === 'openai_model' && s.setting_value) model = s.setting_value
        if (s.setting_key === 'openai_temperature' && s.setting_value) temperature = parseFloat(s.setting_value)
        if (s.setting_key === 'openai_max_tokens' && s.setting_value) maxTokens = parseInt(s.setting_value)
        if (s.setting_key === 'openai_system_instructions' && s.setting_value) systemInstructions = s.setting_value
      })

      // Fallback to environment variable
      if (!apiKey) {
        apiKey = process.env.OPENAI_API_KEY || null
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { response: "AI features are not configured. Please add your OpenAI API key in settings or contact your platform administrator." },
        { status: 200 }
      )
    }

    // Build system message
    const baseSystemMessage = validatedData.isAdmin
      ? `You are an AI ROI Assistant with ADMIN ACCESS to all platform data. You can analyze all users' scenarios, identify trends across the platform, and provide strategic insights.`
      : `You are an AI ROI Assistant helping a user analyze their marketing performance. You can access their scenarios and provide personalized recommendations.`

    const fullSystemMessage = systemInstructions
      ? `${baseSystemMessage}\n\nAdditional Instructions: ${systemInstructions}`
      : baseSystemMessage

    // Select appropriate functions based on user role
    const availableFunctions = validatedData.isAdmin ? adminFunctions : userFunctions

    // Call OpenAI API with function calling
    const messages = [
      {
        role: 'system',
        content: fullSystemMessage,
      },
      ...validatedData.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
        ...(msg.name && { name: msg.name }),
        ...(msg.tool_call_id && { tool_call_id: msg.tool_call_id }),
      })),
      {
        role: 'user',
        content: validatedData.message,
      },
    ]

    let response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        tools: availableFunctions.map(fn => ({
          type: 'function',
          function: {
            ...fn,
            strict: true, // Enable Structured Outputs for guaranteed JSON Schema compliance
          },
        })),
        tool_choice: 'auto',
        parallel_tool_calls: true, // Allow OpenAI to call multiple tools simultaneously
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error('OpenAI API request failed')
    }

    let data = await response.json()
    let aiMessage = data.choices[0].message

    // Handle function calls
    const maxIterations = 5 // Prevent infinite loops
    let iterations = 0

    while (aiMessage.tool_calls && iterations < maxIterations) {
      iterations++

      // Execute all function calls
      const functionResults = await Promise.all(
        aiMessage.tool_calls.map(async (toolCall: any) => {
          try {
            const functionName = toolCall.function.name
            const functionArgs = JSON.parse(toolCall.function.arguments)

            const result = await executeFunctionCall(
              functionName,
              functionArgs,
              supabase,
              validatedData.userId,
              validatedData.isAdmin
            )

            return {
              tool_call_id: toolCall.id,
              role: 'tool',
              name: functionName,
              content: JSON.stringify(result),
            }
          } catch (error: any) {
            return {
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify({ error: error.message }),
            }
          }
        })
      )

      // Add assistant message and function results to messages
      messages.push(aiMessage)
      messages.push(...functionResults)

      // Call OpenAI again with function results
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          tools: availableFunctions.map(fn => ({
            type: 'function',
            function: {
              ...fn,
              strict: true, // Enable Structured Outputs for guaranteed JSON Schema compliance
            },
          })),
          tool_choice: 'auto',
          parallel_tool_calls: true, // Allow OpenAI to call multiple tools simultaneously
          temperature,
          max_tokens: maxTokens,
        }),
      })

      if (!response.ok) {
        throw new Error('OpenAI API request failed')
      }

      data = await response.json()
      aiMessage = data.choices[0].message
    }

    const finalResponse = aiMessage.content || 'No response generated.'

    // Save conversation to database
    try {
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
        await (supabase
          .from('ai_chat_messages')
          .insert([
            {
              conversation_id: (conversation as any).id,
              role: 'user',
              content: validatedData.message,
              tokens_used: data.usage?.prompt_tokens || 0,
            },
            {
              conversation_id: (conversation as any).id,
              role: 'assistant',
              content: finalResponse,
              tokens_used: data.usage?.completion_tokens || 0,
            },
          ] as any))
      }
    } catch (dbError) {
      console.error('Failed to save conversation:', dbError)
    }

    return NextResponse.json({
      response: finalResponse,
      usage: data.usage,
    })
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
