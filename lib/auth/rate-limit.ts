import { createServiceClient } from '@/lib/supabase/server'

export async function checkRateLimit(
  userId: string,
  plan: string
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createServiceClient()
  
  // Get current month
  const now = new Date()
  const month = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get or create usage record
  const { data: usage } = await supabase
    .from('usage')
    .select('requests')
    .eq('user_id', userId)
    .eq('month', month.toISOString().split('T')[0])
    .single()

  const currentRequests = usage?.requests || 0

  // Check plan limits
  const limits = {
    free: 25,
    pro: Infinity,
    team: Infinity,
    enterprise: Infinity,
  }

  const limit = limits[plan as keyof typeof limits] || limits.free
  const allowed = currentRequests < limit
  const remaining = Math.max(0, limit - currentRequests)

  return { allowed, remaining }
}

export async function incrementUsage(userId: string): Promise<void> {
  const supabase = createServiceClient()
  const now = new Date()
  const month = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]

  // Call the database function
  const { error } = await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_month: month,
  })

  if (error) {
    console.error('Error incrementing usage:', error)
  }
}
