"use client";

import React, { useEffect, useState } from "react";
import { Activity, Clock, Database, CheckCircle2, TrendingUp, Cpu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_ms: number;
  total_storage_bytes: number;
  active_api_keys: number;
  current_plan: string;
}

interface LogItem {
  id: string;
  tool_slug: string;
  status: "success" | "error";
  duration_ms: number;
  created_at: string;
}

export default function OverviewTab() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user stats using RPC function
      const { data: statsData } = await supabase.rpc('get_user_stats', {
        p_user_id: user.id,
      });

      if (statsData && statsData[0]) {
        setStats(statsData[0]);
      }

      // Get recent executions
      const { data: execData } = await supabase
        .from('executions')
        .select('id, tool_slug, status, duration_ms, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (execData) {
        setLogs(execData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-400 border-r-transparent"></div>
      </div>
    );
  }

  const successRate = stats && stats.total_executions > 0
    ? ((stats.successful_executions / stats.total_executions) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Executions</span>
            <Activity className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats?.total_executions || 0}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono mt-1.5">
              <span className="text-slate-400">All time</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Storage Used</span>
            <Database className="h-4.5 w-4.5 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatBytes(stats?.total_storage_bytes || 0)}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono mt-1.5">
              <span className="text-slate-400">of 100 MB</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg Latency</span>
            <Clock className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats?.avg_duration_ms ? formatDuration(stats.avg_duration_ms) : '0ms'}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono mt-1.5">
              <span className="text-slate-400">Per execution</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 className="h-4.5 w-4.5 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {successRate}%
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono mt-1.5">
              <span className="text-slate-400">
                {stats?.successful_executions || 0}/{stats?.total_executions || 0} tasks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Info */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Current Plan</h3>
            <p className="text-lg font-bold text-emerald-400 capitalize">{stats?.current_plan || 'Free'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Active API Keys</p>
            <p className="text-2xl font-bold text-white">{stats?.active_api_keys || 0}</p>
          </div>
        </div>
        {stats?.current_plan === 'free' && (
          <button className="mt-4 w-full px-4 py-2 bg-emerald-400 text-black text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors">
            Upgrade to Pro for Unlimited Access
          </button>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
            Recent Executions
          </h3>
          <button 
            onClick={loadData}
            className="text-xs text-slate-500 hover:text-white transition-colors"
          >
            Refresh
          </button>
        </div>

        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="bg-slate-900/30 rounded-xl p-3 border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs hover:bg-slate-900/60 transition-all duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    log.status === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {log.status}
                  </span>
                  <span className="font-semibold text-slate-200 shrink-0 font-mono">
                    {log.tool_slug}
                  </span>
                  <span className="text-slate-500 font-mono">{formatDuration(log.duration_ms)}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-slate-500 font-mono text-[10px]">
                    {getTimeAgo(log.created_at)}
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    log.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/20 border border-white/5 rounded-xl p-8 text-center">
            <Cpu className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No executions yet</p>
            <p className="text-slate-500 text-xs mt-1">
              Create an API key and start using ZeBridge tools to see activity here
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/dashboard/keys"
          className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 hover:border-emerald-400/40 transition-all group"
        >
          <h4 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
            Create API Key
          </h4>
          <p className="text-xs text-slate-400">Generate a new key to access ZeBridge</p>
        </a>

        <a
          href="/dashboard/tools"
          className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 hover:border-emerald-400/40 transition-all group"
        >
          <h4 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
            Browse Tools
          </h4>
          <p className="text-xs text-slate-400">Explore available tools in the registry</p>
        </a>

        <a
          href="/dashboard/logs"
          className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 hover:border-emerald-400/40 transition-all group"
        >
          <h4 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
            View Audit Logs
          </h4>
          <p className="text-xs text-slate-400">Review execution history and security events</p>
        </a>
      </div>
    </div>
  );
}
