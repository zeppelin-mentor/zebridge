"use client";

import React, { useState } from "react";
import Logo from "../logo";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-40 w-full border-b border-white/5 bg-transparent backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Logo size={36} />
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#protocols" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150">
              Protocols
            </Link>
            <Link href="#agents" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150">
              Supported Agents
            </Link>
            <Link href="/blog" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150">
              Blog
            </Link>
            <Link href="#docs" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150">
              Documentation
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150">
              Pricing
            </Link>
            <Link href="https://zeppelinlabs.digital" target="_blank" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150">
              About Zeppelin Labs
            </Link>
          </nav>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150">
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors duration-150"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-white/5 backdrop-blur-lg">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              href="#protocols"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Protocols
            </Link>
            <Link
              href="#agents"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Supported Agents
            </Link>
            <Link
              href="/blog"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Blog
            </Link>
            <Link
              href="#docs"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Documentation
            </Link>
            <Link
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="https://zeppelinlabs.digital"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              About Zeppelin Labs
            </Link>
            <div className="mt-4 border-t border-white/5 pt-4 flex flex-col gap-2 px-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-center rounded-md py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-center rounded-md bg-white py-2 text-base font-semibold text-slate-900 hover:bg-slate-100"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
