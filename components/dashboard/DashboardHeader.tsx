"use client";

import React from "react";
import { Download, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardHeader() {
  const pathname = usePathname();

  const getTabDetails = () => {
    switch (pathname) {
      case "/dashboard":
        return { title: "Dashboard Overview", desc: "Monitor tool invocations, active agents, and API usage." };
      case "/dashboard/agents":
        return { title: "Active Assistants", desc: "Configure and track AI agents connected to your workspace." };
      case "/dashboard/tools":
        return { title: "Tool Registry & Sandbox", desc: "Browse the repository of tools and run test simulations." };
      case "/dashboard/keys":
        return { title: "Developer API Keys", desc: "Manage authentication tokens for the REST API and MCP server." };
      case "/dashboard/logs":
        return { title: "Security Audit Logs", desc: "Review complete histories of secure operations and payloads." };
      case "/dashboard/profile":
        return { title: "Profile Settings", desc: "Manage your account information and preferences." };
      default:
        return { title: "Workspace", desc: "ZeBridge developer workspace" };
    }
  };

  const details = getTabDetails();

  return (
    <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between gap-4 shrink-0 bg-slate-900/10 backdrop-blur-sm">
      <div>
        <h1 className="text-base font-bold text-white tracking-tight">{details.title}</h1>
        <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">{details.desc}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Global search */}
        <div className="relative max-w-xs w-full hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-600" />
          <input 
            type="text" 
            placeholder="Search API keys, tools..." 
            disabled
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950/80 border border-white/5 text-slate-300 placeholder-slate-600 focus:outline-none"
          />
        </div>

        <button
          onClick={() => alert("Success: Audit history exported as zebridge_audit_logs.json")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Audit</span>
        </button>
      </div>
    </header>
  );
}
