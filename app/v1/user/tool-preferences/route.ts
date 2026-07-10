import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const PatchSchema = z.object({
  toolSlug: z.string().min(1),
  enabled: z.boolean(),
})


/**
 * GET /v1/user/tool-preferences
 * Returns all tool preferences for the authenticated user.
 * Tools with no row default to enabled=true.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const serviceClient = createServiceClient()
    const { data: prefs } = await serviceClient
      .from('user_tool_preferences')
      .select('tool_slug, enabled')
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, preferences: prefs || [] })
  } catch (error) {
    console.error('Error fetching tool preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /v1/user/tool-preferences
 * Upserts a single tool preference for the authenticated user.
 * Body: { toolSlug: string, enabled: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { toolSlug, enabled } = PatchSchema.parse(body)

    const serviceClient = createServiceClient()
    const { error } = await serviceClient
      .from('user_tool_preferences')
      .upsert(
        { user_id: user.id, tool_slug: toolSlug, enabled, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,tool_slug' }
      )

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, toolSlug, enabled })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('Error updating tool preference:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
