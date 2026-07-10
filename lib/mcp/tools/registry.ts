import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ToolDefinition } from '../types'
import { pdfTools } from './pdf-tools'
import { imageTools } from './image-tools'
import { documentTools } from './document-tools'
import { aiTools } from './ai-tools'
import { communicationTools } from './communication-tools'
import { officeTools } from './office-tools'

// Export all tools as a flat array
export const toolRegistry: ToolDefinition[] = [
  ...pdfTools,
  ...imageTools,
  ...documentTools,
  ...aiTools,
  ...communicationTools,
  ...officeTools,
]

export function registerTools(server: McpServer, tools: ToolDefinition[]) {
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (input) => {
        return await tool.handler(input, {
          userId: 'system', // Will be populated from auth context
          executionId: 'pending',
          apiKeyId: 'system',
        })
      }
    )
  }
}
