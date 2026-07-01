"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Terminal, 
  Settings, 
  ShieldAlert, 
  FileCode, 
  Clock, 
  Search, 
  User, 
  Download, 
  Play, 
  Cpu, 
  FileText, 
  Image as ImageIcon,
  Key,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

type Tab = "overview" | "agents" | "tools" | "logs";

interface LogItem {
  id: string;
  agent: string;
  tool: string;
  status: "success" | "warning" | "error";
  duration: string;
  time: string;
  details: string;
}

export default function AppPreview() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [logs, setLogs] = useState<LogItem[]>([
    { id: "1", agent: "Claude Code", tool: "PDF_to_Markdown", status: "success", duration: "1.2s", time: "Just now", details: "Converted contract_final.pdf (4.2 MB) to markdown" },
    { id: "2", agent: "Cursor IDE", tool: "Image_Background_Remove", status: "success", duration: "2.4s", time: "2 min ago", details: "Processed user_avatar_hq.png - transparent alpha output" },
    { id: "3", agent: "Windsurf", tool: "Invoice_OCR", status: "success", duration: "1.8s", time: "5 min ago", details: "Extracted $1,420.50 line-items from invoice_june_zeppelin.pdf" },
    { id: "4", agent: "Gemini CLI", tool: "Merge_PDFs", status: "success", duration: "0.8s", time: "12 min ago", details: "Merged 3 source documents into bundle_unsigned.pdf" },
    { id: "5", agent: "Claude Code", tool: "QR_Code_Generator", status: "success", duration: "0.2s", time: "20 min ago", details: "Generated static QR code for HTTPS endpoint" },
  ]);

  const [isRunningTool, setIsRunningTool] = useState(false);
  const [toolProgress, setToolProgress] = useState(0);
  const [selectedDemoTool, setSelectedDemoTool] = useState("Image_Background_Remove");

  // Simulate incoming agent requests when on the overview tab
  useEffect(() => {
    if (activeTab !== "overview" || isRunningTool) return;

    const interval = setInterval(() => {
      const agents = ["Claude Code", "Cursor IDE", "Windsurf", "Gemini CLI", "Custom MCP Client"];
      const tools = ["PDF_OCR", "Compress_Images", "Extract_Tables", "Word_to_PDF", "CSV_Formatter"];
      const details = [
        "Digitized scanned document scanned_doc_99.pdf with Tesseract-v5 OCR",
        "Compressed asset_gallery_archive.zip (saved 42% storage size)",
        "Extracted tabular data from dynamic-sheet.xlsx (5 tables found)",
        "Formatted spec_draft.docx to spec_draft.pdf using LibrePDF",
        "Standardized dirty spreadsheet records.csv (cleaned 85 rows)"
      ];
      
      const randomIdx = Math.floor(Math.random() * agents.length);
      const newLog: LogItem = {
        id: Math.random().toString(),
        agent: agents[randomIdx],
        tool: tools[randomIdx],
        status: Math.random() > 0.1 ? "success" : "warning",
        duration: (Math.random() * 2 + 0.3).toFixed(1) + "s",
        time: "Just now",
        details: details[randomIdx]
      };

      setLogs(prev => [newLog, ...prev.slice(0, 4)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeTab, isRunningTool]);

  // Simulate running a demo tool
  const startDemoTool = () => {
    if (isRunningTool) return;
    setIsRunningTool(true);
    setToolProgress(0);
    
    const interval = setInterval(() => {
      setToolProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newLog: LogItem = {
              id: Math.random().toString(),
              agent: "Web Dashboard Demo",
              tool: selectedDemoTool,
              status: "success",
              duration: "2.1s",
              time: "Just now",
              details: `Executed ${selectedDemoTool} task successfully via web sandbox. File size: 2.1 MB.`
            };
            setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 4)]);
            setIsRunningTool(false);
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-24 relative">
      {/* Decorative light reflection under preview window */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-sky-500/5 blur-3xl -z-10 rounded-2xl transform translate-y-8" />
      
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col md:flex-row h-[550px] transition-all duration-300 hover:border-emerald-500/20">
        
        {/* Left Sidebar (Dark Navy UI) */}
        <aside className="w-full md:w-64 bg-[#090D16] border-r border-white/5 flex flex-col justify-between shrink-0 p-4">
          <div>
            {/* Header logo/tag inside preview */}
            <div className="flex items-center gap-2 mb-8 px-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">ZeBridge Console</span>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === "overview" 
                    ? "bg-white/10 text-white" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Activity className="h-4 w-4" />
                Dashboard Overview
              </button>

              <button
                onClick={() => setActiveTab("agents")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === "agents" 
                    ? "bg-white/10 text-white" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Cpu className="h-4 w-4" />
                Active Agents
                <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">3</span>
              </button>

              <button
                onClick={() => setActiveTab("tools")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === "tools" 
                    ? "bg-white/10 text-white" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FileCode className="h-4 w-4" />
                Tool Registry
              </button>

              <button
                onClick={() => setActiveTab("logs")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === "logs" 
                    ? "bg-white/10 text-white" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Terminal className="h-4 w-4" />
                Audit Logs
              </button>
            </nav>
          </div>

          {/* Quick status details */}
          <div className="bg-slate-950/40 rounded-lg p-3 border border-white/5 text-[11px] font-mono text-slate-500">
            <div>MCP SERVER: <span className="text-emerald-400 font-semibold">ONLINE</span></div>
            <div className="mt-1">PORT: <span className="text-slate-300">localhost:3012</span></div>
            <div className="mt-1">LATENCY: <span className="text-slate-300">12ms</span></div>
          </div>
        </aside>

        {/* Right Dashboard Area (Premium Light/Grounded UI contrast) */}
        <main className="flex-1 bg-slate-950 flex flex-col min-w-0">
          
          {/* Dashboard Header Bar */}
          <header className="h-14 border-b border-white/5 px-6 flex items-center justify-between gap-4 shrink-0 bg-slate-900/40">
            {/* Search Bar mockup */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search tools or logs..." 
                disabled
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/5 text-slate-300 focus:outline-none"
              />
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => alert("Simulation: Audit logs exported successfully in JSON format.")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Download className="h-3 w-3" />
                Export Audit
              </button>
              <div className="h-8 w-8 rounded-full overflow-hidden border border-white/10">
                <img src="/developer_avatar.png" alt="User Profile" className="h-full w-full object-cover" />
              </div>
            </div>
          </header>

          {/* Tab Contents */}
          <section className="flex-1 p-6 overflow-y-auto">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Metrics row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Daily Executions</span>
                    <span className="text-2xl font-bold text-white mt-1 block">4,281</span>
                    <span className="text-[10px] text-emerald-400 font-medium font-mono mt-1 block">▲ 12.4% today</span>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Storage Used</span>
                    <span className="text-2xl font-bold text-white mt-1 block">84.2 MB</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">of 100 MB free</span>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Active Keys</span>
                    <span className="text-2xl font-bold text-white mt-1 block">3</span>
                    <span className="text-[10px] text-sky-400 font-mono mt-1 block">2 production API keys</span>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Avg. Latency</span>
                    <span className="text-2xl font-bold text-emerald-400 mt-1 block">18 ms</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">Standard queue routing</span>
                  </div>
                </div>

                {/* Main Activity stream */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Activity className="h-3 w-3 text-emerald-400" />
                    Live Agent Execution Stream
                  </h3>
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div 
                        key={log.id} 
                        className="bg-slate-900/30 rounded-lg p-3 border border-white/5 flex items-center justify-between gap-4 text-xs hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                            {log.agent}
                          </span>
                          <span className="font-semibold text-slate-200 shrink-0 font-mono">
                            {log.tool}
                          </span>
                          <span className="text-slate-400 truncate hidden md:inline">
                            {log.details}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-slate-500 font-mono">{log.duration}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AGENTS TAB */}
            {activeTab === "agents" && (
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                  <h3 className="text-sm font-bold text-white mb-1">Configured Client Assistants</h3>
                  <p className="text-xs text-slate-400">These clients are authorized to invoke tools through your active MCP sessions.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Claude Code", status: "Active", request: "1,249", time: "Just now", desc: "Anthropic local CLI agent framework" },
                    { name: "Cursor IDE", status: "Active", request: "2,094", time: "3m ago", desc: "AI-first code editor integration" },
                    { name: "Windsurf", status: "Active", request: "938", time: "10m ago", desc: "Agentic developer IDE plugin" }
                  ].map((agent) => (
                    <div key={agent.name} className="bg-slate-900/40 rounded-xl p-4 border border-white/5 flex flex-col justify-between h-40">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{agent.name}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold font-mono">
                            <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                            {agent.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{agent.desc}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>Reqs: {agent.request}</span>
                        <span>Seen: {agent.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOOL REGISTRY TAB */}
            {activeTab === "tools" && (
              <div className="space-y-6">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Interactive Tool Sandbox</h3>
                    <p className="text-xs text-slate-400">Select an execution model and simulate a background task run.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      value={selectedDemoTool} 
                      onChange={(e) => setSelectedDemoTool(e.target.value)}
                      className="rounded-lg bg-slate-950 border border-white/10 px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="Image_Background_Remove">Image: Background Removal</option>
                      <option value="PDF_to_Word">PDF: Export PDF to Word</option>
                      <option value="Invoice_OCR">AI: Parse Invoice PDF</option>
                      <option value="QR_Generator">Utils: QR Code Builder</option>
                    </select>
                    <button 
                      onClick={startDemoTool}
                      disabled={isRunningTool}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 transition-colors disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5 fill-slate-950 stroke-slate-950" />
                      {isRunningTool ? "Running..." : "Test Run"}
                    </button>
                  </div>
                </div>

                {isRunningTool && (
                  <div className="bg-slate-900/40 rounded-xl p-4 border border-emerald-500/20 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Executing dispatch: {selectedDemoTool}...</span>
                      <span>{toolProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-emerald-400 h-full rounded-full transition-all duration-150" style={{ width: `${toolProgress}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-500 space-y-1 mt-2">
                      <div>[INFO] Spawning worker process container...</div>
                      {toolProgress > 30 && <div>[INFO] Loading temporary input assets...</div>}
                      {toolProgress > 60 && <div>[INFO] Executing neural filter models (CUDA pipeline)...</div>}
                      {toolProgress > 80 && <div>[INFO] Formatting output schema buffer payload...</div>}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Background Removal", slug: "Image_Background_Remove", category: "Images", desc: "Removes background alpha mask using high-fidelity segmentation." },
                    { name: "PDF to Word Converter", slug: "PDF_to_Word", category: "PDF", desc: "Converts structural layout pages into fully editable DOCX templates." },
                    { name: "Invoice OCR Parser", slug: "Invoice_OCR", category: "AI", desc: "Uses deep analysis models to extract invoice metadata variables." },
                    { name: "QR Generator", slug: "QR_Generator", category: "Utilities", desc: "Instant high-resolution QR codes from arbitrary URI links." }
                  ].map((tool) => (
                    <div key={tool.slug} className="bg-slate-900/30 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{tool.category}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-semibold">{tool.slug}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200 mt-2">{tool.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{tool.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIT LOGS TAB */}
            {activeTab === "logs" && (
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Full Transaction Logs</h3>
                    <p className="text-xs text-slate-400">Audits security-sensitive operations generated by local agents.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500 font-mono">
                        <th className="pb-2 font-semibold">Agent</th>
                        <th className="pb-2 font-semibold">Tool</th>
                        <th className="pb-2 font-semibold">Execution Details</th>
                        <th className="pb-2 font-semibold text-right">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 font-semibold text-slate-300 font-mono">{log.agent}</td>
                          <td className="py-2.5 font-bold text-emerald-400 font-mono">{log.tool}</td>
                          <td className="py-2.5 text-slate-400 truncate max-w-xs">{log.details}</td>
                          <td className="py-2.5 text-slate-400 text-right font-mono">{log.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </section>

          {/* Footer of App Preview */}
          <footer className="h-10 border-t border-white/5 px-6 flex items-center justify-between bg-[#080B13] text-[10px] text-slate-500 font-mono">
            <span>&copy; Zeppelin Labs Inc. All rights reserved.</span>
            <span>v1.0.0-stable</span>
          </footer>

        </main>
      </div>
    </div>
  );
}
