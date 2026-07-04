"use client";

import React from "react";
import { Link2, Bot, Zap } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect Your AI Agent",
      desc: "Hook up your coding assistants (Claude Code, Cursor, Windsurf, or Gemini) using the Model Context Protocol (MCP) server endpoint or standard REST API keys.",
      icon: Link2,
      color: "from-sky-500/20 to-sky-400/5 border-sky-500/20 text-sky-400",
    },
    {
      step: "02",
      title: "AI Detects & Selects Tools",
      desc: "When you ask your agent to parse a receipt, compress an image, or convert a document, it auto-discovers the schema and calls the exact tool instantly.",
      icon: Bot,
      color: "from-emerald-500/20 to-emerald-400/5 border-emerald-500/20 text-emerald-400",
    },
    {
      step: "03",
      title: "Secure Isolated Execution",
      desc: "Tasks run on our ultra-fast sandboxed worker queues. Finished files or structured JSON are generated and securely returned in milliseconds.",
      icon: Zap,
      color: "from-teal-500/20 to-teal-400/5 border-teal-500/20 text-teal-400",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden bg-slate-950/20">
      {/* Decorative glows */}
      <div className="absolute top-1/2 left-1/4 -z-10 h-96 w-96 rounded-full bg-sky-500/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Platform Workflow
          </h2>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            How ZeBridge connects AI to the real world
          </h3>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Eliminate complex Python script generation, package installer bottlenecks, and unsafe local CLI execution. Empower your agents with robust APIs in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line - Desktop only */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 border-t border-dashed border-white/10 -z-20 -translate-y-8" />

          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex flex-col items-start p-8 rounded-2xl border border-white/5 bg-slate-900/30 backdrop-blur-sm hover:border-white/10 transition-all duration-300 group hover:-translate-y-1"
              >
                {/* Step badge */}
                <span className="absolute top-4 right-6 text-sm font-mono font-bold text-slate-700 select-none">
                  {item.step}
                </span>

                {/* Icon Container */}
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center border bg-gradient-to-br ${item.color} shadow-lg transition-transform group-hover:scale-105`}>
                  <Icon className="h-6 w-6" />
                </div>

                <h4 className="text-lg font-bold text-slate-100 mt-6 group-hover:text-white transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
