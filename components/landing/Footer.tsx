import React from "react";
import Link from "next/link";
import Logo from "../logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo size={28} />
          <p className="text-[11px] text-slate-500 font-mono mt-1 text-center md:text-left">
            A Zeppelin Labs project. Connect AI agents to the real world securely.
          </p>
        </div>
        
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <Link href="#protocols" className="hover:text-white transition-colors">Protocols</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="https://zeppelinlabs.com" target="_blank" className="hover:text-white transition-colors">Zeppelin Labs</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
