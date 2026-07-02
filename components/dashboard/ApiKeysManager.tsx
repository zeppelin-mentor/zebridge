'use client'

import { useState, useEffect } from 'react'
import { Key, Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  prefix: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

interface Props {
  apiKey: string
}

export default function ApiKeysManager({ apiKey }: Props) {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newApiKey, setNewApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    fetchKeys()
  }, [])

  async function fetchKeys() {
    try {
      const response = await fetch('/v1/user/api-keys', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setKeys(data.keys || [])
      }
    } catch (error) {
      console.error('Error fetching keys:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) return

    try {
      const response = await fetch('/v1/user/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (response.ok) {
        const data = await response.json()
        setNewApiKey(data.apiKey)
        setNewKeyName('')
        fetchKeys()
      }
    } catch (error) {
      console.error('Error creating key:', error)
    }
  }

  async function revokeKey(keyId: string) {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/v1/user/api-keys?keyId=${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })

      if (response.ok) {
        fetchKeys()
      }
    } catch (error) {
      console.error('Error revoking key:', error)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return <div className="text-gray-400">Loading API keys...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">API Keys</h3>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4ADE80] text-black rounded-lg hover:bg-[#4ADE80]/90 transition"
        >
          <Plus size={16} />
          Create Key
        </button>
      </div>

      {/* API Keys List */}
      <div className="space-y-3">
        {keys.length === 0 ? (
          <div className="bg-[#1A233A]/50 border border-gray-800 rounded-lg p-8 text-center">
            <Key className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No API keys yet</p>
            <p className="text-gray-500 text-sm mt-1">Create your first API key to get started</p>
          </div>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className={`bg-[#1A233A]/50 border ${key.revoked_at ? 'border-red-900' : 'border-gray-800'} rounded-lg p-4`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{key.name}</h4>
                    {key.revoked_at && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded">
                        Revoked
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm font-mono">{key.prefix}...</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                    {key.last_used_at && (
                      <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                {!key.revoked_at && (
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A233A] border border-gray-800 rounded-lg max-w-md w-full p-6">
            {newApiKey ? (
              <>
                <h3 className="text-xl font-semibold mb-4">API Key Created!</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Copy your API key now. You won't be able to see it again!
                </p>
                <div className="bg-[#0B0F19] border border-gray-700 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono break-all">
                      {showKey ? newApiKey : '•'.repeat(64)}
                    </code>
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 text-gray-400 hover:text-white transition"
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(newApiKey)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#4ADE80] text-black rounded-lg hover:bg-[#4ADE80]/90 transition"
                  >
                    <Copy size={16} />
                    Copy Key
                  </button>
                  <button
                    onClick={() => {
                      setNewApiKey('')
                      setShowNewKeyModal(false)
                    }}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">Create API Key</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Server"
                    className="w-full px-4 py-2 bg-[#0B0F19] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#4ADE80] transition"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={createKey}
                    disabled={!newKeyName.trim()}
                    className="flex-1 px-4 py-2 bg-[#4ADE80] text-black rounded-lg hover:bg-[#4ADE80]/90 transition disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false)
                      setNewKeyName('')
                    }}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
