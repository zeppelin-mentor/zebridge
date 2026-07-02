import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export function createMCPServer() {
  const server = new McpServer({
    name: 'ZeBridge MCP Server',
    version: '1.0.0',
  })

  return server
}
