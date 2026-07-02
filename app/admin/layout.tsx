"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Secure verification simulation
    const savedUser = localStorage.getItem("zebridge_user");
    if (!savedUser) {
      // Mock log-in session for validation ease
      localStorage.setItem("zebridge_user", JSON.stringify({
        email: "admin@zeppelinlabs.com",
        name: "SysAdmin Root",
        plan: "enterprise"
      }));
    }
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#090614] flex items-center justify-center font-mono text-xs text-slate-600">
        LOADING ADMIN ENGINE CORE...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#090614] text-white">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Administrative Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sub-header */}
        <AdminHeader />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
