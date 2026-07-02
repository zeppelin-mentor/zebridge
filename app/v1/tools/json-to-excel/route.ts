import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { jsonToExcel } from '@/lib/tools/document-tools'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const JsonToExcelSchema = z.object({
  data: z.array(z.record(z.string(), z.any())).min(1),
  sheetName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()
    const input = JsonToExcelSchema.parse(body)

    const supabase = createServiceClient()
    
    // Create execution record
    const { data: execution } = await supabase
      .from('executions')
      .insert({
        user_id: authContext.userId,
        api_key_id: authContext.apiKeyId,
        tool_slug: 'json-to-excel',
        input_params: { sheetName: input.sheetName, rowCount: input.data.length },
        status: 'processing',
      })
      .select('id')
      .single()

    if (!execution) throw new Error('Failed to create execution record')

    // Execute tool
    const result = await jsonToExcel(input, authContext.userId, execution.id)
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

    console.error('Error in json-to-excel API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
