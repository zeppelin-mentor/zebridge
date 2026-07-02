import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ToolDefinition } from '../types'

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
        })
      }
    )
  }
}
