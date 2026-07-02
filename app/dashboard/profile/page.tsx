"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Calendar, Shield, Save, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return;

      setUser(authUser);

      // Get user data from database
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name }
      });

      if (authError) throw authError;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      loadUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-400 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
        <p className="text-sm text-slate-400">Manage your account information and preferences</p>
      </div>

      {message && (
        <div className={`rounded-2xl p-4 flex items-start gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20' 
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${
            message.type === 'success' ? 'text-emerald-400' : 'text-red-400'
          }`} />
          <p className="text-xs text-slate-300">{message.text}</p>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Account Information</h3>
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              <User className="inline h-3 w-3 mr-1" />
              Display Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={user?.user_metadata?.name || user?.email?.split('@')[0] || ''}
              className="w-full bg-slate-950/80 border border-white/5 focus:border-emerald-400/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              <Mail className="inline h-3 w-3 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-600 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              <Calendar className="inline h-3 w-3 mr-1" />
              Member Since
            </label>
            <input
              type="text"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'N/A'}
              disabled
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              <Shield className="inline h-3 w-3 mr-1" />
              Current Plan
            </label>
            <div className="flex items-center gap-3">
              <span className="inline-block bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded-lg text-sm font-bold uppercase">
                {userData?.plan || 'free'}
              </span>
              {userData?.plan === 'free' && (
                <button
                  type="button"
                  className="text-xs text-emerald-400 hover:underline"
                  onClick={() => alert('Upgrade functionality coming soon!')}
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Usage Stats */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Usage Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Storage Used</p>
            <p className="text-lg font-bold text-white">
              {((userData?.storage_used || 0) / (1024 * 1024)).toFixed(2)} MB
            </p>
            <p className="text-[10px] text-slate-600">of 100 MB</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">API Requests</p>
            <p className="text-lg font-bold text-white">0</p>
            <p className="text-[10px] text-slate-600">this month</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2">Danger Zone</h3>
        <p className="text-xs text-slate-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              alert('Account deletion functionality coming soon!');
            }
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 text-xs font-bold text-red-400 transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
