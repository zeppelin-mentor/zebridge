import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/api-key'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const authContext = await validateApiKey(request)
    if (!authContext) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const supabase = createServiceClient()
    
    // Get user statistics using database function
    const { data, error } = await supabase.rpc('get_user_stats', {
      p_user_id: authContext.userId,
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      stats: data[0],
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
