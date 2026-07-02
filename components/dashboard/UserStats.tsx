'use client'

import { useState, useEffect } from 'react'
import { Activity, CheckCircle, XCircle, HardDrive, Key, Clock } from 'lucide-react'

interface Stats {
  total_executions: number
  successful_executions: number
  failed_executions: number
  avg_duration_ms: number
  total_storage_bytes: number
  active_api_keys: number
  current_plan: string
}

interface Props {
  apiKey: string
}

export default function UserStats({ apiKey }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/v1/user/stats', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1A233A]/50 border border-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return <div className="text-red-400">Failed to load statistics</div>
  }

  const successRate = stats.total_executions > 0
    ? ((stats.successful_executions / stats.total_executions) * 100).toFixed(1)
    : '0'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Total Executions */}
      <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-[#4ADE80]/50 transition">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400 text-sm">Total Executions</p>
          <Activity className="text-gray-600" size={20} />
        </div>
        <p className="text-3xl font-bold">{stats.total_executions}</p>
      </div>

      {/* Success Rate */}
      <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-[#4ADE80]/50 transition">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400 text-sm">Success Rate</p>
          <CheckCircle className="text-green-500" size={20} />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{successRate}%</p>
          <p className="text-sm text-gray-500">
            {stats.successful_executions}/{stats.total_executions}
          </p>
        </div>
      </div>

      {/* Storage Used */}
      <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-[#4ADE80]/50 transition">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400 text-sm">Storage Used</p>
          <HardDrive className="text-gray-600" size={20} />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{formatBytes(stats.total_storage_bytes)}</p>
          <p className="text-sm text-gray-500">/ 100 MB</p>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-[#4ADE80]/50 transition">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400 text-sm">Active API Keys</p>
          <Key className="text-gray-600" size={20} />
        </div>
        <p className="text-3xl font-bold">{stats.active_api_keys}</p>
      </div>

      {/* Failed Executions */}
      {stats.failed_executions > 0 && (
        <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-red-900/50 rounded-lg p-6 hover:border-red-500/50 transition">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Failed Executions</p>
            <XCircle className="text-red-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-red-400">{stats.failed_executions}</p>
        </div>
      )}

      {/* Average Duration */}
      {stats.total_executions > 0 && (
        <div className="bg-[#1A233A]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-[#4ADE80]/50 transition">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Avg Duration</p>
            <Clock className="text-gray-600" size={20} />
          </div>
          <p className="text-3xl font-bold">{formatDuration(stats.avg_duration_ms)}</p>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-[#4ADE80]/20 to-[#4ADE80]/5 backdrop-blur-sm border border-[#4ADE80]/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400 text-sm">Current Plan</p>
        </div>
        <p className="text-3xl font-bold capitalize">{stats.current_plan}</p>
        {stats.current_plan === 'free' && (
          <button className="mt-3 w-full px-4 py-2 bg-[#4ADE80] text-black text-sm font-medium rounded-lg hover:bg-[#4ADE80]/90 transition">
            Upgrade to Pro
          </button>
        )}
      </div>
    </div>
  )
}
