import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZeBridge - AI Tool Bridge for MCP, APIs, and Web",
  description: "Connect AI agents like Claude Code, Cursor, Windsurf, and Gemini CLI to secure, real-world tools via Model Context Protocol (MCP) and REST APIs.",
  keywords: ["AI Agents", "MCP Server", "Model Context Protocol", "Claude Code", "Cursor IDE", "REST API tools"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#0B0F19] text-white selection:bg-emerald-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

