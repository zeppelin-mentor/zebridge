import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function generateApiKey(
  userId: string,
  name: string
): Promise<{ apiKey: string; keyId: string }> {
  // Generate random API key
  const apiKey = `zbr_${crypto.randomBytes(32).toString('hex')}`
  
  // Hash the key for storage
  const keyHash = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex')

  // Store in database
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name,
      key_hash: keyHash,
      prefix: apiKey.substring(0, 10),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create API key: ${error.message}`)
  }

  return {
    apiKey, // Return only once - cannot be retrieved later
    keyId: data.id,
  }
}
