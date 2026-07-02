import { z } from 'zod'
import { ToolDefinition } from '../types'
import { removeBackground, upscaleImage, compressImage } from '@/lib/tools/image-tools'

export const imageTools: ToolDefinition[] = [
  {
    name: 'remove_background',
    description: 'Remove background from an image',
    inputSchema: z.object({
      imageUrl: z.string().url().optional().describe('URL of the image'),
      imageBase64: z.string().optional().describe('Base64 encoded image'),
      outputFormat: z.enum(['png', 'webp']).default('png').describe('Output format'),
    }).refine(
      (data) => data.imageUrl || data.imageBase64,
      { message: 'Either imageUrl or imageBase64 must be provided' }
    ),
    handler: async (input, context) => {
      try {
        const result = await removeBackground(input, context.userId, context.executionId)

        return {
          content: [{
            type: 'text' as const,
            text: `Background removal completed. Output: ${result.outputUrl}`,
          }],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Background removal failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
  {
    name: 'image_upscale',
    description: 'Upscale image resolution using AI',
    inputSchema: z.object({
      imageUrl: z.string().url().describe('URL of the image to upscale'),
      scaleFactor: z.enum(['2x', '4x']).default('2x').describe('Upscale factor'),
    }),
    handler: async (input, context) => {
      try {
        const result = await upscaleImage(input, context.userId, context.executionId)

        return {
          content: [{
            type: 'text' as const,
            text: `Image upscale completed. Output: ${result.outputUrl}. New size: ${result.newSize.width}x${result.newSize.height}`,
          }],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Image upscale failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
  {
    name: 'image_compress',
    description: 'Compress image to reduce file size',
    inputSchema: z.object({
      imageUrl: z.string().url().describe('URL of the image to compress'),
      quality: z.number().min(1).max(100).default(80).describe('Compression quality (1-100)'),
    }),
    handler: async (input, context) => {
      try {
        const result = await compressImage(input, context.userId, context.executionId)

        return {
          content: [{
            type: 'text' as const,
            text: `Image compression completed. Output: ${result.outputUrl}. Compression ratio: ${result.compressionRatio}`,
          }],
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        }
      }
    },
  },
]
