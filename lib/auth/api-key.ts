import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

export interface AuthContext {
  userId: string
  apiKeyId: string
  plan: string
}

export async function validateApiKey(
  request: NextRequest
): Promise<AuthContext | null> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const apiKey = authHeader.substring(7)
  
  // Hash the API key
  const keyHash = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex')

  const supabase = createServiceClient()
  
  // Look up API key
  const { data: apiKeyData, error } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('key_hash', keyHash)
    .single()

  if (error || !apiKeyData) {
    return null
  }

  // Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKeyData.id)

  // Get user plan
  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', apiKeyData.user_id)
    .single()

  return {
    userId: apiKeyData.user_id,
    apiKeyId: apiKeyData.id,
    plan: userData?.plan || 'free',
  }
}
