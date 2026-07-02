import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { checkRateLimit, incrementUsage } from '@/lib/auth/rate-limit'
import { createServiceClient } from '@/lib/supabase/server'
import { PdfMergeSchema } from '@/lib/utils/validation'
import { mergePdf } from '@/lib/tools/pdf-tools'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { allowed, remaining } = await checkRateLimit(authContext.userId, authContext.plan)
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const validatedInput = PdfMergeSchema.parse(body)

    const supabase = createServiceClient()

    const { data: execution } = await supabase
      .from('executions')
      .insert({
        user_id: authContext.userId,
        api_key_id: authContext.apiKeyId,
        tool_slug: 'pdf-merge',
        status: 'processing',
        input_params: validatedInput,
      })
      .select('id')
      .single()

    if (!execution) throw new Error('Failed to create execution record')

    const startTime = Date.now()
    
    try {
      const result = await mergePdf(validatedInput, authContext.userId, execution.id)
      const duration = Date.now() - startTime

      await supabase
        .from('executions')
        .update({
          status: 'success',
          output_metadata: result,
          duration_ms: duration,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id)

      await incrementUsage(authContext.userId)

      return NextResponse.json({
        success: true,
        data: result,
        executionId: execution.id,
        duration,
      }, {
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      })

    } catch (toolError) {
      const duration = Date.now() - startTime
      await supabase
        .from('executions')
        .update({
          status: 'error',
          error: toolError instanceof Error ? toolError.message : 'Unknown error',
          duration_ms: duration,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id)

      throw toolError
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }

    console.error('Error in pdf-merge API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
