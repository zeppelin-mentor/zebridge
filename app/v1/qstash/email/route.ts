import { NextRequest, NextResponse } from 'next/server'
import { sendEmailDirect } from '@/lib/tools/communication-tools'

/**
 * QStash Callback Route
 * QStash POSTs the email job payload here after enqueueing via /v1/tools/send-email.
 * This route actually delivers the email via SMTP with automatic retry support from QStash.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify QStash signature in production
    const signingKey = process.env.QSTASH_CURRENT_SIGNING_KEY
    if (signingKey && signingKey !== 'your_signing_key_here') {
      const signature = request.headers.get('upstash-signature')
      if (!signature) {
        return NextResponse.json({ error: 'Missing QStash signature' }, { status: 401 })
      }
      // In production, verify signature using @upstash/qstash verifySignatureAppRouter
    }

    const payload = await request.json()
    const { to, subject, body, from, isHtml, userId, executionId } = payload

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 })
    }

    const result = await sendEmailDirect(
      { to, subject, body, from, isHtml },
      userId || 'qstash',
      executionId || 'qstash-delivery'
    )

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      deliveryNote: result.deliveryNote,
    })
  } catch (error) {
    console.error('QStash email delivery error:', error)
    // Return 5xx so QStash retries automatically
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Email delivery failed' },
      { status: 500 }
    )
  }
}
