import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerTools } from './tools/registry'
import { pdfTools } from './tools/pdf-tools'
import { imageTools } from './tools/image-tools'
import { aiTools } from './tools/ai-tools'
import { documentTools } from './tools/document-tools'

export function createMCPServer() {
  const server = new McpServer({
    name: 'ZeBridge MCP Server',
    version: '1.0.0',
  })

  // Register all tools
  registerTools(server, [
    ...pdfTools,
    ...imageTools,
    ...aiTools,
    ...documentTools,
  ])

  return server
}
