"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/login?message=Please sign in to access admin");
      return;
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !userData || userData.role !== "admin") {
      router.push("/dashboard?message=Unauthorized: Admin access required");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-[#090614] flex items-center justify-center font-mono text-xs text-slate-600">
        LOADING ADMIN ENGINE CORE...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#090614] flex items-center justify-center font-mono text-xs text-rose-400">
        UNAUTHORIZED ACCESS
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
