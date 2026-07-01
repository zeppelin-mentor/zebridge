"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/logo";
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const initialPlan = searchParams.get("plan") || "free";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
    setMode(currentMode);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      // Save mock user in localStorage
      localStorage.setItem("zebridge_user", JSON.stringify({
        email,
        name: mode === "signup" ? name : email.split("@")[0],
        plan: initialPlan,
        createdAt: new Date().toISOString()
      }));
      router.push("/dashboard");
    }, 1500);
  };

  const triggerOAuth = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("zebridge_user", JSON.stringify({
        email: `oauth.${provider}@zeppelinlabs.com`,
        name: `OAuth User (${provider})`,
        plan: initialPlan,
        createdAt: new Date().toISOString()
      }));
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-[#0B0F19] overflow-hidden">
      {/* Dynamic backdrops */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,rgba(74,222,128,0.04)_50%,transparent_100%)] blur-[60px]" />
      <div className="absolute top-10 left-10 -z-10 h-[300px] w-[300px] bg-emerald-500/5 blur-[100px]" />
      <div className="absolute bottom-10 right-10 -z-10 h-[300px] w-[300px] bg-sky-500/5 blur-[100px]" />

      <div className="w-full max-w-md space-y-6">
        {/* Logo and tag */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/">
            <Logo size={42} />
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-slate-900/60 px-3 py-1 text-xs text-slate-400 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Secure connection established</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">
              {mode === "signin" ? "Welcome Back" : "Create Developer Account"}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              {mode === "signin" 
                ? "Enter your credentials to access your workspaces" 
                : `Signing up for the ZeBridge ${initialPlan.toUpperCase()} tier`}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-950/80 border border-white/5 focus:border-emerald-400/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950/80 border border-white/5 focus:border-emerald-400/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                {mode === "signin" && (
                  <Link href="#forgot" className="text-[10px] text-emerald-400 hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-white/5 focus:border-emerald-400/40 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-100 transition-colors duration-150 disabled:opacity-50 mt-2"
            >
              {isLoading ? "Connecting..." : mode === "signin" ? "Sign In" : "Sign Up"}
              {!isLoading && <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          {/* Separator */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-3 text-[10px] uppercase font-mono text-slate-500 bg-[#0B0F19]">
              Or continue with
            </span>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => triggerOAuth("github")}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-slate-950 hover:bg-slate-900 py-2.5 text-xs font-semibold text-slate-300 transition-colors"
            >
              <svg className="h-4 w-4 text-slate-400 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </button>
            <button
              onClick={() => triggerOAuth("google")}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-slate-950 hover:bg-slate-900 py-2.5 text-xs font-semibold text-slate-300 transition-colors"
            >
              <svg className="h-4 w-4 text-slate-400 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.28.62 4.51 1.64l2.42-2.42C17.31 1.61 14.93 1 12.24 1 6.72 1 2.24 5.48 2.24 11s4.48 10 10 10c5.76 0 10-4.05 10-10 0-.675-.08-1.335-.225-1.95H12.24z" />
              </svg>
              Google
            </button>
          </div>
        </div>

        {/* State Toggle Footer */}
        <p className="text-center text-xs text-slate-400">
          {mode === "signin" ? "New to ZeBridge? " : "Already have an account? "}
          <button
            onClick={() => {
              setError("");
              setMode(mode === "signin" ? "signup" : "signin");
            }}
            className="font-semibold text-emerald-400 hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in here"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center font-mono text-xs text-slate-500">
        LOADING DEVELOPER CLIENT...
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
