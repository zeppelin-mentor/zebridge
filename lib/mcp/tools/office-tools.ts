import { z } from 'zod'
import { ToolDefinition } from '../types'
import { generatePptx } from '@/lib/tools/office-tools'
import { docxToMarkdown, csvToJson, excelToJson, docxTemplateFiller } from '@/lib/tools/document-tools'
import { createServiceClient } from '@/lib/supabase/server'

export const officeTools: ToolDefinition[] = [
  {
    name: 'generate_pptx',
    description: 'Generate a professional PowerPoint presentation with multiple slides, bullet points, and themes',
    inputSchema: z.object({
      presentationTitle: z.string().min(1).describe('Title of the presentation'),
      author: z.string().optional().describe('Author name'),
      slides: z.array(z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        bullets: z.array(z.string()).optional(),
        layout: z.enum(['title-only', 'title-content', 'title-bullets']).optional(),
      })).min(1).max(50).describe('Array of slide definitions'),
      theme: z.enum(['dark', 'light', 'corporate']).optional().describe('Visual theme for the presentation'),
    }),
    handler: async (input, context) => {
      try {
        const result = await generatePptx(input, context.userId, context.executionId)
        const supabase = createServiceClient()
        const storagePath = `${context.userId}/${context.executionId}/${result.filename}`
        const { data: fileData } = await supabase.storage.from('outputs').download(storagePath)
        let base64Content = ''
        if (fileData) {
          base64Content = Buffer.from(await fileData.arrayBuffer()).toString('base64')
        }
        return {
          content: [
            { type: 'text' as const, text: `✅ PowerPoint presentation created!\n\n📊 Title: ${input.presentationTitle}\n📄 Slides: ${result.slideCount}\n📁 Filename: ${result.filename}\n🔗 URL: ${result.outputUrl}` },
            { type: 'resource' as const, resource: { uri: `file:///${result.filename}`, mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', blob: base64Content } },
          ],
        }
      } catch (error) {
        return { content: [{ type: 'text' as const, text: `PPTX generation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }], isError: true }
      }
    },
  },
  {
    name: 'docx_to_markdown',
    description: 'Convert a DOCX Word document to Markdown text format, preserving headings and structure',
    inputSchema: z.object({
      docxUrl: z.string().url().describe('URL to the DOCX file to convert'),
      includeHeadings: z.boolean().optional().describe('Preserve heading levels in markdown output'),
    }),
    handler: async (input, context) => {
      try {
        const result = await docxToMarkdown(input, context.userId, context.executionId)
        return {
          content: [
            { type: 'text' as const, text: `✅ DOCX converted to Markdown!\n\n📄 Filename: ${result.filename}\n🔗 URL: ${result.outputUrl}\n\n--- Markdown Preview ---\n${result.markdown.substring(0, 500)}${result.markdown.length > 500 ? '...' : ''}` },
          ],
        }
      } catch (error) {
        return { content: [{ type: 'text' as const, text: `DOCX to Markdown failed: ${error instanceof Error ? error.message : 'Unknown error'}` }], isError: true }
      }
    },
  },
  {
    name: 'csv_to_json',
    description: 'Convert CSV text data into a structured JSON array with automatic header detection',
    inputSchema: z.object({
      csv: z.string().min(1).describe('CSV content as a string'),
      delimiter: z.string().max(1).optional().describe('Column delimiter character (default: comma)'),
    }),
    handler: async (input, context) => {
      try {
        const result = await csvToJson(input, context.userId, context.executionId)
        return {
          content: [
            { type: 'text' as const, text: `✅ CSV converted to JSON!\n\n📊 Rows: ${result.rowCount}\n📄 Filename: ${result.filename}\n🔗 URL: ${result.outputUrl}\n\n--- JSON Preview ---\n${JSON.stringify(result.data.slice(0, 3), null, 2)}` },
          ],
        }
      } catch (error) {
        return { content: [{ type: 'text' as const, text: `CSV to JSON failed: ${error instanceof Error ? error.message : 'Unknown error'}` }], isError: true }
      }
    },
  },
  {
    name: 'excel_to_json',
    description: 'Fetch a CSV or Excel file from a URL and convert it to a structured JSON array',
    inputSchema: z.object({
      fileUrl: z.string().url().describe('URL to the CSV or Excel file'),
      delimiter: z.string().max(1).optional().describe('Column delimiter character (default: comma)'),
    }),
    handler: async (input, context) => {
      try {
        const result = await excelToJson(input, context.userId, context.executionId)
        return {
          content: [
            { type: 'text' as const, text: `✅ Excel/CSV converted to JSON!\n\n📊 Rows: ${result.rowCount}\n📄 Filename: ${result.filename}\n🔗 URL: ${result.outputUrl}` },
          ],
        }
      } catch (error) {
        return { content: [{ type: 'text' as const, text: `Excel to JSON failed: ${error instanceof Error ? error.message : 'Unknown error'}` }], isError: true }
      }
    },
  },
  {
    name: 'docx_template_filler',
    description: 'Fill variable placeholders in a DOCX Word template with dynamic values using {variable} syntax',
    inputSchema: z.object({
      templateUrl: z.string().url().describe('URL to the DOCX template file with {variable} placeholders'),
      variables: z.record(z.string(), z.string()).describe('Key-value map of variable names to their replacement values'),
    }),
    handler: async (input, context) => {
      try {
        const result = await docxTemplateFiller(input, context.userId, context.executionId)
        const supabase = createServiceClient()
        const storagePath = `${context.userId}/${context.executionId}/${result.filename}`
        const { data: fileData } = await supabase.storage.from('outputs').download(storagePath)
        let base64Content = ''
        if (fileData) {
          base64Content = Buffer.from(await fileData.arrayBuffer()).toString('base64')
        }
        return {
          content: [
            { type: 'text' as const, text: `✅ DOCX template filled successfully!\n\n📝 Variables merged: ${Object.keys(input.variables).length}\n📄 Filename: ${result.filename}\n🔗 URL: ${result.outputUrl}` },
            { type: 'resource' as const, resource: { uri: `file:///${result.filename}`, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', blob: base64Content } },
          ],
        }
      } catch (error) {
        return { content: [{ type: 'text' as const, text: `DOCX template fill failed: ${error instanceof Error ? error.message : 'Unknown error'}` }], isError: true }
      }
    },
  },
]
