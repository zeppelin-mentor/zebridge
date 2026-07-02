import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { validateApiKey } from '@/lib/auth/api-key';
import { z } from 'zod';
import { pdfToDocx } from '@/lib/tools/pdf-tools';

const schema = z.object({
  pdfUrl: z.string().url(),
  outputFilename: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify API key
    const verification = await validateApiKey(request);
    if (!verification) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { pdfUrl, outputFilename } = result.data;

    // Create execution record
    const supabase = createServiceClient();
    const { data: execution, error: execError } = await supabase
      .from('executions')
      .insert({
        user_id: verification.userId,
        tool_slug: 'pdf-to-docx',
        api_key_id: verification.apiKeyId,
        status: 'success',
        input_data: { pdfUrl, outputFilename },
      })
      .select()
      .single();

    if (execError) throw execError;

    // Convert PDF to DOCX
    const { buffer, filename, mimeType } = await pdfToDocx(pdfUrl, outputFilename);

    // Upload to storage
    const storagePath = `${verification.userId}/${execution.id}/${filename}`;
    const { error: uploadError } = await supabase.storage
      .from('outputs')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('outputs')
      .getPublicUrl(storagePath);

    // Save file record
    await supabase.from('files').insert({
      execution_id: execution.id,
      filename,
      storage_path: storagePath,
      storage_bucket: 'outputs',
      mime_type: mimeType,
      size: buffer.length,
      type: 'output',
    });

    // Update execution duration
    const duration = Date.now() - startTime;
    await supabase
      .from('executions')
      .update({ duration_ms: duration })
      .eq('id', execution.id);

    return NextResponse.json({
      success: true,
      filename,
      fileUrl: urlData.publicUrl,
      size: buffer.length,
      executionId: execution.id,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('PDF to DOCX error:', error);

    // Log failed execution
    try {
      const verification = await validateApiKey(request);
      if (verification) {
        const supabase = createServiceClient();
        await supabase.from('executions').insert({
          user_id: verification.userId,
          tool_slug: 'pdf-to-docx',
          api_key_id: verification.apiKeyId,
          status: 'error',
          duration_ms: duration,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } catch (logError) {
      console.error('Error logging failed execution:', logError);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PDF to DOCX conversion failed' },
      { status: 500 }
    );
  }
}
