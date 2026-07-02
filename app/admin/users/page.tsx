"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Search, ShieldAlert, CheckCircle2, UserMinus, RefreshCw } from "lucide-react";

interface DevUser {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro" | "team" | "enterprise";
  status: "active" | "suspended";
  keysCount: number;
  joinedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DevUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All");

  useEffect(() => {
    const defaultUsers: DevUser[] = [
      { id: "u-101", email: "madnan@zeppelinlabs.com", name: "Madnan Sultan", plan: "enterprise", status: "active", keysCount: 4, joinedAt: "2026-06-01" },
      { id: "u-102", email: "alice.dev@gmail.com", name: "Alice Developer", plan: "pro", status: "active", keysCount: 2, joinedAt: "2026-06-15" },
      { id: "u-103", email: "bob.builds@outlook.com", name: "Bob the SaaS Builder", plan: "free", status: "active", keysCount: 1, joinedAt: "2026-06-20" },
      { id: "u-104", email: "spammer.bot@trashmail.com", name: "Bot Account Mock", plan: "free", status: "suspended", keysCount: 0, joinedAt: "2026-06-28" }
    ];
    setUsers(defaultUsers);
  }, []);

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === "active" ? "suspended" : "active";
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleUpdatePlan = (id: string, newPlan: "free" | "pro" | "team" | "enterprise") => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, plan: newPlan };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = selectedPlan === "All" || u.plan === selectedPlan.toLowerCase();
    return matchesSearch && matchesPlan;
  });

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
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Plan Level</th>
                <th className="p-4 font-semibold">Joined At</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">API Keys</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-500/10 font-mono">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                  {/* Profile info */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200 font-sans text-xs">{u.name}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{u.email}</span>
                    </div>
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
                  {/* Status Indicator */}
                  <td className="p-4">
                    {u.status === "active" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-bold">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-300">{u.keysCount} active</td>
                  {/* Action triggers */}
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-bold border transition-colors ${
                        u.status === "active"
                          ? "bg-rose-500/5 border-rose-500/10 text-rose-400 hover:bg-rose-500/10"
                          : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      {u.status === "active" ? "Suspend Account" : "Re-Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
