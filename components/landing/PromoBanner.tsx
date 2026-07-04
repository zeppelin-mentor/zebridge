import React from "react";

export default function PromoBanner() {
  return (
    <div className="relative z-50 w-full bg-gradient-to-r from-emerald-500/25 via-emerald-500 to-sky-500/25 py-2 px-4 text-center text-xs md:text-sm font-medium text-white backdrop-blur-sm border-b border-emerald-500/20">
      <div className="flex items-center justify-center gap-2">
        <span>🎁 Secure your AI agents — Try ZeBridge free today</span>
        <a 
          href="/signup" 
          className="inline-flex items-center gap-1 font-semibold underline hover:text-emerald-200 transition-colors"
        >
          Get Started
          <span className="text-xs">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
