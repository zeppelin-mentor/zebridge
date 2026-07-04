"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { 
  Brain, 
  Code, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  Terminal,
  Zap
} from "lucide-react";

export default function AgentsPage() {
  const agents = [
    {
      name: "Kiro IDE",
      logo: "/agents/kiro.svg",
      description: "AI-powered development environment with built-in MCP support",
      features: [
        "Native MCP integration",
        "One-click configuration",
        "Real-time tool execution",
        "Built-in code editor"
      ],
      status: "Fully Supported",
      color: "violet",
      setupDifficulty: "Easy"
    },
    {
      name: "Claude Desktop",
      logo: "/agents/claude.svg",
      description: "Anthropic's desktop AI assistant with MCP capabilities",
      features: [
        "Natural conversation flow",
        "File system access",
        "Tool chaining",
        "Context retention"
      ],
      status: "Fully Supported",
      color: "amber",
      setupDifficulty: "Medium"
    },
    {
      name: "Cursor",
      logo: "/agents/cursor.svg",
      description: "AI-first code editor built for productivity",
      features: [
        "Code completion",
        "Chat with codebase",
        "MCP tool access",
        "Multi-file editing"
      ],
      status: "Fully Supported",
      color: "blue",
      setupDifficulty: "Easy"
    },
    {
      name: "Windsurf",
      logo: "/agents/windsurf.svg",
      description: "Next-generation AI coding assistant",
      features: [
        "Flow mode",
        "Cascade intelligence",
        "Real-time collaboration",
        "MCP integration"
      ],
      status: "Fully Supported",
      color: "cyan",
      setupDifficulty: "Easy"
    },
    {
      name: "Gemini",
      logo: "/agents/gemini.svg",
      description: "Google's multimodal AI with function calling",
      features: [
        "REST API integration",
        "Function calling",
        "Multimodal capabilities",
        "Enterprise ready"
      ],
      status: "REST API",
      color: "emerald",
      setupDifficulty: "Medium"
    },
    {
      name: "ChatGPT",
      logo: "/agents/chatgpt.svg",
      description: "OpenAI's conversational AI with custom GPTs",
      features: [
        "Custom GPT actions",
        "REST API support",
        "Plugin ecosystem",
        "Enterprise features"
      ],
      status: "REST API",
      color: "green",
      setupDifficulty: "Medium"
    }
  ];

  const integrationMethods = [
    {
      title: "Model Context Protocol (MCP)",
      description: "Native integration for MCP-compatible agents",
      icon: Terminal,
      agents: ["Kiro IDE", "Claude Desktop", "Cursor", "Windsurf"],
      pros: [
        "Seamless tool discovery",
        "Automatic authentication",
        "Real-time execution",
        "No code required"
      ]
    },
    {
      title: "REST API",
      description: "Direct HTTP integration for any application",
      icon: Code,
      agents: ["ChatGPT", "Gemini", "Custom Apps"],
      pros: [
        "Universal compatibility",
        "Full control",
        "Custom workflows",
        "Language agnostic"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#090614] text-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-6 border-b border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Brain className="h-4 w-4" />
              Supported AI Agents
            </div>
            <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Works With Your Favorite AI Tools
            </h1>
            <p className="text-lg text-slate-400">
              Connect ZeBridge to leading AI agents through MCP or REST API for seamless tool integration
            </p>
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div 
                key={agent.name}
                className="bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all hover:transform hover:scale-[1.02]"
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${agent.color}-500 to-${agent.color}-600 rounded-xl flex items-center justify-center`}>
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        agent.status === "Fully Supported" 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : "bg-blue-500/10 text-blue-400"
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-4">
                  {agent.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {agent.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Setup Difficulty */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Setup Difficulty</span>
                  <span className={`text-xs font-semibold ${
                    agent.setupDifficulty === "Easy" 
                      ? "text-emerald-400" 
                      : "text-amber-400"
                  }`}>
                    {agent.setupDifficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Methods */}
      <section className="py-16 px-6 bg-gradient-to-b from-transparent to-[#0D0A1A]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-4 text-white">
              Two Ways to Integrate
            </h2>
            <p className="text-slate-400">
              Choose the integration method that works best for your workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {integrationMethods.map((method) => (
              <div 
                key={method.title}
                className="bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
                    <method.icon className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{method.title}</h3>
                </div>

                <p className="text-slate-400 mb-6">{method.description}</p>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Supported Agents:</h4>
                  <div className="flex flex-wrap gap-2">
                    {method.agents.map((agent) => (
                      <span 
                        key={agent}
                        className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-xs font-semibold"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Benefits:</h4>
                  <div className="space-y-2">
                    {method.pros.map((pro, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                        <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0" />
                        {pro}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Guide CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl p-8 text-center">
            <Zap className="h-12 w-12 text-violet-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Follow our comprehensive documentation to integrate ZeBridge with your AI agent in minutes
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                View Documentation
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-violet-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-600 transition-colors"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">
            Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-[#120B27]/40 border border-violet-500/10 rounded-2xl overflow-hidden">
              <thead>
                <tr className="border-b border-violet-500/10">
                  <th className="text-left p-4 text-white font-semibold">Feature</th>
                  <th className="text-center p-4 text-white font-semibold">MCP Native</th>
                  <th className="text-center p-4 text-white font-semibold">REST API</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/10">
                {[
                  { feature: "Tool Discovery", mcp: true, rest: false },
                  { feature: "Auto Authentication", mcp: true, rest: false },
                  { feature: "Real-time Execution", mcp: true, rest: true },
                  { feature: "Custom Workflows", mcp: false, rest: true },
                  { feature: "Universal Compatibility", mcp: false, rest: true },
                  { feature: "No Code Setup", mcp: true, rest: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 text-slate-300">{row.feature}</td>
                    <td className="p-4 text-center">
                      {row.mcp ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border border-slate-700 rounded mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.rest ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border border-slate-700 rounded mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
