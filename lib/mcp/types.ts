import { z } from 'zod'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: z.ZodType<any>
  handler: (input: any, context: ToolContext) => Promise<CallToolResult>
}

export interface ToolContext {
  userId: string
  executionId: string
}

export type ToolResult = CallToolResult

