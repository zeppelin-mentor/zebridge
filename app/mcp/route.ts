import { NextRequest, NextResponse } from 'next/server'
import { createMCPServer } from '@/lib/mcp/server'
import { registerTools } from '@/lib/mcp/tools/registry'
import { pdfTools } from '@/lib/mcp/tools/pdf-tools'
import { imageTools } from '@/lib/mcp/tools/image-tools'
import { aiTools } from '@/lib/mcp/tools/ai-tools'
import { validateApiKey } from '@/lib/auth/api-key'
import { checkRateLimit } from '@/lib/auth/rate-limit'

// Create MCP server instance
const mcpServer = createMCPServer()

// Register all tools
registerTools(mcpServer, [...pdfTools, ...imageTools, ...aiTools])

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Check rate limit
    const { allowed } = await checkRateLimit(
      authContext.userId,
      authContext.plan
    )

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // For now, return a simple response
    // Full MCP implementation requires StreamableHTTPServerTransport
    return NextResponse.json({
      message: 'MCP server endpoint',
      tools: ['pdf_merge', 'pdf_split', 'pdf_to_word', 'remove_background', 'image_upscale', 'image_compress', 'generate_qrcode', 'ocr_extract_text', 'generate_invoice'],
    })

  } catch (error) {
    console.error('MCP server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Enable CORS for MCP clients
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
