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
    let apiType = 'chat' // 'chat' or 'responses'
    let model = 'gpt-4o' // Default to latest model
    let temperature = 0.7
    let maxTokens: number | null = null // null = use model's max (default)
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
          'openai_api_type',
          'openai_model',
          'openai_temperature',
          'openai_max_tokens',
          'openai_system_instructions',
        ])

      adminSettings?.forEach((s: any) => {
        if (s.setting_key === 'openai_api_key') apiKey = s.setting_value
        if (s.setting_key === 'openai_api_type' && s.setting_value) apiType = s.setting_value
        if (s.setting_key === 'openai_model' && s.setting_value) model = s.setting_value
        if (s.setting_key === 'openai_temperature' && s.setting_value) temperature = parseFloat(s.setting_value)
        if (s.setting_key === 'openai_max_tokens') {
          // If setting_value is null or empty, set maxTokens to null (use model max)
          maxTokens = s.setting_value ? parseInt(s.setting_value) : null
        }
        if (s.setting_key === 'openai_system_instructions' && s.setting_value) systemInstructions = s.setting_value
      })

      // Fallback to environment variable
      if (!apiKey) {
        apiKey = process.env.OPENAI_API_KEY || null
      }
    }

    if (!apiKey) {
      console.error('No OpenAI API key configured')
      return NextResponse.json(
        { error: "AI features are not configured. Please add your OpenAI API key in Admin → AI Settings." },
        { status: 500 }
      )
    }

    console.log('AI Chat Request:', {
      userId: validatedData.userId,
      isAdmin: validatedData.isAdmin,
      apiType,
      model,
      temperature,
      maxTokens,
      hasApiKey: !!apiKey,
      apiKeySource: userSettingsData?.api_key ? 'user' : 'platform'
    })

    // Build system message
    const baseSystemMessage = validatedData.isAdmin
      ? `You are an AI ROI Assistant with ADMIN ACCESS to all platform data. You can analyze all users' scenarios, identify trends across the platform, and provide strategic insights.`
      : `You are an AI ROI Assistant helping a user analyze their marketing performance. You can access their scenarios and provide personalized recommendations.`

    const fullSystemMessage = systemInstructions
      ? `${baseSystemMessage}\n\nAdditional Instructions: ${systemInstructions}`
      : baseSystemMessage

    // Select appropriate functions based on user role
    const availableFunctions = validatedData.isAdmin ? adminFunctions : userFunctions

    // Route to correct API based on apiType
    if (apiType === 'responses') {
      // Use Responses API (for GPT-5 and advanced features)
      return await handleResponsesAPI({
        apiKey,
        model,
        temperature,
        maxTokens,
        fullSystemMessage,
        validatedData,
        availableFunctions,
        supabase
      })
    }

    // Default: Use Chat Completions API
    console.log(`Using Chat Completions API with model: ${model}`)

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
        ...(maxTokens !== null && { max_tokens: maxTokens }), // Only include if not null
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', response.status, errorData)

      // Parse error for better user feedback
      try {
        const errorJson = JSON.parse(errorData)
        const errorMessage = errorJson.error?.message || errorJson.error || 'Unknown OpenAI error'
        console.error('Full OpenAI error:', errorJson)
        throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`)
      } catch (parseError) {
        console.error('Could not parse OpenAI error:', errorData)
        throw new Error(`OpenAI API request failed with status ${response.status}: ${errorData}`)
      }
    }

    let data = await response.json()
    console.log('Chat Completions API Response:', {
      model: data.model,
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      usage: data.usage
    })
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
          ...(maxTokens !== null && { max_tokens: maxTokens }), // Only include if not null
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('OpenAI API error (iteration):', response.status, errorData)
        throw new Error(`OpenAI API error: ${response.status}`)
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
      console.error('Validation error:', error.issues)
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('AI chat error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to process your request', details: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * Handle requests using OpenAI Responses API (for GPT-5 and advanced features)
 */
async function handleResponsesAPI(params: {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number | null
  fullSystemMessage: string
  validatedData: any
  availableFunctions: any[]
  supabase: any
}) {
  const {
    apiKey,
    model,
    temperature,
    maxTokens,
    fullSystemMessage,
    validatedData,
    availableFunctions,
    supabase
  } = params

  console.log(`🚀 Using Responses API (Advanced) with model: ${model}`)

  // Build input array for Responses API (uses 'input' instead of 'messages')
  const inputMessages = [
    {
      role: 'system',
      content: fullSystemMessage,
    },
    ...validatedData.conversationHistory.map((msg: any) => ({
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

  // Make initial request to Responses API
  let response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: inputMessages, // Responses API uses 'input' not 'messages'
      tools: availableFunctions.map(fn => ({
        type: 'function',
        ...fn, // Spread name, description, parameters directly
      })),
      temperature,
      // Note: Responses API does not support max_tokens parameter
    }),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('OpenAI Responses API error:', response.status, errorData)

    // Parse error for better user feedback
    try {
      const errorJson = JSON.parse(errorData)
      const errorMessage = errorJson.error?.message || errorJson.error || 'Unknown OpenAI error'
      console.error('Full OpenAI Responses API error:', errorJson)
      throw new Error(`OpenAI Responses API error (${response.status}): ${errorMessage}`)
    } catch (parseError) {
      console.error('Could not parse OpenAI Responses API error:', errorData)
      throw new Error(`OpenAI Responses API request failed with status ${response.status}: ${errorData}`)
    }
  }

  let data = await response.json()

  console.log('✅ Responses API Response:', {
    model: data.model,
    status: data.status,
    hasOutput: !!data.output,
    outputLength: data.output?.length,
    usage: data.usage
  })

  // Responses API uses 'output' array instead of 'choices'
  if (!data.output || data.output.length === 0) {
    console.error('No output in Responses API response:', data)
    throw new Error(`No output in Responses API response: ${JSON.stringify(data)}`)
  }

  // Convert Responses API format to Chat Completions format for compatibility
  // Responses API output can be: function_call, message, or other types
  const output = data.output[0]

  let aiMessage: any
  let hasFunctionCall = false

  if (output.type === 'function_call') {
    hasFunctionCall = true
    // Convert function_call to tool_calls format for processing
    aiMessage = {
      role: 'assistant',
      content: '', // Responses API requires string, not null
      tool_calls: [{
        id: output.call_id,
        type: 'function',
        function: {
          name: output.name,
          arguments: output.arguments
        }
      }]
    }
  } else if (output.type === 'message') {
    // Regular text message
    // Responses API may return content as object with {type, text} or as string
    let messageContent = ''
    if (typeof output.content === 'string') {
      messageContent = output.content
    } else if (output.content && typeof output.content === 'object' && 'text' in output.content) {
      messageContent = output.content.text
    } else if (output.text) {
      messageContent = typeof output.text === 'string' ? output.text : (output.text.text || '')
    }

    aiMessage = {
      role: 'assistant',
      content: messageContent
    }
  } else {
    // Unknown output type
    console.error('Unknown Responses API output type:', output.type)
    aiMessage = {
      role: 'assistant',
      content: JSON.stringify(output)
    }
  }

  // Handle function calls with iteration
  const maxIterations = 5
  let iterations = 0

  while (aiMessage.tool_calls && iterations < maxIterations) {
    iterations++

    // Execute all function calls in parallel
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

    // Add assistant message (without tool_calls for Responses API) and function results
    // Responses API doesn't accept tool_calls in input, and doesn't support role: 'tool'
    // Instead, we send function results as 'user' messages
    inputMessages.push({
      role: 'assistant',
      content: ''
    })

    // Add function results as user messages (Responses API doesn't support role: 'tool')
    functionResults.forEach(result => {
      inputMessages.push({
        role: 'user',
        content: `Function ${result.name} returned: ${result.content}`
      })
    })

    // Call Responses API again with function results
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: inputMessages, // Responses API uses 'input' not 'messages'
        tools: availableFunctions.map(fn => ({
          type: 'function',
          ...fn, // Spread name, description, parameters directly
        })),
        temperature,
        // Note: Responses API does not support max_tokens parameter
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI Responses API error (iteration):', response.status, errorData)

      // Parse error for better user feedback
      try {
        const errorJson = JSON.parse(errorData)
        const errorMessage = errorJson.error?.message || errorJson.error || 'Unknown error'
        throw new Error(`OpenAI Responses API error (${response.status}): ${errorMessage}`)
      } catch (parseError) {
        throw new Error(`OpenAI Responses API request failed with status ${response.status}: ${errorData}`)
      }
    }

    data = await response.json()

    // Parse Responses API output
    if (!data.output || data.output.length === 0) {
      throw new Error('No output in Responses API iteration response')
    }

    const iterationOutput = data.output[0]
    if (iterationOutput.type === 'function_call') {
      aiMessage = {
        role: 'assistant',
        content: '', // Responses API requires string, not null
        tool_calls: [{
          id: iterationOutput.call_id,
          type: 'function',
          function: {
            name: iterationOutput.name,
            arguments: iterationOutput.arguments
          }
        }]
      }
    } else if (iterationOutput.type === 'message') {
      // Extract text content properly
      let messageContent = ''
      if (typeof iterationOutput.content === 'string') {
        messageContent = iterationOutput.content
      } else if (iterationOutput.content && typeof iterationOutput.content === 'object' && 'text' in iterationOutput.content) {
        messageContent = iterationOutput.content.text
      } else if (iterationOutput.text) {
        messageContent = typeof iterationOutput.text === 'string' ? iterationOutput.text : (iterationOutput.text.text || '')
      }

      aiMessage = {
        role: 'assistant',
        content: messageContent
      }
    } else {
      aiMessage = {
        role: 'assistant',
        content: JSON.stringify(iterationOutput)
      }
    }
  }

  // Ensure we have content (not tool_calls)
  const finalResponse = aiMessage.content || (aiMessage.tool_calls ? 'Processing function calls...' : 'No response generated.')

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
      await supabase
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
        ] as any)
    }
  } catch (dbError) {
    console.error('Failed to save conversation:', dbError)
  }

  return NextResponse.json({
    response: finalResponse,
    usage: data.usage,
  })
}
