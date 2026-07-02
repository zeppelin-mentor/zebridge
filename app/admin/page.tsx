"use client";

import React, { useState, useEffect } from "react";
import { Activity, Users, Database, ShieldAlert, Cpu, BarChart3, AlertTriangle } from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalExecutions: number;
  totalFiles: number;
  activeApiKeys: number;
  todayExecutions: number;
  totalStorage: number;
  totalBlogPosts: number;
}

interface ErrorLog {
  id: string;
  tool_slug: string;
  error: string;
  created_at: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalExecutions: 0,
    totalFiles: 0,
    activeApiKeys: 0,
    todayExecutions: 0,
    totalStorage: 0,
    totalBlogPosts: 0,
  });
  const [executionHistory, setExecutionHistory] = useState<Record<string, number>>({});
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/v1/admin/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        
        const data = await response.json();
        setStats(data.stats);
        setExecutionHistory(data.executionHistory || {});
        setRecentErrors(data.recentErrors || []);
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
      detail: `${loading ? "..." : stats.activeApiKeys} API keys`, 
      icon: Users, 
      color: "text-indigo-400" 
    },
    { 
      title: "Storage Used", 
      value: loading ? "..." : `${(stats.totalStorage / (1024 * 1024)).toFixed(1)} MB`, 
      change: `${loading ? "..." : stats.totalFiles} files`, 
      detail: "Across all buckets", 
      icon: Cpu, 
      color: "text-violet-400" 
    },
    { 
      title: "Blog Posts", 
      value: loading ? "..." : stats.totalBlogPosts.toString(), 
      change: "Published articles", 
      detail: "Content management", 
      icon: Database, 
      color: "text-indigo-400" 
    }
  ];

  // Generate last 7 days for graph
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const graphDates = last7Days.map(d => d.toISOString().split('T')[0]);
  const graphLabels = last7Days.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const graphData = graphDates.map(date => executionHistory[date] || 0);
  
  // Calculate max for scaling
  const maxExecutions = Math.max(...graphData, 1);
  
  // Generate SVG path for the graph
  const pathPoints = graphData.map((count, i) => {
    const x = (i / (graphData.length - 1)) * 600;
    const y = 150 - ((count / maxExecutions) * 120);
    return { x, y };
  });

  const pathD = pathPoints.length > 0
    ? `M ${pathPoints.map((p, i) => `${p.x} ${p.y}`).join(' L ')}`
    : "M 0 150 L 600 150";

  const fillPathD = pathPoints.length > 0
    ? `${pathD} L 600 150 L 0 150 Z`
    : "M 0 150 L 600 150 Z";

  // Format recent errors as alerts
  const alerts = recentErrors.slice(0, 3).map((err, idx) => {
    const timeAgo = getTimeAgo(err.created_at);
    return {
      id: err.id.slice(0, 8),
      type: "error" as const,
      message: `Tool "${err.tool_slug}" failed: ${err.error?.slice(0, 80) || 'Unknown error'}`,
      time: timeAgo,
    };
  });

  function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

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
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                Loading execution history...
              </div>
            ) : (
              <>
                <svg className="w-full h-full" viewBox="0 0 600 150" fill="none" preserveAspectRatio="none">
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#ffffff" strokeOpacity="0.02" strokeDasharray="4 4" />
                  <line x1="0" y1="75" x2="600" y2="75" stroke="#ffffff" strokeOpacity="0.02" strokeDasharray="4 4" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#ffffff" strokeOpacity="0.02" strokeDasharray="4 4" />

                  {/* Fill */}
                  <path
                    d={fillPathD}
                    fill="url(#admin-chart-grad)"
                  />
                  {/* Path */}
                  <path
                    d={pathD}
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
                  {graphLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* System Warnings/Alerts Box */}
        <div className="bg-[#120B27]/30 border border-violet-500/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />
              Recent Errors
            </h3>
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Loading errors...
              </div>
            ) : alerts.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-emerald-400 text-xs flex flex-col items-center gap-2">
                <ShieldAlert className="h-6 w-6" />
                <p>No recent errors found</p>
                <p className="text-slate-500">All systems operational</p>
              </div>
            )}
          </div>
          {!loading && alerts.length > 0 && (
            <button 
              onClick={() => window.location.href = "/admin/logs"}
              className="w-full text-center py-2 text-[10px] font-bold text-violet-400 bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/10 rounded-xl mt-4 transition-colors"
            >
              View All Logs
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
