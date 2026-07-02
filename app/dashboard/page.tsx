'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Tool {
  id: string
  slug: string
  name: string
  description: string
  category: string
  enabled: boolean
}

interface UserStats {
  total_executions: number
  successful_executions: number
  failed_executions: number
  avg_duration_ms: number
  total_storage_bytes: number
  active_api_keys: number
  current_plan: string
}

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [tools, setTools] = useState<Tool[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    fetchTools()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
    setLoading(false)
  }

  async function fetchTools() {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('enabled', true)
      .order('category', { ascending: true })

    if (!error && data) {
      setTools(data)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1A233A]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ZeBridge Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-gray-400">Manage your AI tools and monitor usage</p>
        </div>

        {/* Available Tools */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Available Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-[#4ADE80] transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-lg">{tool.name}</h4>
                  <span className="px-2 py-1 bg-[#4ADE80]/20 text-[#4ADE80] text-xs rounded-full">
                    {tool.category}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{tool.description}</p>
                <button className="w-full px-4 py-2 bg-[#4ADE80] text-black font-medium rounded-lg hover:bg-[#4ADE80]/90 transition">
                  Use Tool
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Total Executions</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Success Rate</p>
            <p className="text-3xl font-bold">0%</p>
          </div>
          <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Storage Used</p>
            <p className="text-3xl font-bold">0 MB</p>
          </div>
          <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">API Keys</p>
            <p className="text-3xl font-bold">0</p>
          </div>
        </section>
      </main>
    </div>
  )
}
