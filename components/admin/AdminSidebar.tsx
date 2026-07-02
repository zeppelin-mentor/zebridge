"use client";

import React from "react";
import Logo from "../logo";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Activity, 
  LogOut, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { id: "overview", label: "Admin Analytics", href: "/admin", icon: BarChart3 },
    { id: "users", label: "Developer Directory", href: "/admin/users", icon: Users },
    { id: "blog", label: "Blog Manager", href: "/admin/blog", icon: BookOpen },
  ];

  const handleLogout = () => {
    localStorage.removeItem("zebridge_admin_user");
    router.push("/auth?mode=signin");
  };

  return (
    <aside className="w-full md:w-64 bg-[#090614] border-r border-violet-500/10 flex flex-col justify-between shrink-0 p-4 font-sans text-slate-400">
      <div className="space-y-8">
        {/* Header Logo */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href="/">
            <div className="flex items-center gap-2 select-none">
              <Logo size={28} iconOnly />
              <span className="font-bold tracking-tight text-white text-base">
                Ze<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Admin</span>
              </span>
            </div>
          </Link>
          <Link 
            href="/dashboard"
            className="text-[10px] uppercase font-mono hover:text-white flex items-center gap-1 border border-violet-500/10 bg-[#160E30] px-2 py-1 rounded transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Workspace
          </Link>
        </div>

        {/* Status Indicator */}
        <div className="bg-[#120B27]/50 rounded-xl p-3 border border-violet-500/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="font-semibold text-slate-200">System Kernel: OK</span>
          </div>
          <span className="text-[10px] text-violet-400 font-mono">1.0.0-adm</span>
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
                    ? "bg-gradient-to-r from-violet-500/10 to-transparent text-white border-l-2 border-violet-400" 
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-violet-400" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="pt-4 border-t border-violet-500/10 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-violet-500/10">
            <img src="/developer_avatar.png" alt="Admin Profile" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">System Admin</p>
            <p className="text-[10px] text-slate-500 truncate">admin@zeppelinlabs.com</p>
            <span className="inline-block mt-0.5 text-[9px] bg-violet-500/20 text-violet-400 px-1.5 py-0.2 rounded font-bold font-mono uppercase">
              Root Level
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Exit Admin Mode
        </button>
      </div>
    </aside>
  );
}
