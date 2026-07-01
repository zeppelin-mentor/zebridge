"use client";

import React from "react";
import Logo from "../logo";
import { 
  Activity, 
  Cpu, 
  FileCode, 
  Key, 
  Terminal, 
  LogOut, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  user: { name: string; email: string; plan: string } | null;
  onLogout: () => void;
}

export default function DashboardSidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { id: "overview", label: "Overview", href: "/dashboard", icon: Activity },
    { id: "agents", label: "Active Agents", href: "/dashboard/agents", icon: Cpu, badge: "3" },
    { id: "tools", label: "Tool Registry", href: "/dashboard/tools", icon: FileCode },
    { id: "keys", label: "API Keys", href: "/dashboard/keys", icon: Key },
    { id: "logs", label: "Audit Logs", href: "/dashboard/logs", icon: Terminal },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#070A11] border-r border-white/5 flex flex-col justify-between shrink-0 p-4 font-sans text-slate-400">
      <div className="space-y-8">
        {/* Header Logo */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href="/">
            <Logo size={28} />
          </Link>
          <Link 
            href="/"
            className="text-[10px] uppercase font-mono hover:text-white flex items-center gap-1 border border-white/5 bg-slate-900 px-2 py-1 rounded transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Home
          </Link>
        </div>

        {/* Status Indicator */}
        <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">MCP Server Online</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">12ms</span>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                  isActive 
                    ? "bg-gradient-to-r from-emerald-500/10 to-transparent text-white border-l-2 border-emerald-400" 
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : ""}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10">
            <img src="/developer_avatar.png" alt="User Profile" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || "Guest Developer"}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || "guest@zeppelinlabs.com"}</p>
            <span className="inline-block mt-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-bold font-mono uppercase">
              {user?.plan || "free"} Plan
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout Session
        </button>
      </div>
    </aside>
  );
}
