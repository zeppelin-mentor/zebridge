"use client";

import React, { useEffect, useState } from "react";
import { Activity, Clock, Database, CheckCircle2, TrendingUp, Cpu } from "lucide-react";

interface LogItem {
  id: string;
  agent: string;
  tool: string;
  status: "success" | "warning" | "error";
  duration: string;
  time: string;
  details: string;
}

export default function OverviewTab() {
  const [logs, setLogs] = useState<LogItem[]>([
    { id: "1", agent: "Claude Code", tool: "PDF_to_Markdown", status: "success", duration: "1.2s", time: "Just now", details: "Converted contract_final.pdf (4.2 MB) to markdown" },
    { id: "2", agent: "Cursor IDE", tool: "Image_Background_Remove", status: "success", duration: "2.4s", time: "2 min ago", details: "Processed user_avatar_hq.png - transparent alpha output" },
    { id: "3", agent: "Windsurf", tool: "Invoice_OCR", status: "success", duration: "1.8s", time: "5 min ago", details: "Extracted $1,420.50 line-items from invoice_june_zeppelin.pdf" },
    { id: "4", agent: "Gemini CLI", tool: "Merge_PDFs", status: "success", duration: "0.8s", time: "12 min ago", details: "Merged 3 source documents into bundle_unsigned.pdf" },
    { id: "5", agent: "Claude Code", tool: "QR_Code_Generator", status: "success", duration: "0.2s", time: "20 min ago", details: "Generated static QR code for HTTPS endpoint" },
  ]);

  // Simulate active stream
  useEffect(() => {
    const interval = setInterval(() => {
      const agents = ["Claude Code", "Cursor IDE", "Windsurf", "Gemini CLI"];
      const tools = ["Background_Removal", "PDF_to_Excel", "Translate_Docs", "HTML_to_DOCX", "UUID_Generator"];
      const details = [
        "Removed background alpha mask from hero_banner.png",
        "Exported 4 tables from finance_records.pdf to excel grid format",
        "Translated agreement_de.txt into English document structure",
        "Compiled report_summary.html into clean docx structure",
        "Generated bulk set of v4 UUIDs for api sync validation"
      ];
      
      const randomIdx = Math.floor(Math.random() * agents.length);
      const newLog: LogItem = {
        id: Math.random().toString(),
        agent: agents[randomIdx],
        tool: tools[randomIdx],
        status: "success",
        duration: (Math.random() * 1.5 + 0.2).toFixed(1) + "s",
        time: "Just now",
        details: details[randomIdx]
      };

      setLogs(prev => [newLog, ...prev.slice(0, 4)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Daily Executions", value: "4,281", change: "▲ 12.4% today", detail: "Standard queue routing", icon: Activity, iconColor: "text-emerald-400" },
          { title: "Storage Space", value: "84.2 MB", change: "84% quota consumed", detail: "of 100 MB free tier", icon: Database, iconColor: "text-sky-400" },
          { title: "Average Latency", value: "18 ms", change: "Stable execution latency", detail: "Region: US-East-1 (AWS)", icon: Clock, iconColor: "text-emerald-400" },
          { title: "Success Rate", value: "99.8%", change: "2 issues caught today", detail: "OCR parsing fallbacks active", icon: CheckCircle2, iconColor: "text-sky-400" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{item.title}</span>
                <Icon className={`h-4.5 w-4.5 ${item.iconColor}`} />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">{item.value}</span>
                <div className="flex items-center gap-1 text-[10px] font-mono mt-1.5">
                  <span className={item.change.startsWith("▲") ? "text-emerald-400 font-bold" : "text-slate-400"}>
                    {item.change}
                  </span>
                  <span className="text-slate-500">&bull; {item.detail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Graph mockup */}
      <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Requests Volume</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Last updated: 1m ago</span>
        </div>

        {/* Custom SVG line chart */}
        <div className="h-48 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 600 150" fill="none" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="0" y1="30" x2="600" y2="30" stroke="#ffffff" strokeOpacity="0.03" strokeDasharray="4 4" />
            <line x1="0" y1="75" x2="600" y2="75" stroke="#ffffff" strokeOpacity="0.03" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="#ffffff" strokeOpacity="0.03" strokeDasharray="4 4" />

            {/* Gradient Fill under line */}
            <path
              d="M 0 130 C 100 110, 150 70, 200 80 C 250 90, 300 40, 400 50 C 500 60, 550 20, 600 10 L 600 150 L 0 150 Z"
              fill="url(#chart-gradient)"
            />

            {/* SVG Line path */}
            <path
              d="M 0 130 C 100 110, 150 70, 200 80 C 250 90, 300 40, 400 50 C 500 60, 550 20, 600 10"
              stroke="url(#line-gradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                <stop stopColor="#4ADE80" stopOpacity="0.12" />
                <stop offset="1" stopColor="#4ADE80" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                <stop stopColor="#38BDF8" />
                <stop offset="0.5" stopColor="#4ADE80" />
                <stop offset="1" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Label coordinates overlay */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[9px] font-mono text-slate-500">
            <span>Monday</span>
            <span>Tuesday</span>
            <span>Wednesday</span>
            <span>Thursday</span>
            <span>Friday</span>
            <span>Saturday</span>
            <span>Sunday</span>
          </div>
        </div>
      </div>

      {/* Live Active Stream log list */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-400" />
          Active Execution Stream
        </h3>
        <div className="space-y-2">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="bg-slate-900/30 rounded-xl p-3 border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs hover:bg-slate-900/60 transition-all duration-150"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                  {log.agent}
                </span>
                <span className="font-semibold text-slate-200 shrink-0 font-mono">
                  {log.tool}
                </span>
                <span className="text-slate-400 truncate">
                  {log.details}
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <span className="text-slate-500 font-mono">{log.duration}</span>
                <span className="text-slate-500 font-mono">{log.time}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
