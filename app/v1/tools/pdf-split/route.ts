import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { splitPdf } from '@/lib/tools/pdf-tools'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SplitPdfSchema = z.object({
  pdfUrl: z.string().url(),
  ranges: z.array(z.object({
    start: z.number().int().positive(),
    end: z.number().int().positive(),
  })).optional(),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let executionId: string | null = null
  
  try {
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()
    const input = SplitPdfSchema.parse(body)

    const supabase = createServiceClient()
    
    // Create execution record
    const { data: execution } = await supabase
      .from('executions')
      .insert({
        user_id: authContext.userId,
        api_key_id: authContext.apiKeyId,
        tool_slug: 'pdf-split',
        input_params: input,
        status: 'processing',
      })
      .select('id')
      .single()

    if (!execution) throw new Error('Failed to create execution record')
    executionId = execution.id

    // Execute tool
    const result = await splitPdf(input, authContext.userId, execution.id)
    const duration = Date.now() - startTime

    // Update execution record
    await supabase
      .from('executions')
      .update({
        status: 'success',
        output_metadata: { files: result.files, fileCount: result.files.length },
        duration_ms: duration,
        completed_at: new Date().toISOString(),
      })
      .eq('id', execution.id)

    return NextResponse.json({
      success: true,
      data: result,
      executionId: execution.id,
    })

  } catch (error) {
    // Update execution record with error if it was created
    if (executionId) {
      const supabase = createServiceClient()
      const duration = Date.now() - startTime
      await supabase
        .from('executions')
        .update({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          duration_ms: duration,
          completed_at: new Date().toISOString(),
        })
        .eq('id', executionId)
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }

    console.error('Error in pdf-split API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
