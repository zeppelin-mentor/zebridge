"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; plan: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedUser = localStorage.getItem("zebridge_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Default mock developer session for demo ease
      const defaultUser = {
        name: "Dev Mentor",
        email: "mentor@zeppelinlabs.com",
        plan: "free"
      };
      setUser(defaultUser);
      localStorage.setItem("zebridge_user", JSON.stringify(defaultUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("zebridge_user");
    router.push("/auth?mode=signin");
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center font-mono text-xs text-slate-500">
        INITIALIZING SECURE SESSION...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B0F19] text-white">
      {/* Dashboard Sidebar Navigation */}
      <DashboardSidebar 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Workspace Sub-header */}
        <DashboardHeader />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
