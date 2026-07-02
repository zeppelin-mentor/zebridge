"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Key, Check, Copy, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export default function ApiKeysTab() {
  const supabase = createClient();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, prefix, created_at, last_used_at, revoked_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setKeys(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching keys:', err);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Not authenticated');
        return;
      }

      // Generate API key on backend
      const response = await fetch('/v1/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newKeyName,
          userId: user.id 
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create key');
      }

      const data = await response.json();
      setNewlyCreatedKey(data.apiKey);
      setNewKeyName('');
      fetchKeys();
    } catch (err) {
      console.error('Error creating key:', err);
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    }
  }

  async function handleDeleteKey(keyId: string) {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use RPC function to revoke key
      const { error } = await supabase.rpc('revoke_api_key', {
        p_key_id: keyId,
        p_user_id: user.id,
      });

      if (error) throw error;

      fetchKeys();
    } catch (err) {
      console.error('Error revoking key:', err);
      setError('Failed to revoke API key');
    }
  }

  function handleCopyKey(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-400 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Error</h4>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Warning Alert Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Keep Keys Secure</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            API Keys grant full operational access to ZeBridge tools. Never hardcode them in version control files or expose them on public code repos.
          </p>
        </div>
      </div>

      {/* Generate form */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Create New Secret Key</h3>
        <p className="text-[11px] text-slate-400 mb-3">Give your API key a descriptive name to identify where it's used.</p>
        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Production VS Code CLI Key"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-white/5 focus:border-emerald-400/40 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
            maxLength={100}
          />
          <button
            type="submit"
            disabled={!newKeyName.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!newKeyName.trim() ? "Enter a name for your API key" : "Create API key"}
          >
            <Plus className="h-4 w-4" />
            Generate Secret Key
          </button>
        </form>
        {!newKeyName.trim() && (
          <p className="text-[10px] text-slate-500 mt-2">
            ℹ️ Button will enable after you enter a key name
          </p>
        )}
      </div>

      {/* Newly Created Key Alert Box */}
      {newlyCreatedKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3 animate-fade-in">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Key Created Successfully</h4>
              <p className="text-[11px] text-slate-400 mt-1">Copy this key now. For safety, it cannot be revealed again after you close this page.</p>
            </div>
            <button 
              onClick={() => setNewlyCreatedKey(null)}
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
          <div className="bg-slate-950 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3 font-mono text-xs">
            <span className="text-emerald-400 select-all overflow-x-auto whitespace-nowrap scrollbar-none pr-3">
              {newlyCreatedKey}
            </span>
            <button
              onClick={() => handleCopyKey("newly-created", newlyCreatedKey)}
              className="flex items-center gap-1 hover:text-white transition-colors text-slate-400 shrink-0"
            >
              {copiedKeyId === "newly-created" ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Active API Credentials</h3>
        
        {keys.length > 0 ? (
          <div className="space-y-3">
            {keys.map((item) => {
              const maskedKey = `${item.prefix}••••••••••••••••••••`;
              
              return (
                <div key={item.id} className={`bg-slate-900/30 border ${item.revoked_at ? 'border-red-900/50' : 'border-white/5'} rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors`}>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 block truncate">{item.name}</span>
                      {item.revoked_at && (
                        <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase">
                          Revoked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <Key className="h-3 w-3 shrink-0" />
                      <span className="truncate select-all text-slate-400">
                        {maskedKey}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Created: {new Date(item.created_at).toLocaleDateString()}
                      {item.last_used_at && ` • Last used: ${new Date(item.last_used_at).toLocaleDateString()}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    {/* Delete button */}
                    {!item.revoked_at && (
                      <button
                        onClick={() => handleDeleteKey(item.id)}
                        className="p-2 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/10 border border-white/5 rounded-2xl p-8 text-center text-slate-500 text-xs">
            No API credentials configured. Generate one above to connect clients.
          </div>
        )}
      </div>
    </div>
  );
}
