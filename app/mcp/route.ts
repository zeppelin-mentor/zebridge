import { NextRequest } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { checkRateLimit } from '@/lib/auth/rate-limit'
import { createServiceClient } from '@/lib/supabase/server'
import { toolRegistry } from '@/lib/mcp/tools/registry'

// Session management (simplified)
const sessions = new Map<string, { userId: string; createdAt: number }>()

// POST - Handle JSON-RPC messages from client
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check rate limit
    const { allowed } = await checkRateLimit(
      authContext.userId,
      authContext.plan
    )

    if (!allowed) {
      return new Response('Rate limit exceeded', { status: 429 })
    }

    // Get or create session
    const sessionId = request.headers.get('mcp-session-id') || `session-${Date.now()}`
    
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        userId: authContext.userId,
        createdAt: Date.now(),
      })
    }

    // Parse the request body
    const body = await request.json()
    const { method, params, id } = body

    // Handle MCP methods
    let result

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2025-11-25',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'ZeBridge MCP Server',
            version: '1.0.0',
          },
        }
        break

      case 'notifications/initialized':
        // No response for notifications
        return new Response(null, {
          status: 204,
          headers: { 'MCP-Session-Id': sessionId },
        })

      case 'tools/list':
        result = {
          tools: [
            {
              name: 'pdf_merge',
              description: 'Merge multiple PDF files into one',
              inputSchema: {
                type: 'object',
                properties: {
                  pdfUrls: { type: 'array', items: { type: 'string' } },
                  outputFilename: { type: 'string' },
                },
                required: ['pdfUrls'],
              },
            },
            {
              name: 'pdf_split',
              description: 'Split PDF into multiple files',
              inputSchema: {
                type: 'object',
                properties: {
                  pdfUrl: { type: 'string' },
                  ranges: { type: 'array' },
                },
                required: ['pdfUrl'],
              },
            },
            {
              name: 'remove_background',
              description: 'Remove background from images',
              inputSchema: {
                type: 'object',
                properties: {
                  imageUrl: { type: 'string' },
                  outputFormat: { type: 'string', enum: ['png', 'webp'] },
                },
                required: ['imageUrl', 'outputFormat'],
              },
            },
            {
              name: 'image_upscale',
              description: 'Upscale image resolution',
              inputSchema: {
                type: 'object',
                properties: {
                  imageUrl: { type: 'string' },
                  scaleFactor: { type: 'string', enum: ['2x', '4x'] },
                },
                required: ['imageUrl', 'scaleFactor'],
              },
            },
            {
              name: 'text_to_docx',
              description: 'Convert text to DOCX document',
              inputSchema: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  title: { type: 'string' },
                },
                required: ['text'],
              },
            },
            {
              name: 'markdown_to_pdf',
              description: 'Convert Markdown to PDF',
              inputSchema: {
                type: 'object',
                properties: {
                  markdown: { type: 'string' },
                  title: { type: 'string' },
                },
                required: ['markdown'],
              },
            },
            {
              name: 'generate_receipt',
              description: 'Generate professional receipt PDF',
              inputSchema: {
                type: 'object',
                properties: {
                  receiptNumber: { type: 'string' },
                  date: { type: 'string' },
                  items: { type: 'array' },
                  total: { type: 'number' },
                  from: { type: 'object' },
                  to: { type: 'object' },
                },
                required: ['receiptNumber', 'date', 'items', 'total', 'from', 'to'],
              },
            },
            {
              name: 'generate_qrcode',
              description: 'Generate QR code image',
              inputSchema: {
                type: 'object',
                properties: {
                  data: { type: 'string' },
                  size: { type: 'number' },
                },
                required: ['data'],
              },
            },
            {
              name: 'generate_invoice',
              description: 'Generate professional invoice PDF',
              inputSchema: {
                type: 'object',
                properties: {
                  invoiceNumber: { type: 'string' },
                  date: { type: 'string' },
                  from: { type: 'object' },
                  to: { type: 'object' },
                  items: { type: 'array' },
                  currency: { type: 'string' },
                },
                required: ['invoiceNumber', 'date', 'from', 'to', 'items'],
              },
            },
            {
              name: 'html_to_pdf',
              description: 'Convert HTML to PDF',
              inputSchema: {
                type: 'object',
                properties: {
                  html: { type: 'string' },
                  title: { type: 'string' },
                },
                required: ['html'],
              },
            },
            {
              name: 'json_to_excel',
              description: 'Convert JSON data to Excel/CSV',
              inputSchema: {
                type: 'object',
                properties: {
                  data: { type: 'array' },
                  sheetName: { type: 'string' },
                },
                required: ['data'],
              },
            },
            {
              name: 'ocr_extract_text',
              description: 'Extract text from images using OCR',
              inputSchema: {
                type: 'object',
                properties: {
                  imageUrl: { type: 'string' },
                  language: { type: 'string' },
                },
                required: ['imageUrl'],
              },
            },
          ],
        }
        break

      case 'tools/call':
        const toolName = params?.name
        const toolInput = params?.arguments || {}
        
        // Find the tool in registry
        const tool = toolRegistry.find((t: typeof toolRegistry[0]) => t.name === toolName)
        
        if (!tool) {
          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              error: {
                code: -32602,
                message: `Tool not found: ${toolName}`,
              },
              id,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'MCP-Session-Id': sessionId,
              },
            }
          )
        }

        // Create execution record
        const supabase = createServiceClient()
        const { data: execution, error: execError } = await supabase
          .from('executions')
          .insert({
            user_id: authContext.userId,
            api_key_id: authContext.apiKeyId,
            tool_slug: toolName.replace(/_/g, '-'),
            input_params: toolInput,
            status: 'processing',
          })
          .select('id')
          .single()

        if (execError || !execution) {
          console.error('Failed to create execution record:', execError)
          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: `Failed to create execution record: ${execError?.message || 'Unknown error'}`,
              },
              id,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'MCP-Session-Id': sessionId,
              },
            }
          )
        }

        const startTime = Date.now()

        try {
          // Execute the tool with context
          const toolResult = await tool.handler(toolInput, {
            userId: authContext.userId,
            executionId: execution.id,
            apiKeyId: authContext.apiKeyId,
          })

          const duration = Date.now() - startTime

          // Update execution with success
          await supabase
            .from('executions')
            .update({
              status: 'success',
              output_metadata: { result: toolResult.content },
              duration_ms: duration,
              completed_at: new Date().toISOString(),
            })
            .eq('id', execution.id)

          result = toolResult

        } catch (toolError) {
          const duration = Date.now() - startTime

          // Update execution with error
          await supabase
            .from('executions')
            .update({
              status: 'error',
              error: toolError instanceof Error ? toolError.message : 'Unknown error',
              duration_ms: duration,
              completed_at: new Date().toISOString(),
            })
            .eq('id', execution.id)

          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: toolError instanceof Error ? toolError.message : 'Tool execution failed',
              },
              id,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'MCP-Session-Id': sessionId,
              },
            }
          )
        }
        break

      default:
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
            id,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'MCP-Session-Id': sessionId,
            },
          }
        )
    }

    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        result,
        id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'MCP-Session-Id': sessionId,
        },
      }
    )

  } catch (error) {
    console.error('MCP server error:', error)
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
          data: error instanceof Error ? error.message : 'Unknown error',
        },
        id: null,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// GET - SSE endpoint for receiving messages from server
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check if client accepts SSE
    const accept = request.headers.get('accept') || ''
    if (!accept.includes('text/event-stream')) {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const sessionId = request.headers.get('mcp-session-id') || `session-${Date.now()}`
    
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        userId: authContext.userId,
        createdAt: Date.now(),
      })
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Keep-alive ping
        const interval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': ping\n\n'))
          } catch {
            clearInterval(interval)
          }
        }, 30000)

        // Cleanup on close
        request.signal.addEventListener('abort', () => {
          clearInterval(interval)
          sessions.delete(sessionId)
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'MCP-Session-Id': sessionId,
      },
    })

  } catch (error) {
    console.error('MCP SSE error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

// Enable CORS for MCP clients
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Session-Id',
    },
  })
}
