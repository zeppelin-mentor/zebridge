"use client";

import React, { useState } from "react";
import { Terminal, Shield, CheckCircle2, AlertCircle, XCircle, Search, Download } from "lucide-react";

interface AuditLogItem {
  id: string;
  agent: string;
  tool: string;
  status: "success" | "warning" | "error";
  duration: string;
  time: string;
  size: string;
  details: string;
}

export default function LogsTab() {
  const [filterAgent, setFilterAgent] = useState("All");

  const logs: AuditLogItem[] = [
    { id: "101", agent: "Claude Code", tool: "PDF_to_Markdown", status: "success", duration: "1.2s", time: "2026-07-01 18:02:15", size: "4.2 MB", details: "Processed input contract_final.pdf with structural boundaries." },
    { id: "102", agent: "Cursor IDE", tool: "Image_Background_Remove", status: "success", duration: "2.4s", time: "2026-07-01 18:00:30", size: "1.2 MB", details: "Successfully segmented photo foreground objects." },
    { id: "103", agent: "Windsurf", tool: "Invoice_OCR", status: "success", duration: "1.8s", time: "2026-07-01 17:54:12", size: "512 KB", details: "Identified 8 line items totaling invoice value." },
    { id: "104", agent: "Gemini CLI", tool: "Merge_PDFs", status: "success", duration: "0.8s", time: "2026-07-01 17:42:01", size: "8.9 MB", details: "Merged doc_A.pdf, doc_B.pdf, doc_C.pdf successfully." },
    { id: "105", agent: "Claude Code", tool: "QR_Code_Generator", status: "success", duration: "0.2s", time: "2026-07-01 17:35:44", size: "12 KB", details: "Generated static target URL QR asset." },
    { id: "106", agent: "Cursor IDE", tool: "PDF_to_Word", status: "warning", duration: "3.1s", time: "2026-07-01 17:15:10", size: "14.5 MB", details: "Converted layout - warning: custom fonts embedded as canvas raster." },
    { id: "107", agent: "Gemini CLI", tool: "Compress_PDF", status: "error", duration: "0.4s", time: "2026-07-01 16:50:33", size: "0 B", details: "Task aborted: Input document is password-protected and locked." }
  ];

  const filteredLogs = filterAgent === "All" 
    ? logs 
    : logs.filter(log => log.agent === filterAgent);

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-950/80 border border-white/5 p-1 rounded-xl w-full sm:w-auto">
          {["All", "Claude Code", "Cursor IDE", "Windsurf", "Gemini CLI"].map((agent) => (
            <button
              key={agent}
              onClick={() => setFilterAgent(agent)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterAgent === agent
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {agent === "All" ? "All Agents" : agent}
            </button>
          ))}
        </div>
        
        <span className="text-[11px] text-slate-500 font-mono">Showing {filteredLogs.length} audit entries</span>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-400">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono bg-slate-950/40">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Agent Client</th>
                <th className="p-4 font-semibold">Tool Run</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">File Payload</th>
                <th className="p-4 font-semibold">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredLogs.map((log) => (
                <React.Fragment key={log.id}>
                  {/* Summary Row */}
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 text-slate-500">{log.id}</td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">{log.time}</td>
                    <td className="p-4 font-semibold text-slate-300">{log.agent}</td>
                    <td className="p-4 font-bold text-emerald-400">{log.tool}</td>
                    <td className="p-4">
                      {log.status === "success" && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          Success
                        </span>
                      )}
                      {log.status === "warning" && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">
                          <AlertCircle className="h-3 w-3" />
                          Warning
                        </span>
                      )}
                      {log.status === "error" && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">
                          <XCircle className="h-3 w-3" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">{log.size}</td>
                    <td className="p-4 text-right text-slate-400 pr-6">{log.duration}</td>
                  </tr>
                  {/* Details sub-row */}
                  <tr className="bg-slate-950/20">
                    <td colSpan={7} className="px-4 pb-3 pt-0 text-[10px] text-slate-500 font-sans border-b border-white/5">
                      <div className="flex items-center gap-2 pl-4">
                        <span className="text-slate-600 font-mono">DETAILS &rarr;</span>
                        <span className="italic">{log.details}</span>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
