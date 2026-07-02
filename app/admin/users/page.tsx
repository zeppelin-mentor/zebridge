"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Search, ShieldAlert, CheckCircle2, UserMinus, RefreshCw } from "lucide-react";

interface DevUser {
  id: string;
  email: string;
  plan: "free" | "pro" | "team" | "enterprise";
  role: "user" | "admin";
  keysCount: number;
  joinedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DevUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);

    try {
      const response = await fetch("/v1/admin/users");
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdatePlan = async (id: string, newPlan: "free" | "pro" | "team" | "enterprise") => {
    try {
      const response = await fetch("/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, updates: { plan: newPlan } }),
      });

      if (!response.ok) {
        throw new Error("Failed to update plan");
      }

      setUsers(prev => prev.map(u => {
        if (u.id === id) {
          return { ...u, plan: newPlan };
        }
        return u;
      }));
    } catch (error) {
      alert("Failed to update plan: " + (error as Error).message);
    }
  };

  const handleToggleRole = async (id: string, currentRole: "user" | "admin") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    try {
      const response = await fetch("/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, updates: { role: newRole } }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      setUsers(prev => prev.map(u => {
        if (u.id === id) {
          return { ...u, role: newRole };
        }
        return u;
      }));
    } catch (error) {
      alert("Failed to update role: " + (error as Error).message);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = selectedPlan === "All" || u.plan === selectedPlan.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-white/5 p-1 rounded-xl w-full sm:w-auto">
          {["All", "Free", "Pro", "Team", "Enterprise"].map((plan) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedPlan === plan
                  ? "bg-[#1C0E36] text-violet-400 border border-violet-500/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {plan}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-600" />
          <input
            type="text"
            placeholder="Search developer email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-violet-500/10 text-slate-300 placeholder-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-[#120B27]/20 border border-violet-500/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-400">
            <thead>
              <tr className="border-b border-violet-500/10 text-slate-500 font-mono bg-slate-950/40">
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Plan Level</th>
                <th className="p-4 font-semibold">Joined At</th>
                <th className="p-4 font-semibold">API Keys</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-500/10 font-mono">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    {/* Email */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200 font-sans text-xs">{u.email}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 font-mono">{u.id.slice(0, 8)}...</span>
                      </div>
                    </td>
                    {/* Role badge */}
                    <td className="p-4">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-bold uppercase">
                          <ShieldAlert className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase">
                          User
                        </span>
                      )}
                    </td>
                    {/* Select plan tier dropdown */}
                    <td className="p-4">
                      <select
                        value={u.plan}
                        onChange={(e) => handleUpdatePlan(u.id, e.target.value as any)}
                        className="bg-slate-950 border border-violet-500/10 px-2.5 py-1 text-[11px] rounded text-slate-300 font-mono focus:outline-none"
                      >
                        <option value="free">free</option>
                        <option value="pro">pro</option>
                        <option value="team">team</option>
                        <option value="enterprise">enterprise</option>
                      </select>
                    </td>
                    <td className="p-4 text-slate-400">{u.joinedAt}</td>
                    <td className="p-4 text-slate-300">{u.keysCount} active</td>
                    {/* Action triggers */}
                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-bold border transition-colors bg-violet-500/5 border-violet-500/10 text-violet-400 hover:bg-violet-500/10"
                      >
                        {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    {search || selectedPlan !== "All" 
                      ? "No users match your search criteria" 
                      : "No users found in the system"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
