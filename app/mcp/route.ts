import { NextRequest, NextResponse } from 'next/server'
import { createMCPServer } from '@/lib/mcp/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { checkRateLimit } from '@/lib/auth/rate-limit'

// Create MCP server instance (tools are already registered in createMCPServer)
const mcpServer = createMCPServer()

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
      version: '1.0.0',
      tools: [
        // PDF tools (4)
        'pdf_merge',
        'pdf_split',
        'pdf_to_word',
        'markdown_to_pdf',
        'html_to_pdf',
        // Image tools (2)
        'remove_background',
        'image_upscale',
        // Document tools (3)
        'text_to_docx',
        'json_to_excel',
        'generate_receipt',
        // AI tools (3)
        'generate_qrcode',
        'ocr_extract_text',
        'generate_invoice',
      ],
      totalTools: 12,
      endpoints: {
        pdf: ['/v1/tools/pdf-merge', '/v1/tools/pdf-split', '/v1/tools/markdown-to-pdf', '/v1/tools/html-to-pdf'],
        images: ['/v1/tools/remove-background', '/v1/tools/image-upscale'],
        office: ['/v1/tools/text-to-docx', '/v1/tools/json-to-excel', '/v1/tools/generate-receipt'],
        ai: ['/v1/tools/generate-qrcode', '/v1/tools/ocr-extract-text', '/v1/tools/generate-invoice'],
      },
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
