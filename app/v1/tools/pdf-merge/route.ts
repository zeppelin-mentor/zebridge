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
    const { data: tool } = await supabase
      .from('tools')
      .select('id')
      .eq('slug', 'pdf-merge')
      .single()

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    const { data: execution } = await supabase
      .from('executions')
      .insert({
        user_id: authContext.userId,
        tool_id: tool.id,
        status: 'processing',
        input_params: validatedInput,
      })
      .select()
      .single()

    const startTime = Date.now()
    
    try {
      const result = await mergePdf(validatedInput, authContext.userId, execution!.id)

      await supabase
        .from('executions')
        .update({
          status: 'completed',
          output_metadata: result,
          duration: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution!.id)

      await incrementUsage(authContext.userId)

      return NextResponse.json({
        executionId: execution!.id,
        status: 'completed',
        output: result,
        duration: Date.now() - startTime,
      }, {
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      })

    } catch (toolError) {
      await supabase
        .from('executions')
        .update({
          status: 'failed',
          error: toolError instanceof Error ? toolError.message : 'Unknown error',
          duration: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution!.id)

      throw toolError
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    console.error('Error in pdf-merge API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
