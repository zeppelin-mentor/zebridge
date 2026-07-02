import { createServiceClient } from '@/lib/supabase/server'

export interface UploadResult {
  path: string
  publicUrl: string
  size: number
  mimeType: string
}

export async function uploadFile(
  userId: string,
  executionId: string,
  file: Buffer,
  filename: string,
  mimeType: string,
  bucket: 'uploads' | 'outputs' | 'temp' = 'uploads'
): Promise<UploadResult> {
  const supabase = createServiceClient()
  
  const path = `${userId}/${executionId}/${filename}`
  
  // Save to Supabase Storage
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  // Record file metadata in database
  const fileType = bucket === 'uploads' ? 'input' : 'output'
  await supabase
    .from('files')
    .insert({
      execution_id: executionId,
      type: fileType,
      storage_bucket: bucket,
      storage_path: path,
      filename,
      size: file.length,
      mime_type: mimeType,
    })

  return {
    path,
    publicUrl,
    size: file.length,
    mimeType,
  }
}

export async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

export async function deleteExpiredFiles(
  userId: string
): Promise<number> {
  const supabase = createServiceClient()
  
  // Get expired files
  const { data: expiredFiles } = await supabase
    .from('files')
    .select('storage_bucket, storage_path')
    .lt('expires_at', new Date().toISOString())
    .eq('execution_id', userId)

  if (!expiredFiles || expiredFiles.length === 0) {
    return 0
  }

  // Delete from storage
  for (const file of expiredFiles) {
    await supabase.storage
      .from(file.storage_bucket)
      .remove([file.storage_path])
  }

  // Delete from database
  const { error } = await supabase
    .from('files')
    .delete()
    .lt('expires_at', new Date().toISOString())

  if (error) {
    console.error('Error deleting expired files:', error)
  }

  return expiredFiles.length
}
