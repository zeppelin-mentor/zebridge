import React from "react";
import { Terminal, Code, Cpu, ShieldAlert, CpuIcon, Layers } from "lucide-react";

export default function IntegrationBanner() {
  const partners = [
    { name: "Claude Code", desc: "Anthropic", icon: Terminal },
    { name: "Cursor", desc: "AI Editor", icon: Code },
    { name: "Windsurf", desc: "Agentic IDE", icon: Cpu },
    { name: "Gemini CLI", desc: "Google CLI", icon: Layers },
    { name: "REST API", desc: "Webhooks", icon: ShieldAlert },
    { name: "MCP Protocol", desc: "Model Context", icon: CpuIcon },
  ];

  return (
    <div className="py-12 border-y border-white/5 bg-slate-950/20 backdrop-blur-sm relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          Seamlessly integrates with your existing workflow and editors
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 items-center justify-center">
          {partners.map((partner) => {
            const IconComponent = partner.icon;
            return (
              <div
                key={partner.name}
                className="group flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center hover:bg-white/[0.05] hover:border-emerald-500/25 transition-all duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-white/10 text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                  <IconComponent className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {partner.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {partner.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
