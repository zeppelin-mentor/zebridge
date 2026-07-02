import { z } from 'zod'
import { ToolDefinition } from '../types'
import { mergePdf, splitPdf, pdfToWord } from '@/lib/tools/pdf-tools'
import { createServiceClient } from '@/lib/supabase/server'

export const pdfTools: ToolDefinition[] = [
  {
    name: 'pdf_merge',
    description: 'Merge multiple PDF files into a single PDF',
    inputSchema: z.object({
      pdfUrls: z.array(z.string().url()).min(2).max(10).describe('Array of PDF URLs to merge'),
      outputFilename: z.string().optional().describe('Optional output filename'),
    }),
    handler: async (input, context) => {
      try {
        const result = await mergePdf(input, context.userId, context.executionId)

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
              text: `✅ PDFs merged successfully!

📄 Output: ${result.filename}
📑 Total Pages: ${result.pageCount}
🔗 Online URL: ${result.outputUrl}

The merged PDF is ready to download.`,
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
            text: `PDF merge failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
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
      try {
        const result = await splitPdf(input, context.userId, context.executionId)

        return {
          content: [{
            type: 'text' as const,
            text: `PDF split completed. ${result.files?.length || 0} files created.`,
          }],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `PDF split failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
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
      try {
        const result = await pdfToWord(input, context.userId, context.executionId)

        return {
          content: [{
            type: 'text' as const,
            text: `PDF to Word conversion completed. Output: ${result.outputUrl}`,
          }],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `PDF to Word conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
]
