import React from "react";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "For developers testing local MCP configurations.",
      features: [
        "25 executions / day",
        "100 MB temporary storage",
        "Basic file tools (Merge, QR)",
        "Community support channel",
        "Shared queue routing",
      ],
      cta: "Get Started",
      href: "/signup",
      popular: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/mo",
      desc: "For professional developers scaling agentic systems.",
      features: [
        "Unlimited executions",
        "10 GB cloud storage limit",
        "Premium tools (OCR, AI analysis)",
        "Dedicated fast-track queues",
        "REST API key management",
        "Email support response under 2h",
      ],
      cta: "Upgrade to Pro",
      href: "/signup",
      popular: true,
    },
    {
      name: "Team",
      price: "$79",
      period: "/mo",
      desc: "For collaborative squads managing joint workspace tooling.",
      features: [
        "Everything in Pro",
        "Up to 5 team members",
        "Shared dashboard workspace",
        "Full audit logging export",
        "Usage tracking per user",
        "Collaborative API key rolls",
      ],
      cta: "Start Free Trial",
      href: "/signup",
      popular: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For compliance-bound organizations demanding air-gapped isolation.",
      features: [
        "Dedicated isolated MCP server",
        "Self-hosted Docker instances",
        "99.9% execution availability SLA",
        "SSO / SAML 2.0 Auth gateway",
        "Custom private tool builder SDK",
        "24/7 dedicated engineering team",
      ],
      cta: "Contact Sales",
      href: "mailto:enterprise@zeppelinlabs.com",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-950/20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Flexible pricing built for developers
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            Start completely free to integrate with Claude Code or Cursor. Upgrade as you need higher capacity or production API access.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border flex flex-col justify-between p-6 transition-all duration-300 relative ${
                plan.popular
                  ? "bg-slate-900 border-emerald-400/40 shadow-[0_0_30px_rgba(74,222,128,0.1)] scale-105 z-10"
                  : "bg-slate-900/40 border-white/5 hover:border-white/10"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-400 text-slate-950 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-2 min-h-[32px]">{plan.desc}</p>
                <div className="mt-4 flex items-baseline gap-1 text-white">
                  <span className="text-3xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-xs text-slate-400 font-mono">{plan.period}</span>}
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={plan.href}
                  className={`block text-center rounded-xl py-2.5 text-xs font-bold transition-colors ${
                    plan.popular
                      ? "bg-emerald-400 text-slate-950 hover:bg-emerald-500"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
