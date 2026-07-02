import { z } from 'zod'

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: z.ZodType<any>
  handler: (input: any, context: ToolContext) => Promise<ToolResult>
}

export interface ToolContext {
  userId: string
  executionId: string
}

export interface ToolResult {
  content: Array<{ 
    type: 'text' | 'image'
    text?: string
    data?: string
    mimeType?: string 
  }>
}
