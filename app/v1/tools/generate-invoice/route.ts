import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { generateInvoice } from '@/lib/tools/ai-tools'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const GenerateInvoiceSchema = z.object({
  invoiceNumber: z.string(),
  date: z.string(),
  from: z.object({
    name: z.string(),
    address: z.string(),
    email: z.string().email(),
  }),
  to: z.object({
    name: z.string(),
    address: z.string(),
    email: z.string().email(),
  }),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })),
  currency: z.string().default('USD'),
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
    const input = GenerateInvoiceSchema.parse(body)

    const supabase = createServiceClient()
    
    // Create execution record
    const { data: execution } = await supabase
      .from('executions')
      .insert({
        user_id: authContext.userId,
        api_key_id: authContext.apiKeyId,
        tool_slug: 'generate-invoice',
        input_params: { invoiceNumber: input.invoiceNumber, itemCount: input.items.length },
        status: 'processing',
      })
      .select('id')
      .single()

    if (!execution) throw new Error('Failed to create execution record')
    executionId = execution.id

    // Execute tool
    const result = await generateInvoice(input, authContext.userId, execution.id)
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

    console.error('Error in generate-invoice API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
