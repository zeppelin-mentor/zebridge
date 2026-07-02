import { z } from 'zod'
import { ToolDefinition } from '../types'
import { mergePdf, splitPdf, pdfToWord } from '@/lib/tools/pdf-tools'

export const pdfTools: ToolDefinition[] = [
  {
    name: 'pdf_merge',
    description: 'Merge multiple PDF files into a single PDF',
    inputSchema: z.object({
      pdfUrls: z.array(z.string().url()).min(2).max(10).describe('Array of PDF URLs to merge'),
      outputFilename: z.string().optional().describe('Optional output filename'),
    }),
    handler: async (input, context) => {
      const result = await mergePdf(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `PDF merge completed. Output: ${result.outputUrl}. Pages: ${result.pageCount}`,
        }],
      }
    },
  },
  {
    name: 'pdf_split',
    description: 'Split a PDF into individual pages or ranges',
    inputSchema: z.object({
      pdfUrl: z.string().url().describe('URL of the PDF to split'),
      ranges: z.array(z.object({
        start: z.number().int().positive(),
        end: z.number().int().positive(),
      })).optional().describe('Page ranges to extract (optional, defaults to individual pages)'),
    }),
    handler: async (input, context) => {
      const result = await splitPdf(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `PDF split completed. ${result.files?.length || 0} files created.`,
        }],
      }
    },
  },
  {
    name: 'pdf_to_word',
    description: 'Convert PDF to Word (DOCX) format',
    inputSchema: z.object({
      pdfUrl: z.string().url().describe('URL of the PDF to convert'),
      preserveFormatting: z.boolean().default(true).describe('Preserve original formatting'),
    }),
    handler: async (input, context) => {
      const result = await pdfToWord(input, context.userId, context.executionId)

      return {
        content: [{
          type: 'text',
          text: `PDF to Word conversion completed. Output: ${result.outputUrl}`,
        }],
      }
    },
  },
]
