import { createServiceClient } from '@/lib/supabase/server'

export async function cleanupTempFiles() {
  const supabase = createServiceClient()

  try {
    // Call database function to clean expired files
    const { data, error } = await supabase.rpc('clean_expired_files')
    
    if (error) {
      console.error('Error cleaning expired files:', error)
      return
    }

    console.log(`Cleaned ${data} expired files`)
  } catch (error) {
    console.error('Error in cleanup process:', error)
  }
}

export async function cleanupOldExecutions() {
  const supabase = createServiceClient()

  try {
    // Call database function to clean expired executions
    const { data, error } = await supabase.rpc('clean_expired_executions')
    
    if (error) {
      console.error('Error cleaning expired executions:', error)
      return
    }

    console.log(`Cleaned ${data} expired executions`)
  } catch (error) {
    console.error('Error in cleanup process:', error)
  }
}

// Run cleanup every hour in production
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    cleanupTempFiles().catch(console.error)
    cleanupOldExecutions().catch(console.error)
  }, 3600000) // 1 hour
}
