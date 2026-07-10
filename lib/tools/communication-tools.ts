import nodemailer from 'nodemailer'
import { createServiceClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/storage/upload'

// ─── Send Email via QStash ────────────────────────────────────────────────────
export async function sendEmail(
  input: {
    to: string
    subject: string
    body: string
    from?: string
    isHtml?: boolean
  },
  userId: string,
  executionId: string
): Promise<{ queued: boolean; messageId: string; deliveryNote: string }> {
  const { to, subject, body, from, isHtml = false } = input

  const qstashToken = process.env.QSTASH_TOKEN
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zebridge.vercel.app'
  const callbackUrl = `${appUrl}/v1/qstash/email`

  if (!qstashToken || qstashToken === 'your_qstash_token_here') {
    // Fall back to direct SMTP if QStash not configured
    return sendEmailDirect({ to, subject, body, from, isHtml }, userId, executionId)
  }

  const payload = { to, subject, body, from, isHtml, userId, executionId }

  const response = await fetch(`https://qstash.upstash.io/v2/publish/${callbackUrl}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${qstashToken}`,
      'Content-Type': 'application/json',
      'Upstash-Retries': '3',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`QStash enqueue failed: ${err}`)
  }

  const data = await response.json()

  return {
    queued: true,
    messageId: data.messageId || executionId,
    deliveryNote: `Email to ${to} queued via QStash. Will be delivered with automatic retries.`,
  }
}

// ─── Direct SMTP fallback ─────────────────────────────────────────────────────
export async function sendEmailDirect(
  input: {
    to: string
    subject: string
    body: string
    from?: string
    isHtml?: boolean
  },
  userId: string,
  executionId: string
): Promise<{ queued: boolean; messageId: string; deliveryNote: string }> {
  const { to, subject, body, from, isHtml = false } = input

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const info = await transporter.sendMail({
    from: from || process.env.SMTP_FROM || 'noreply@zebridge.com',
    to,
    subject,
    [isHtml ? 'html' : 'text']: body,
  })

  return {
    queued: false,
    messageId: info.messageId,
    deliveryNote: `Email sent directly via SMTP to ${to}.`,
  }
}

// ─── Send Slack / Discord Webhook ────────────────────────────────────────────
export async function sendWebhook(
  input: {
    webhookUrl: string
    message: string
    username?: string
    avatarUrl?: string
    platform?: 'slack' | 'discord' | 'generic'
  },
  userId: string,
  executionId: string
): Promise<{ success: boolean; status: number; platform: string }> {
  const { webhookUrl, message, username = 'ZeBridge', avatarUrl, platform = 'generic' } = input

  let payload: Record<string, unknown>

  if (platform === 'discord') {
    payload = {
      content: message,
      username,
      ...(avatarUrl && { avatar_url: avatarUrl }),
    }
  } else if (platform === 'slack') {
    payload = {
      text: message,
      username,
      ...(avatarUrl && { icon_url: avatarUrl }),
    }
  } else {
    payload = { message, username }
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Webhook delivery failed (${response.status}): ${errText}`)
  }

  return {
    success: true,
    status: response.status,
    platform,
  }
}

// ─── Generate HTML Email Template ────────────────────────────────────────────
export async function generateEmailTemplate(
  input: {
    subject: string
    heading: string
    body: string
    ctaText?: string
    ctaUrl?: string
    footerText?: string
    primaryColor?: string
  },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string; html: string }> {
  const {
    subject,
    heading,
    body,
    ctaText,
    ctaUrl,
    footerText = 'You received this email from ZeBridge.',
    primaryColor = '#4ade80',
  } = input

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: ${primaryColor}; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 36px 40px; }
    .content p { margin: 0 0 20px; font-size: 15px; color: #374151; line-height: 1.7; }
    .cta-btn { display: inline-block; margin-top: 8px; padding: 14px 32px; background: ${primaryColor}; color: #0f172a; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 8px; }
    .footer { padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>${heading}</h1></div>
    <div class="content">
      <p>${body.replace(/\n/g, '<br/>')}</p>
      ${ctaText && ctaUrl ? `<a href="${ctaUrl}" class="cta-btn">${ctaText}</a>` : ''}
    </div>
    <div class="footer">${footerText}</div>
  </div>
</body>
</html>`

  const filename = `email-template-${Date.now()}.html`
  const result = await uploadFile(
    userId,
    executionId,
    Buffer.from(html),
    filename,
    'text/html',
    'outputs'
  )

  return { outputUrl: result.publicUrl, filename, html }
}
