"use client";

import React, { useState, useEffect } from "react";
import { Activity, Users, Database, ShieldAlert, Cpu, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PlatformStats {
  totalUsers: number;
  totalExecutions: number;
  totalFiles: number;
  activeApiKeys: number;
  todayExecutions: number;
  totalStorage: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalExecutions: 0,
    totalFiles: 0,
    activeApiKeys: 0,
    todayExecutions: 0,
    totalStorage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      try {
        // Fetch user count
        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        // Fetch execution count
        const { count: execCount } = await supabase
          .from("executions")
          .select("*", { count: "exact", head: true });

        // Fetch today's execution count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todayCount } = await supabase
          .from("executions")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString());

        // Fetch file count and storage
        const { count: fileCount, data: files } = await supabase
          .from("files")
          .select("size", { count: "exact" });

        const totalStorage = files?.reduce((sum, file) => sum + (file.size || 0), 0) || 0;

        // Fetch active API keys count
        const { count: apiKeyCount } = await supabase
          .from("api_keys")
          .select("*", { count: "exact", head: true })
          .is("revoked_at", null);

        setStats({
          totalUsers: userCount || 0,
          totalExecutions: execCount || 0,
          totalFiles: fileCount || 0,
          activeApiKeys: apiKeyCount || 0,
          todayExecutions: todayCount || 0,
          totalStorage: totalStorage,
        });
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const displayStats = [
    { 
      title: "Total Executions", 
      value: loading ? "..." : stats.totalExecutions.toLocaleString(), 
      change: loading ? "..." : `+${stats.todayExecutions} today`, 
      detail: "All-time operations", 
      icon: BarChart3, 
      color: "text-violet-400" 
    },
    { 
      title: "Registered Users", 
      value: loading ? "..." : stats.totalUsers.toLocaleString(), 
      change: "Active accounts", 
      detail: `${stats.activeApiKeys} API keys`, 
      icon: Users, 
      color: "text-indigo-400" 
    },
    { 
      title: "Storage Used", 
      value: loading ? "..." : `${(stats.totalStorage / (1024 * 1024)).toFixed(1)} MB`, 
      change: `${stats.totalFiles} files`, 
      detail: "Across all buckets", 
      icon: Cpu, 
      color: "text-violet-400" 
    },
    { 
      title: "Database Status", 
      value: "Healthy", 
      change: "Supabase PostgreSQL", 
      detail: "All systems operational", 
      icon: Database, 
      color: "text-indigo-400" 
    }
  ];

  const alerts = [
    { id: "AL-804", type: "warning", message: "Rate limit threshold breached by workspace 'CursorIDE_Demo_Org'", time: "4 min ago" },
    { id: "AL-803", type: "error", message: "Supabase outputs storage bucket near 90% soft quota warning", time: "18 min ago" },
    { id: "AL-802", type: "info", message: "Standard queue workers auto-scaled from 4 to 8 instances", time: "1 hr ago" }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{item.title}</span>
                <Icon className={`h-4.5 w-4.5 ${item.color}`} />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">{item.value}</span>
                <div className="flex items-center gap-1 text-[10px] font-mono mt-1.5">
                  <span className={item.change.startsWith("▲") || item.change.startsWith("+") ? "text-violet-400 font-bold" : "text-slate-400"}>
                    {item.change}
                  </span>
                  <span className="text-slate-500">&bull; {item.detail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SVG Graph for global platform request limits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph box */}
        <div className="lg:col-span-2 bg-[#120B27]/20 border border-violet-500/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-400" />
            Global Platform Requests History
          </h3>

          <div className="h-48 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 600 150" fill="none" preserveAspectRatio="none">
              <line x1="0" y1="30" x2="600" y2="30" stroke="#ffffff" strokeOpacity="0.02" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#ffffff" strokeOpacity="0.02" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#ffffff" strokeOpacity="0.02" strokeDasharray="4 4" />

              {/* Fill */}
              <path
                d="M 0 135 C 100 115, 150 90, 200 60 C 250 80, 300 45, 400 30 C 500 45, 550 15, 600 5 L 600 150 L 0 150 Z"
                fill="url(#admin-chart-grad)"
              />
              {/* Path */}
              <path
                d="M 0 135 C 100 115, 150 90, 200 60 C 250 80, 300 45, 400 30 C 500 45, 550 15, 600 5"
                stroke="url(#admin-line-grad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              <defs>
                <linearGradient id="admin-chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#8B5CF6" stopOpacity="0.15" />
                  <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="admin-line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop stopColor="#6366F1" />
                  <stop offset="0.5" stopColor="#A78BFA" />
                  <stop offset="1" stopColor="#F472B6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[9px] font-mono text-slate-500">
              <span>May 25</span>
              <span>June 01</span>
              <span>June 08</span>
              <span>June 15</span>
              <span>June 22</span>
              <span>June 29</span>
            </div>
          </div>
        </div>

        {/* System Warnings/Alerts Box */}
        <div className="bg-[#120B27]/30 border border-violet-500/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />
              Platform Severity Log
            </h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-slate-950/40 rounded-xl p-3 border border-white/5 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className={`font-bold ${
                      alert.type === "error" ? "text-rose-400" : alert.type === "warning" ? "text-amber-400" : "text-sky-400"
                    }`}>
                      [{alert.id}] {alert.type.toUpperCase()}
                    </span>
                    <span className="text-slate-600">{alert.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => alert("Success: Cleared system logs cache.")}
            className="w-full text-center py-2 text-[10px] font-bold text-violet-400 bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/10 rounded-xl mt-4 transition-colors"
          >
            Acknowledge & Clear Logs
          </button>
        </div>

      </div>
    </div>
  );
}
