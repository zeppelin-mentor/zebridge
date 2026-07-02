import { z } from 'zod'
import { ToolDefinition } from '../types'
import { generateQRCode, ocrImage, generateInvoice } from '@/lib/tools/ai-tools'
import { createServiceClient } from '@/lib/supabase/server'

export const aiTools: ToolDefinition[] = [
  {
    name: 'generate_qrcode',
    description: 'Generate a QR code from text or URL',
    inputSchema: z.object({
      data: z.string().describe('Data to encode in the QR code'),
      size: z.number().int().positive().default(256).describe('Size of the QR code in pixels'),
    }),
    handler: async (input, context) => {
      try {
        const result = await generateQRCode(input, context.userId, context.executionId)

        const supabase = createServiceClient()
        const storagePath = `${context.userId}/${context.executionId}/${result.filename}`
        const { data: fileData } = await supabase.storage
          .from('outputs')
          .download(storagePath)
        
        if (!fileData) {
          throw new Error('Failed to retrieve file content')
        }
        
        const buffer = Buffer.from(await fileData.arrayBuffer())
        const base64Content = buffer.toString('base64')

        return {
          content: [
            {
              type: 'text' as const,
              text: `✅ QR code generated successfully!

📱 Data: ${input.data}
📏 Size: ${input.size || 256}px
📄 Filename: ${result.filename}
🔗 Online URL: ${result.outputUrl}

The QR code image has been created and is ready to download.`,
            },
            {
              type: 'resource' as const,
              resource: {
                uri: result.outputUrl,
                mimeType: 'image/png',
                text: base64Content,
              },
            },
          ],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
  {
    name: 'ocr_extract_text',
    description: 'Extract text from an image using OCR',
    inputSchema: z.object({
      imageUrl: z.string().url().describe('URL of the image to extract text from'),
      language: z.string().default('eng').describe('Language code (e.g., eng, fra, spa)'),
    }),
    handler: async (input, context) => {
      try {
        const result = await ocrImage(input, context.userId, context.executionId)
        
        return {
          content: [{
            type: 'text' as const,
            text: `OCR completed. Extracted text: ${result?.text || 'No text extracted'}`,
          }],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
  {
    name: 'generate_invoice',
    description: 'Generate a professional invoice PDF',
    inputSchema: z.object({
      invoiceNumber: z.string().describe('Invoice number'),
      date: z.string().describe('Invoice date'),
      from: z.object({
        name: z.string(),
        address: z.string(),
        email: z.string().email(),
      }).describe('Sender information'),
      to: z.object({
        name: z.string(),
        address: z.string(),
        email: z.string().email(),
      }).describe('Recipient information'),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.number().positive(),
        price: z.number().positive(),
      })).describe('Invoice items'),
      currency: z.string().default('USD').describe('Currency code'),
    }),
    handler: async (input, context) => {
      try {
        const result = await generateInvoice(input, context.userId, context.executionId)

        const supabase = createServiceClient()
        const storagePath = `${context.userId}/${context.executionId}/${result.filename}`
        const { data: fileData } = await supabase.storage
          .from('outputs')
          .download(storagePath)
        
        if (!fileData) {
          throw new Error('Failed to retrieve file content')
        }
        
        const buffer = Buffer.from(await fileData.arrayBuffer())
        const base64Content = buffer.toString('base64')

        return {
          content: [
            {
              type: 'text' as const,
              text: `✅ Invoice generated successfully!

📄 Invoice #: ${input.invoiceNumber}
💼 From: ${input.from.name}
🏢 To: ${input.to.name}
📄 Filename: ${result.filename}
🔗 Online URL: ${result.outputUrl || 'Unknown URL'}

The invoice PDF has been created and is ready to download.`,
            },
            {
              type: 'resource' as const,
              resource: {
                uri: result.outputUrl || '',
                mimeType: 'application/pdf',
                text: base64Content,
              },
            },
          ],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Invoice generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
]
