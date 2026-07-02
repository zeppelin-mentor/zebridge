import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { htmlToPdf } from '@/lib/tools/document-tools'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const HtmlToPdfSchema = z.object({
  html: z.string().min(1),
  title: z.string().optional(),
  pageSize: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()
    const input = HtmlToPdfSchema.parse(body)

    const supabase = createServiceClient()
    
    // Create execution record
    const { data: execution } = await supabase
      .from('executions')
      .insert({
        user_id: authContext.userId,
        api_key_id: authContext.apiKeyId,
        tool_slug: 'html-to-pdf',
        input_params: input,
        status: 'processing',
      })
      .select('id')
      .single()

    if (!execution) throw new Error('Failed to create execution record')

    // Execute tool
    const result = await htmlToPdf(input, authContext.userId, execution.id)
    const duration = Date.now() - startTime

    // Update execution record
    await supabase
      .from('executions')
      .update({
        status: 'success',
        output_metadata: { outputUrl: result.outputUrl, filename: result.filename },
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }

    console.error('Error in html-to-pdf API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
