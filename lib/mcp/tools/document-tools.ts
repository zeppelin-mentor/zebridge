import { z } from 'zod'
import { ToolDefinition } from '../types'
import { textToDocx, markdownToPdf, generateReceipt, htmlToPdf, jsonToExcel } from '@/lib/tools/document-tools'

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
        
        return {
          content: [{
            type: 'text' as const,
            text: `DOCX created successfully. Output: ${result.outputUrl}`,
          }],
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
        
        return {
          content: [{
            type: 'text' as const,
            text: `PDF created successfully from Markdown. Output: ${result.outputUrl}`,
          }],
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
            text: `Receipt generated successfully. Output: ${result.outputUrl}`,
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
        
        return {
          content: [{
            type: 'text' as const,
            text: `PDF created successfully from HTML. Output: ${result.outputUrl}`,
          }],
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
        
        return {
          content: [{
            type: 'text' as const,
            text: `Excel file created successfully. Output: ${result.outputUrl}`,
          }],
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
