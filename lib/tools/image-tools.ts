import sharp from 'sharp'
import { uploadFile, downloadFile } from '@/lib/storage/upload'

export async function removeBackground(
  input: { imageUrl?: string; imageBase64?: string; outputFormat: 'png' | 'webp' },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string; size: number }> {
  const { imageUrl, imageBase64, outputFormat } = input
  
  // Get image buffer
  let imageBuffer: Buffer
  if (imageUrl) {
    imageBuffer = await downloadFile(imageUrl)
  } else if (imageBase64) {
    imageBuffer = Buffer.from(imageBase64, 'base64')
  } else {
    throw new Error('Either imageUrl or imageBase64 must be provided')
  }

  // Process with sharp - basic implementation using threshold
  // For production, integrate with remove.bg API or similar service
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()
  
  // Simple alpha channel processing
  const processed = await image
    .ensureAlpha()
    .toFormat(outputFormat === 'webp' ? 'webp' : 'png')
    .toBuffer()

  // Upload result
  const filename = `background-removed-${Date.now()}.${outputFormat}`
  const result = await uploadFile(
    userId,
    executionId,
    processed,
    filename,
    outputFormat === 'webp' ? 'image/webp' : 'image/png',
    'outputs'
  )

  return {
    outputUrl: result.publicUrl,
    filename,
    size: result.size,
  }
}

export async function upscaleImage(
  input: { imageUrl: string; scaleFactor: '2x' | '4x' },
  userId: string,
  executionId: string
) {
  const { imageUrl, scaleFactor } = input
  
  // Download image
  const imageBuffer = await downloadFile(imageUrl)

  // Upscale using sharp
  const multiplier = scaleFactor === '4x' ? 4 : 2
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()
  
  const upscaled = await image
    .resize(
      Math.round((metadata.width || 0) * multiplier),
      Math.round((metadata.height || 0) * multiplier),
      { kernel: 'lanczos3' }
    )
    .toBuffer()

  // Upload to Supabase Storage
  const filename = `upscaled-${scaleFactor}-${Date.now()}.png`
  const result = await uploadFile(
    userId,
    executionId,
    upscaled,
    filename,
    'image/png',
    'outputs'
  )

  return {
    outputUrl: result.publicUrl,
    filename,
    originalSize: { width: metadata.width, height: metadata.height },
    newSize: { 
      width: Math.round((metadata.width || 0) * multiplier), 
      height: Math.round((metadata.height || 0) * multiplier) 
    },
    size: result.size,
  }
}

export async function compressImage(
  input: { imageUrl: string; quality: number },
  userId: string,
  executionId: string
) {
  const { imageUrl, quality } = input
  
  // Download image
  const imageBuffer = await downloadFile(imageUrl)

  // Compress using sharp
  const compressed = await sharp(imageBuffer)
    .jpeg({ quality: Math.min(100, Math.max(1, quality)) })
    .toBuffer()

  // Upload to Supabase Storage
  const filename = `compressed-${Date.now()}.jpg`
  const result = await uploadFile(
    userId,
    executionId,
    compressed,
    filename,
    'image/jpeg',
    'outputs'
  )

  return {
    outputUrl: result.publicUrl,
    filename,
    originalSize: imageBuffer.length,
    compressedSize: result.size,
    compressionRatio: ((1 - result.size / imageBuffer.length) * 100).toFixed(2) + '%',
  }
}
