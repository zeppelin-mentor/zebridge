"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-12 md:pt-28 md:pb-20">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,rgba(74,222,128,0.03)_50%,transparent_100%)] blur-[80px]" />
      <div className="absolute -top-40 right-0 -z-10 h-[400px] w-[400px] bg-emerald-500/5 blur-[120px]" />
      <div className="absolute -top-40 left-0 -z-10 h-[400px] w-[400px] bg-sky-500/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          {/* Left Column: Headline & Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pre-heading Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-4 py-1.5 text-xs md:text-sm font-medium text-emerald-400 backdrop-blur-md animate-fade-in">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Secure Model Context Protocol</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
              Universal Tooling for
              <br />
              <span className="relative inline-block mt-3 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-2xl md:rounded-3xl shadow-[0_0_30px_rgba(74,222,128,0.25)] border border-emerald-400/20 transform -rotate-1">
                AI Agents
              </span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-xl text-base md:text-lg text-slate-400 leading-relaxed">
              Instead of generating temporary scripts, installing package boilerplates, and executing unsafe local commands, empower <strong>Claude</strong>, <strong>Cursor</strong>, and <strong>Gemini</strong> to securely perform real-world tasks through a standardized tool interface.
            </p>

            {/* Call-to-actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 hover:bg-slate-100 shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="#docs"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
              >
                <Play className="h-4 w-4 text-slate-300" />
                Read Documentation
              </Link>
            </div>

            {/* CLI Prompt Banner */}
            <div className="max-w-md rounded-xl border border-white/5 bg-slate-950/80 px-4 py-3 backdrop-blur-md">
              <code className="text-xs md:text-sm text-slate-300 flex items-center justify-between gap-3">
                <span className="text-emerald-400 font-mono">$ npm install -g @zebridge/mcp-server</span>
                <button 
                  onClick={() => navigator.clipboard.writeText("npm install -g @zebridge/mcp-server")}
                  className="text-xs text-slate-500 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </code>
            </div>
          </div>

          {/* Right Column: Dynamic Asset Image */}
          <div className="lg:col-span-5 relative w-full flex justify-center">
            {/* Soft background light ring behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-sky-500/10 blur-3xl -z-10 transform scale-110" />
            
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-sm max-w-sm sm:max-w-md md:max-w-lg lg:max-w-full">
              <img 
                src="/hero_illustration.png" 
                alt="ZeBridge Connection Architecture" 
                className="rounded-xl w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
