"use client";

import React, { useState } from "react";
import { Terminal, Shield, Activity, RefreshCcw, Check, Copy } from "lucide-react";

interface AgentItem {
  name: string;
  slug: string;
  status: "Active" | "Inactive";
  requests: string;
  lastSeen: string;
  latency: string;
  configType: "json" | "command";
  configBlock: string;
}

export default function AgentsTab() {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const agents: AgentItem[] = [
    {
      name: "Claude Code",
      slug: "claude-code",
      status: "Active",
      requests: "1,249",
      lastSeen: "Just now",
      latency: "14ms",
      configType: "json",
      configBlock: `{
  "mcpServers": {
    "zebridge": {
      "command": "npx",
      "args": ["-y", "@zebridge/mcp-server"],
      "env": {
        "ZEBRIDGE_API_KEY": "zb_prod_8f3a1d9e2c4b..."
      }
    }
  }
}`
    },
    {
      name: "Cursor IDE",
      slug: "cursor",
      status: "Active",
      requests: "2,094",
      lastSeen: "3m ago",
      latency: "19ms",
      configType: "command",
      configBlock: "npx -y @zebridge/mcp-server --key zb_prod_8f3a1d9e2c4b..."
    },
    {
      name: "Windsurf",
      slug: "windsurf",
      status: "Active",
      requests: "938",
      lastSeen: "10m ago",
      latency: "22ms",
      configType: "json",
      configBlock: `{
  "mcpServers": {
    "zebridge": {
      "command": "npx",
      "args": ["-y", "@zebridge/mcp-server"],
      "env": {
        "ZEBRIDGE_API_KEY": "zb_prod_8f3a1d9e2c4b..."
      }
    }
  }
}`
    }
  ];

  const handleCopy = (slug: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header info */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Connecting Your Local Agents</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          ZeBridge acts as a Model Context Protocol (MCP) server that runs locally or in the cloud. By configuring your editor's MCP settings, your AI assistant gets native capabilities to invoke all the tools registered in your account.
        </p>
      </div>

      {/* Agents List Grid */}
      <div className="grid grid-cols-1 gap-6">
        {agents.map((agent) => (
          <div key={agent.slug} className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 flex flex-col lg:flex-row gap-6 justify-between items-stretch">
            
            {/* Left: Agent Info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold font-mono">
                    <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                    {agent.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Connected via standard client handshake. Standard security tokens resolved.
                </p>
              </div>

              {/* Latency / Request rates */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/40 border border-white/5 rounded-xl p-3 font-mono text-[11px] text-slate-500">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-600">Requests</span>
                  <span className="text-slate-300 font-bold mt-0.5 block">{agent.requests}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-600">Last Seen</span>
                  <span className="text-slate-300 font-bold mt-0.5 block">{agent.lastSeen}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-600">Latency</span>
                  <span className="text-emerald-400 font-bold mt-0.5 block">{agent.latency}</span>
                </div>
              </div>
            </div>

            {/* Right: Config Blocks */}
            <div className="flex-1 flex flex-col justify-between bg-slate-950 rounded-xl border border-white/5 p-4 relative min-w-0">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pb-2 border-b border-white/5 mb-3">
                <span className="flex items-center gap-1.5 uppercase font-semibold">
                  <Terminal className="h-3 w-3 text-slate-600" />
                  MCP Setup Config ({agent.configType})
                </span>
                <button
                  onClick={() => handleCopy(agent.slug, agent.configBlock)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedSlug === agent.slug ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-600 hover:text-slate-300" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              <pre className="font-mono text-[10.5px] text-slate-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
                {agent.configBlock}
              </pre>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
