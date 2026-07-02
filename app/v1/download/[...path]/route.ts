import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Download route - serves files from Supabase storage
 * URL format: /v1/download/{bucket}/{userId}/{executionId}/{filename}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathSegments = (await params).path

    if (!pathSegments || pathSegments.length < 4) {
      return NextResponse.json(
        { error: 'Invalid path format. Expected: /download/{bucket}/{userId}/{executionId}/{filename}' },
        { status: 400 }
      )
    }

    const [bucket, userId, executionId, ...filenameParts] = pathSegments
    const filename = filenameParts.join('/')

    // Validate bucket
    if (!['outputs', 'uploads', 'temp'].includes(bucket)) {
      return NextResponse.json(
        { error: 'Invalid bucket. Must be: outputs, uploads, or temp' },
        { status: 400 }
      )
    }

    // Construct storage path
    const storagePath = `${userId}/${executionId}/${filename}`

    const supabase = createServiceClient()

    // Download file from Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(storagePath)

    if (error || !data) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await data.arrayBuffer())

    // Get file metadata from database
    const { data: fileMetadata } = await supabase
      .from('files')
      .select('mime_type, filename')
      .eq('storage_path', storagePath)
      .eq('storage_bucket', bucket)
      .single()

    const mimeType = fileMetadata?.mime_type || 'application/octet-stream'
    const downloadFilename = fileMetadata?.filename || filename

    // Return file as download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
