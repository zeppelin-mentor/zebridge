"use client";

import React from "react";
import { Download, Search, Server } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();

  const getTabDetails = () => {
    switch (pathname) {
      case "/admin":
        return { title: "Admin Analytics", desc: "Monitor total platform executions, active server nodes, and database usage." };
      case "/admin/users":
        return { title: "Developer Directory", desc: "Manage registered developer workspaces, change limits, and adjust plan tiers." };
      case "/admin/blog":
        return { title: "Blog Manager", desc: "Publish platform release announcements and technical tutorials to the blog." };
      default:
        return { title: "ZeBridge System Admin", desc: "Central kernel panel operations" };
    }
  };

  const details = getTabDetails();

  return (
    <header className="h-16 border-b border-violet-500/10 px-6 flex items-center justify-between gap-4 shrink-0 bg-slate-950/10 backdrop-blur-sm">
      <div>
        <h1 className="text-base font-bold text-white tracking-tight">{details.title}</h1>
        <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">{details.desc}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Global admin search */}
        <div className="relative max-w-xs w-full hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-600" />
          <input 
            type="text" 
            placeholder="Search users, posts, logs..." 
            disabled
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 placeholder-slate-700 focus:outline-none"
          />
        </div>

        <button
          onClick={() => alert("Platform report exported: zebridge_platform_metrics.json")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/15 bg-violet-950/30 hover:bg-violet-950/50 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-colors"
        >
          <Server className="h-3.5 w-3.5" />
          <span>System Report</span>
        </button>
      </div>
    </header>
  );
}
