import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { generateReceipt } from '@/lib/tools/document-tools'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const GenerateReceiptSchema = z.object({
  receiptNumber: z.string(),
  date: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  total: z.number(),
  from: z.object({
    name: z.string(),
    address: z.string().optional(),
    email: z.string().optional(),
  }),
  to: z.object({
    name: z.string(),
    address: z.string().optional(),
    email: z.string().optional(),
  }),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()
    const input = GenerateReceiptSchema.parse(body)

    const supabase = createServiceClient()
    
    const { data: execution } = await supabase
      .from('executions')
      .insert({
        user_id: authContext.userId,
        api_key_id: authContext.apiKeyId,
        tool_slug: 'generate-receipt',
        input_params: input,
        status: 'processing',
      })
      .select('id')
      .single()

    if (!execution) throw new Error('Failed to create execution record')

    const result = await generateReceipt(input, authContext.userId, execution.id)
    const duration = Date.now() - startTime

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

    console.error('Error in generate-receipt API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
