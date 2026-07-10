import { z } from 'zod'
import { ToolDefinition } from '../types'
import { sendEmail, sendWebhook, generateEmailTemplate } from '@/lib/tools/communication-tools'

export const communicationTools: ToolDefinition[] = [
  {
    name: 'send_email',
    description: 'Send an email to a recipient via SMTP with QStash queue for reliable delivery and automatic retries',
    inputSchema: z.object({
      to: z.string().email().describe('Recipient email address'),
      subject: z.string().min(1).describe('Email subject line'),
      body: z.string().min(1).describe('Email body content (plain text or HTML)'),
      from: z.string().email().optional().describe('Sender email address (optional, uses default if not set)'),
      isHtml: z.boolean().optional().describe('Whether body is HTML content'),
    }),
    handler: async (input, context) => {
      try {
        const result = await sendEmail(input, context.userId, context.executionId)
        return {
          content: [{
            type: 'text' as const,
            text: `✅ Email ${result.queued ? 'queued' : 'sent'} successfully!\n\n📧 To: ${input.to}\n📋 Subject: ${input.subject}\n🆔 Message ID: ${result.messageId}\n\n${result.deliveryNote}`,
          }],
        }
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Email send failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        }
      }
    },
  },
  {
    name: 'send_webhook',
    description: 'Send a message to a Slack channel, Discord server, or any custom webhook URL',
    inputSchema: z.object({
      webhookUrl: z.string().url().describe('Webhook URL (Slack, Discord, or custom)'),
      message: z.string().min(1).describe('Message content to send'),
      username: z.string().optional().describe('Display name for the message sender'),
      avatarUrl: z.string().url().optional().describe('Avatar image URL for the sender'),
      platform: z.enum(['slack', 'discord', 'generic']).optional().describe('Platform type for correct payload format'),
    }),
    handler: async (input, context) => {
      try {
        const result = await sendWebhook(input, context.userId, context.executionId)
        return {
          content: [{
            type: 'text' as const,
            text: `✅ Webhook delivered successfully!\n\n🎯 Platform: ${result.platform}\n📊 Status: ${result.status}\n\nMessage has been sent to the webhook endpoint.`,
          }],
        }
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Webhook delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        }
      }
    },
  },
  {
    name: 'generate_email_template',
    description: 'Generate a professional styled HTML email template from structured inputs',
    inputSchema: z.object({
      subject: z.string().min(1).describe('Email subject line'),
      heading: z.string().min(1).describe('Main heading shown in email body'),
      body: z.string().min(1).describe('Body paragraph content'),
      ctaText: z.string().optional().describe('Call-to-action button text'),
      ctaUrl: z.string().url().optional().describe('Call-to-action button URL'),
      footerText: z.string().optional().describe('Footer disclaimer text'),
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().describe('Primary hex color (e.g. #4ade80)'),
    }),
    handler: async (input, context) => {
      try {
        const result = await generateEmailTemplate(input, context.userId, context.executionId)
        return {
          content: [
            {
              type: 'text' as const,
              text: `✅ Email template generated!\n\n📄 Filename: ${result.filename}\n🔗 Download URL: ${result.outputUrl}\n\nHTML template is ready to use with send_email tool.`,
            },
            {
              type: 'resource' as const,
              resource: {
                uri: result.outputUrl,
                mimeType: 'text/html',
                text: result.html,
              },
            },
          ],
        }
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Email template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        }
      }
    },
  },
]
