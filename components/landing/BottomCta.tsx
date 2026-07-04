"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";

export default function BottomCta() {
  return (
    <section className="relative overflow-hidden py-24 border-t border-white/5 bg-slate-950/40">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_0%,rgba(74,222,128,0.02)_60%,transparent_100%)] blur-[100px]" />
      <div className="absolute -bottom-20 right-0 -z-10 h-[300px] w-[300px] bg-emerald-500/5 blur-[100px]" />
      <div className="absolute -top-20 left-0 -z-10 h-[300px] w-[300px] bg-sky-500/5 blur-[100px]" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 px-4 py-1.5 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Frictionless Setup & Sandboxed Safety</span>
        </div>

        {/* Content */}
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
          Supercharge your AI agents
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            with production-grade tools.
          </span>
        </h2>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
          Connect Claude, Cursor, Windsurf, or Gemini to ZeBridge in under 2 minutes. Start using 12 pre-built tools completely free, no credit card required.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/signup"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-slate-950 hover:bg-slate-100 shadow-[0_4px_25px_rgba(255,255,255,0.12)] transition-all duration-200"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          
          <Link
            href="/docs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            Read API Docs
          </Link>
        </div>

        {/* Small subtext */}
        <p className="text-xs text-slate-500 font-mono">
          MCP Endpoint: https://zebridge.vercel.app/mcp &bull; REST: /v1/tools
        </p>

      </div>
    </section>
  );
}
