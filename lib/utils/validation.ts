import { z } from 'zod'

export const FileUploadSchema = z.object({
  file: z.instanceof(Buffer),
  filename: z.string().min(1).max(255),
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+]+$/),
  size: z.number().positive().max(104857600), // 100MB max
})

export const ApiKeySchema = z.object({
  name: z.string().min(1).max(100),
})

export const PdfMergeSchema = z.object({
  pdfUrls: z.array(z.string().url()).min(2).max(10),
  outputFilename: z.string().optional(),
})

export const ImageUpscaleSchema = z.object({
  imageUrl: z.string().url(),
  scaleFactor: z.enum(['2x', '4x']).default('2x'),
})

export const RemoveBackgroundSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
  outputFormat: z.enum(['png', 'webp']).default('png'),
}).refine(
  (data) => data.imageUrl || data.imageBase64,
  { message: 'Either imageUrl or imageBase64 must be provided' }
)
