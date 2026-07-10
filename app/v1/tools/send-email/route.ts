import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/tools/communication-tools'
import { z } from 'zod'

const Schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  from: z.string().email().optional(),
  isHtml: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let executionId: string | null = null
  try {
    const authContext = await validateApiKey(request)
    if (!authContext) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

    const body = await request.json()
    const input = Schema.parse(body)
    const supabase = createServiceClient()

    const { data: execution } = await supabase
      .from('executions')
      .insert({ user_id: authContext.userId, api_key_id: authContext.apiKeyId, tool_slug: 'send-email', input_params: { to: input.to, subject: input.subject }, status: 'processing' })
      .select('id').single()

    if (!execution) throw new Error('Failed to create execution record')
    executionId = execution.id

    const result = await sendEmail(input, authContext.userId, execution.id)
    const duration = Date.now() - startTime

    await supabase.from('executions').update({ status: 'success', output_metadata: result, duration_ms: duration, completed_at: new Date().toISOString() }).eq('id', execution.id)

    return NextResponse.json({ success: true, data: result, executionId: execution.id })
  } catch (error) {
    if (executionId) {
      const supabase = createServiceClient()
      await supabase.from('executions').update({ status: 'error', error: error instanceof Error ? error.message : 'Unknown error', duration_ms: Date.now() - startTime, completed_at: new Date().toISOString() }).eq('id', executionId)
    }
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    console.error('Error in send-email API:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}
