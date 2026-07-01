import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
}

export default function Logo({ className = "", iconOnly = false, size = 32 }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-emerald-400 filter drop-shadow-[0_0_8px_rgba(74,222,128,0.3)] transition-transform duration-300 hover:scale-105"
      >
        {/* Background rounded polygon */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="24"
          fill="url(#logo-grad-bg)"
          stroke="url(#logo-grad-border)"
          strokeWidth="4"
        />
        
        {/* The Bridge / Z geometric shape */}
        <path
          d="M 30 35 L 70 35 L 30 65 L 70 65"
          stroke="url(#logo-grad-accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Connection node 1 (Top Left) */}
        <circle cx="30" cy="35" r="7" fill="#38BDF8" className="animate-pulse" />
        
        {/* Connection node 2 (Bottom Right) */}
        <circle cx="70" cy="65" r="7" fill="#38BDF8" className="animate-pulse" />
        
        {/* Center bridge connection path */}
        <path
          d="M 30 35 Q 50 50 70 65"
          stroke="#ffffff"
          strokeWidth="3"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="logo-grad-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B0F19" />
            <stop offset="1" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="logo-grad-border" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#4ADE80" />
          </linearGradient>
          <linearGradient id="logo-grad-accent" x1="30" y1="35" x2="70" y2="65" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ADE80" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
      </svg>

      {!iconOnly && (
        <span className="font-sans font-bold tracking-tight text-white" style={{ fontSize: `${size * 0.6}px` }}>
          Ze<span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">Bridge</span>
        </span>
      )}
    </div>
  );
}
