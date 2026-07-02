"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Shield, CheckCircle2, AlertCircle, XCircle, Search, Download, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AuditLogItem {
  id: string;
  tool_slug: string;
  status: "success" | "error";
  duration_ms: number;
  created_at: string;
  input_params: any;
}

export default function LogsTab() {
  const supabase = createClient();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [filterStatus]);

  async function fetchLogs() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      let query = supabase
        .from('executions')
        .select('id, tool_slug, status, duration_ms, created_at, input_params')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply status filter
      if (filterStatus !== "all") {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  async function handleExport() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('executions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!data) return;

      // Convert to CSV
      const headers = ['Timestamp', 'Tool', 'Status', 'Duration (ms)', 'Input Parameters'];
      const rows = data.map(log => [
        formatDateTime(log.created_at),
        log.tool_slug,
        log.status,
        log.duration_ms,
        JSON.stringify(log.input_params || {})
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zebridge-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Failed to export logs');
    }
  }

  const filteredLogs = logs.filter(log => {
    if (searchQuery && !log.tool_slug.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-400 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-950/80 border border-white/5 p-1 rounded-xl w-full sm:w-auto">
          {["all", "success", "error"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                filterStatus === status
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {status === "all" ? "All Logs" : status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-600" />
            <input 
              type="text" 
              placeholder="Search by tool..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400/40"
            />
          </div>
          
          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg border border-white/5 bg-slate-900 text-slate-400 hover:text-white hover:border-emerald-400/40 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Total</p>
          <p className="text-lg font-bold text-white">{logs.length}</p>
        </div>
        <div className="bg-slate-900/40 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Success</p>
          <p className="text-lg font-bold text-emerald-400">
            {logs.filter(l => l.status === 'success').length}
          </p>
        </div>
        <div className="bg-slate-900/40 border border-red-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Failed</p>
          <p className="text-lg font-bold text-red-400">
            {logs.filter(l => l.status === 'error').length}
          </p>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length > 0 ? (
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-400">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-mono bg-slate-950/40">
                  <th className="p-4 font-semibold">Timestamp</th>
                  <th className="p-4 font-semibold">Tool</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Duration</th>
                  <th className="p-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    {/* Summary Row */}
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="p-4 font-bold text-emerald-400">{log.tool_slug}</td>
                      <td className="p-4">
                        {log.status === "success" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-300">{formatDuration(log.duration_ms)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            const params = log.input_params || {};
                            alert(JSON.stringify(params, null, 2));
                          }}
                          className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                        >
                          View Params →
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-12 text-center">
          <Terminal className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-1">
            {searchQuery ? 'No logs match your search' : 'No audit logs yet'}
          </p>
          <p className="text-slate-500 text-xs">
            {searchQuery ? 'Try a different search term' : 'Tool executions will appear here once you start using the API'}
          </p>
        </div>
      )}

      {/* Pagination Info */}
      {filteredLogs.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-slate-500 font-mono">
            Showing {filteredLogs.length} of {logs.length} total logs
            {logs.length >= 100 && " (limited to 100 most recent)"}
          </p>
        </div>
      )}
    </div>
  );
}
