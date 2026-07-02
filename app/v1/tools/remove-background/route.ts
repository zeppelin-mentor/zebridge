import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { checkRateLimit, incrementUsage } from '@/lib/auth/rate-limit'
import { createServiceClient } from '@/lib/supabase/server'
import { RemoveBackgroundSchema } from '@/lib/utils/validation'
import { removeBackground } from '@/lib/tools/image-tools'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // 2. Check rate limit
    const { allowed, remaining } = await checkRateLimit(
      authContext.userId,
      authContext.plan
    )

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', remaining: 0 },
        { status: 429 }
      )
    }

    // 3. Parse and validate input
    const body = await request.json()
    const validatedInput = RemoveBackgroundSchema.parse(body)

    // 4. Create execution record
    const supabase = createServiceClient()
    
    const { data: tool } = await supabase
      .from('tools')
      .select('id')
      .eq('slug', 'remove-background')
      .single()

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    const { data: execution, error: execError } = await supabase
      .from('executions')
      .insert({
        user_id: authContext.userId,
        tool_id: tool.id,
        status: 'processing',
        input_params: validatedInput, // Store only parameters
      })
      .select()
      .single()

    if (execError) {
      throw execError
    }

    // 5. Process the tool directly (synchronously)
    const startTime = Date.now()
    
    try {
      const result = await removeBackground(
        validatedInput,
        authContext.userId,
        execution.id
      )

      // Update execution with result (store only metadata)
      await supabase
        .from('executions')
        .update({
          status: 'completed',
          output_metadata: result, // Only metadata, not full files
          duration: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id)

      // Increment usage
      await incrementUsage(authContext.userId)

      // Return successful response
      return NextResponse.json({
        executionId: execution.id,
        status: 'completed',
        output: result,
        duration: Date.now() - startTime,
      }, {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      })

    } catch (toolError) {
      // Update execution with error
      await supabase
        .from('executions')
        .update({
          status: 'failed',
          error: toolError instanceof Error ? toolError.message : 'Unknown error',
          duration: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id)

      throw toolError
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in remove-background API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
