"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Key, Eye, EyeOff, Check, Copy, AlertTriangle } from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

export default function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Load keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem("zebridge_api_keys");
    if (savedKeys) {
      setKeys(JSON.parse(savedKeys));
    } else {
      const defaultKeys: ApiKeyItem[] = [
        { id: "1", name: "Claude Code CLI Connection", key: "zb_prod_8f3a2901db54c8e762c4bf1a986e", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "2", name: "Cursor Editor Integration", key: "zb_prod_23a9b8f10cd293ef64e81a8b92d3", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ];
      setKeys(defaultKeys);
      localStorage.setItem("zebridge_api_keys", JSON.stringify(defaultKeys));
    }
  }, []);

  const saveKeys = (newKeys: ApiKeyItem[]) => {
    setKeys(newKeys);
    localStorage.setItem("zebridge_api_keys", JSON.stringify(newKeys));
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    // Generate random mock key
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const generatedKey = `zb_prod_${randomHex.slice(0, 24)}`;
    
    const newKeyItem: ApiKeyItem = {
      id: Math.random().toString(),
      name: newKeyName,
      key: generatedKey,
      createdAt: new Date().toISOString()
    };

    const updatedKeys = [...keys, newKeyItem];
    saveKeys(updatedKeys);
    setNewKeyName("");
    setNewlyCreatedKey(generatedKey);
    setVisibleKeyId(newKeyItem.id);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm("Are you sure you want to delete this API Key? AI clients using this key will immediately lose access to ZeBridge tools.")) {
      const updatedKeys = keys.filter(k => k.id !== id);
      saveKeys(updatedKeys);
    }
  };

  const handleCopyKey = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="space-y-6">
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
        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Production VS Code CLI Key"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-white/5 focus:border-emerald-400/40 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Generate Secret Key
          </button>
        </form>
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
              const isVisible = visibleKeyId === item.id;
              const maskedKey = `${item.key.slice(0, 12)}••••••••••••••••••••`;
              
              return (
                <div key={item.id} className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-xs font-bold text-slate-200 block truncate">{item.name}</span>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <Key className="h-3 w-3 shrink-0" />
                      <span className="truncate select-all text-slate-400">
                        {isVisible ? item.key : maskedKey}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    {/* Toggle visibility */}
                    <button
                      onClick={() => setVisibleKeyId(isVisible ? null : item.id)}
                      className="p-2 rounded-lg border border-white/5 bg-slate-900 text-slate-400 hover:text-white transition-colors"
                      title={isVisible ? "Hide Key" : "Reveal Key"}
                    >
                      {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>

                    {/* Copy button */}
                    <button
                      onClick={() => handleCopyKey(item.id, item.key)}
                      className="p-2 rounded-lg border border-white/5 bg-slate-900 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-[11px]"
                      title="Copy Key"
                    >
                      {copiedKeyId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteKey(item.id)}
                      className="p-2 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Revoke Key"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
