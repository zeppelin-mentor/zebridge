import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { generateApiKey } from '@/lib/auth/generate-api-key'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateKeySchema = z.object({
  name: z.string().min(1).max(100),
})

// GET - List user's API keys
export async function GET(request: NextRequest) {
  try {
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('id, name, prefix, created_at, last_used_at, revoked_at')
      .eq('user_id', authContext.userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ keys })

  } catch (error) {
    console.error('Error listing API keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = CreateKeySchema.parse(body)

    const { apiKey, keyId } = await generateApiKey(authContext.userId, name)

    return NextResponse.json({
      apiKey, // Only shown once
      keyId,
      message: 'API key created. Save it securely - it will not be shown again.',
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    console.error('Error creating API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Revoke API key
export async function DELETE(request: NextRequest) {
  try {
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')

    if (!keyId) {
      return NextResponse.json({ error: 'keyId is required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase.rpc('revoke_api_key', {
      p_key_id: keyId,
      p_user_id: authContext.userId,
    })

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'API key revoked successfully' })

  } catch (error) {
    console.error('Error revoking API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
