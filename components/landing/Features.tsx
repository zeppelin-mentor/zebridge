import React from "react";
import { Terminal, Cpu, ShieldAlert, FileText, Zap, Shield, Key } from "lucide-react";

export default function Features() {
  const items = [
    {
      title: "Model Context Protocol (MCP)",
      desc: "Connect your AI agent directly to local execution pipelines using the standardized open-source protocol. Auto-discovers and resolves schemas instantly.",
      icon: Cpu,
    },
    {
      title: "Production REST API",
      desc: "Standard JSON endpoints (/v1/tools) to perform PDF operations, image compression, OCR, and invoice parsing with simple curl statements.",
      icon: Terminal,
    },
    {
      title: "Interactive Web Sandbox",
      desc: "Upload files, trigger tools, monitor active executions, and download outputs from a sleek, intuitive dashboard without setting up any code.",
      icon: FileText,
    },
    {
      title: "Sandboxed Safety",
      desc: "Execute processes inside isolated environments. Automatic temporary storage cleanup, rate-limiting, and signed output URIs protect sensitive business documents.",
      icon: Shield,
    },
    {
      title: "Zero-Latency Worker Queue",
      desc: "Powered by BullMQ and Redis on premium cloud instances. Tasks are picked up in milliseconds, offering prompt execution cycles.",
      icon: Zap,
    },
    {
      title: "Secure API Access Keys",
      desc: "Easily generate, roll, and delete developer keys. Grant scopes dynamically for different client integrations.",
      icon: Key,
    },
  ];

  return (
    <section id="protocols" className="py-20 bg-slate-950/40 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A secure bridge between AI reasoning and manual execution.
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            Everything your agent needs to complete complex operational tasks, organized under a unified, high-performance API boundary.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.title} 
                className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="h-10 w-10 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mt-4 group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
