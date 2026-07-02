import { z } from 'zod'
import { ToolDefinition } from '../types'
import { textToDocx, markdownToPdf, generateReceipt, htmlToPdf, jsonToExcel } from '@/lib/tools/document-tools'
import { createServiceClient } from '@/lib/supabase/server'

export const documentTools: ToolDefinition[] = [
  {
    name: 'text_to_docx',
    description: 'Convert plain text to Microsoft Word document',
    inputSchema: z.object({
      text: z.string().min(1).describe('Plain text content'),
      title: z.string().optional().describe('Document title'),
      fontSize: z.number().int().positive().optional().describe('Font size'),
    }),
    handler: async (input, context) => {
      try {
        const result = await textToDocx(input, context.userId, context.executionId)
        
        // Get file content for client-side download
        const supabase = createServiceClient()
        const storagePath = `${context.userId}/${context.executionId}/${result.filename}`
        const { data: fileData } = await supabase.storage
          .from('outputs')
          .download(storagePath)
        
        let base64Content = ''
        if (fileData) {
          const buffer = Buffer.from(await fileData.arrayBuffer())
          base64Content = buffer.toString('base64')
        }
        
        return {
          content: [
            {
              type: 'text' as const,
              text: `✅ DOCX document created successfully!

📄 Filename: ${result.filename}
🔗 URL: ${result.outputUrl}

File saved to dashboard. Kiro IDE will save this file locally.`,
            },
            {
              type: 'resource' as const,
              resource: {
                uri: `file:///${result.filename}`,
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                blob: base64Content,
              }
            }
          ],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Text to DOCX conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
  {
    name: 'markdown_to_pdf',
    description: 'Convert Markdown text to PDF document',
    inputSchema: z.object({
      markdown: z.string().min(1).describe('Markdown content'),
      title: z.string().optional().describe('Document title'),
      pageSize: z.string().optional().describe('Page size (A4, Letter)'),
    }),
    handler: async (input, context) => {
      try {
        const result = await markdownToPdf(input, context.userId, context.executionId)
        
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
              text: `✅ PDF created successfully from Markdown!

📄 Filename: ${result.filename}
🔗 Online URL: ${result.outputUrl}

The PDF has been generated and is ready to download.`,
            },
            {
              type: 'resource' as const,
              resource: {
                uri: result.outputUrl,
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
            text: `Markdown to PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
  {
    name: 'generate_receipt',
    description: 'Generate a professional receipt document',
    inputSchema: z.object({
      receiptNumber: z.string().describe('Receipt number'),
      date: z.string().describe('Receipt date'),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        price: z.number(),
      })).describe('Receipt items'),
      total: z.number().describe('Total amount'),
      from: z.object({
        name: z.string(),
        address: z.string().optional(),
        email: z.string().optional(),
      }).describe('Sender information'),
      to: z.object({
        name: z.string(),
        address: z.string().optional(),
        email: z.string().optional(),
      }).describe('Recipient information'),
    }),
    handler: async (input, context) => {
      try {
        const result = await generateReceipt(input, context.userId, context.executionId)
        
        return {
          content: [{
            type: 'text' as const,
            text: `✅ Receipt generated successfully!

📄 Receipt #: ${input.receiptNumber}
💰 Total: $${input.total.toFixed(2)}
📄 Filename: ${result.filename}
🔗 Download URL: ${result.outputUrl}

The receipt has been saved to your dashboard Files section.`,
          }],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Receipt generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
  {
    name: 'html_to_pdf',
    description: 'Convert HTML content to PDF document',
    inputSchema: z.object({
      html: z.string().min(1).describe('HTML content'),
      title: z.string().optional().describe('Document title'),
      pageSize: z.string().optional().describe('Page size (A4, Letter)'),
    }),
    handler: async (input, context) => {
      try {
        const result = await htmlToPdf(input, context.userId, context.executionId)
        
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
              text: `✅ PDF created successfully from HTML!

📄 Filename: ${result.filename}
🔗 Online URL: ${result.outputUrl}

The PDF has been generated and is ready to download.`,
            },
            {
              type: 'resource' as const,
              resource: {
                uri: result.outputUrl,
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
            text: `HTML to PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
  {
    name: 'json_to_excel',
    description: 'Convert JSON data to Excel spreadsheet (CSV format)',
    inputSchema: z.object({
      data: z.array(z.record(z.string(), z.any())).describe('Array of JSON objects'),
      sheetName: z.string().optional().describe('Sheet name'),
    }),
    handler: async (input, context) => {
      try {
        const result = await jsonToExcel(input, context.userId, context.executionId)
        
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
              text: `✅ Excel/CSV file created successfully!

📄 Filename: ${result.filename}
📊 Rows: ${input.data.length}
🔗 Online URL: ${result.outputUrl}

The file has been generated and is ready to download.`,
            },
            {
              type: 'resource' as const,
              resource: {
                uri: result.outputUrl,
                mimeType: 'text/csv',
                text: base64Content,
              },
            },
          ],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `JSON to Excel conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
]
