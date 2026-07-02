import { z } from 'zod'
import { ToolDefinition } from '../types'
import { generateQRCode, ocrImage, generateInvoice } from '@/lib/tools/ai-tools'

export const aiTools: ToolDefinition[] = [
  {
    name: 'generate_qrcode',
    description: 'Generate a QR code from text or URL',
    inputSchema: z.object({
      data: z.string().describe('Data to encode in the QR code'),
      size: z.number().int().positive().default(256).describe('Size of the QR code in pixels'),
    }),
    handler: async (input, context) => {
      const result = await generateQRCode(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `QR code generated successfully. Output: ${result.outputUrl}`,
        }],
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
      const result = await ocrImage(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `OCR completed. Extracted text: ${result.text}`,
        }],
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
      const result = await generateInvoice(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `Invoice generated successfully. Output: ${result.outputUrl}`,
        }],
      }
    },
  },
]
