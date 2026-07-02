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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://zebridge.vercel.app'),
  title: {
    default: "ZeBridge - Universal Tooling for AI Agents",
    template: "%s | ZeBridge"
  },
  description: "Connect AI agents like Claude, Cursor, Windsurf, and Gemini to secure, real-world tools via Model Context Protocol (MCP). PDF manipulation, image processing, document generation, and more.",
  keywords: [
    "AI Agents",
    "MCP Server",
    "Model Context Protocol",
    "Claude Code",
    "Cursor IDE",
    "Windsurf",
    "Gemini CLI",
    "REST API tools",
    "PDF tools",
    "Image processing",
    "Document generation",
    "AI automation",
    "Developer tools",
    "Zeppelin Labs"
  ],
  authors: [
    {
      name: "Zeppelin Labs",
      url: "https://zeppelinlabs.digital"
    }
  ],
  creator: "Zeppelin Labs",
  publisher: "Zeppelin Labs",
  applicationName: "ZeBridge",
  category: "Developer Tools",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://zebridge.vercel.app',
    siteName: "ZeBridge",
    title: "ZeBridge - Universal Tooling for AI Agents",
    description: "Connect AI agents to secure, real-world tools via Model Context Protocol (MCP). Empower Claude, Cursor, and Gemini with PDF manipulation, image processing, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZeBridge - Universal Tooling for AI Agents",
      }
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "ZeBridge - Universal Tooling for AI Agents",
    description: "Connect AI agents to secure, real-world tools via Model Context Protocol (MCP)",
    images: ["/og-image.png"],
    creator: "@zeppelinlabs",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  verification: {
    google: "your-google-verification-code",
    // Add other verification codes as needed
  },
  
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://zebridge.vercel.app',
  },
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#4ADE80" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0B0F19] text-white selection:bg-emerald-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

