"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { 
  BookOpen, 
  Code, 
  Key, 
  Zap, 
  Shield, 
  Database,
  Terminal,
  FileText,
  CheckCircle,
  ArrowRight,
  Copy,
  Check
} from "lucide-react";

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sections = [
    { id: "getting-started", title: "Getting Started", icon: Zap },
    { id: "authentication", title: "Authentication", icon: Shield },
    { id: "mcp-setup", title: "MCP Setup", icon: Terminal },
    { id: "rest-api", title: "REST API", icon: Code },
    { id: "tools", title: "Available Tools", icon: FileText },
    { id: "examples", title: "Examples", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#090614] text-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-6 border-b border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <BookOpen className="h-4 w-4" />
              Documentation
            </div>
            <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Complete Platform Documentation
            </h1>
            <p className="text-lg text-slate-400">
              Everything you need to integrate ZeBridge with your AI agents and applications
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  On This Page
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-1"
                    >
                      <section.icon className="h-4 w-4" />
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Documentation Content */}
            <div className="lg:col-span-3 space-y-16">
              
              {/* Getting Started */}
              <div id="getting-started" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Zap className="h-8 w-8 text-violet-400" />
                  Getting Started
                </h2>
                
                <div className="space-y-6 text-slate-300">
                  <p className="text-lg">
                    ZeBridge is a secure MCP (Model Context Protocol) server that connects AI agents to powerful document processing, image manipulation, and data transformation tools.
                  </p>

                  <div className="bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-white">Quick Start</h3>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li><strong>Sign Up:</strong> Create your account at <Link href="/signup" className="text-violet-400 hover:text-violet-300">zebridge.vercel.app</Link></li>
                      <li><strong>Generate API Key:</strong> Navigate to Dashboard → API Keys</li>
                      <li><strong>Configure MCP:</strong> Add ZeBridge to your AI agent's MCP configuration</li>
                      <li><strong>Start Building:</strong> Use any of our 13+ tools through your AI agent</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Authentication */}
              <div id="authentication" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-violet-400" />
                  Authentication
                </h2>

                <div className="space-y-6 text-slate-300">
                  <p>
                    ZeBridge uses API key authentication for secure access to all endpoints and tools.
                  </p>

                  <div className="bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-white">Getting Your API Key</h3>
                    <ol className="space-y-2 list-decimal list-inside">
                      <li>Sign in to your ZeBridge dashboard</li>
                      <li>Go to the "API Keys" tab</li>
                      <li>Click "Generate New Key"</li>
                      <li>Give your key a descriptive name</li>
                      <li>Copy and securely store your API key</li>
                    </ol>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <h4 className="font-bold text-amber-400 mb-2">⚠️ Security Best Practices</h4>
                    <ul className="space-y-1 list-disc list-inside text-sm">
                      <li>Never commit API keys to version control</li>
                      <li>Store keys in environment variables</li>
                      <li>Rotate keys periodically</li>
                      <li>Revoke unused keys immediately</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* MCP Setup */}
              <div id="mcp-setup" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Terminal className="h-8 w-8 text-violet-400" />
                  MCP Configuration
                </h2>

                <div className="space-y-6 text-slate-300">
                  <p>
                    Configure ZeBridge with any MCP-compatible client (Kiro IDE, Claude Desktop, etc.)
                  </p>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">For Kiro IDE</h3>
                    <p>Add to <code className="bg-slate-800 px-2 py-1 rounded text-violet-300">.kiro/settings/mcp.json</code>:</p>
                    
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-300 p-6 rounded-xl overflow-x-auto">
                        <code>{`{
  "mcpServers": {
    "zebridge": {
      "url": "https://zebridge.vercel.app/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(`{
  "mcpServers": {
    "zebridge": {
      "url": "https://zebridge.vercel.app/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`, 'mcp-config')}
                        className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {copiedSection === 'mcp-config' ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">For Claude Desktop</h3>
                    <p>Add to Claude's MCP settings file:</p>
                    
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-300 p-6 rounded-xl overflow-x-auto">
                        <code>{`{
  "mcpServers": {
    "zebridge": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-http"],
      "env": {
        "MCP_HTTP_URL": "https://zebridge.vercel.app/mcp",
        "MCP_HTTP_HEADERS": "Authorization: Bearer YOUR_API_KEY"
      }
    }
  }
}`}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(`{
  "mcpServers": {
    "zebridge": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-http"],
      "env": {
        "MCP_HTTP_URL": "https://zebridge.vercel.app/mcp",
        "MCP_HTTP_HEADERS": "Authorization: Bearer YOUR_API_KEY"
      }
    }
  }
}`, 'claude-config')}
                        className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {copiedSection === 'claude-config' ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* REST API */}
              <div id="rest-api" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Code className="h-8 w-8 text-violet-400" />
                  REST API Reference
                </h2>

                <div className="space-y-6 text-slate-300">
                  <p>
                    All tools are also available via REST API for direct integration.
                  </p>

                  <div className="bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-white">Base URL</h3>
                    <code className="text-violet-300">https://zebridge.vercel.app/v1/tools</code>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Authentication Header</h3>
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl">
                        <code>Authorization: Bearer YOUR_API_KEY</code>
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Example: PDF Merge</h3>
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-300 p-6 rounded-xl overflow-x-auto">
                        <code>{`POST /v1/tools/pdf-merge
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "pdfUrls": [
    "https://example.com/doc1.pdf",
    "https://example.com/doc2.pdf"
  ],
  "outputFilename": "merged.pdf"
}`}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(`POST /v1/tools/pdf-merge
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "pdfUrls": [
    "https://example.com/doc1.pdf",
    "https://example.com/doc2.pdf"
  ],
  "outputFilename": "merged.pdf"
}`, 'api-example')}
                        className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {copiedSection === 'api-example' ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Response Format</h3>
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-300 p-6 rounded-xl overflow-x-auto">
                        <code>{`{
  "success": true,
  "fileUrl": "https://zebridge.vercel.app/v1/download/outputs/...",
  "filename": "merged.pdf",
  "size": 524288,
  "executionId": "uuid-here"
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Tools */}
              <div id="tools" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <FileText className="h-8 w-8 text-violet-400" />
                  Available Tools
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "PDF Merge", endpoint: "/pdf-merge", desc: "Combine multiple PDFs" },
                    { name: "PDF Split", endpoint: "/pdf-split", desc: "Split PDF by pages" },
                    { name: "PDF to DOCX", endpoint: "/pdf-to-docx", desc: "Convert PDF to Word" },
                    { name: "Image Upscale", endpoint: "/image-upscale", desc: "Enhance image resolution" },
                    { name: "Remove Background", endpoint: "/remove-background", desc: "Remove image backgrounds" },
                    { name: "Generate QR Code", endpoint: "/generate-qrcode", desc: "Create QR codes" },
                    { name: "Generate Invoice", endpoint: "/generate-invoice", desc: "Create professional invoices" },
                    { name: "Generate Receipt", endpoint: "/generate-receipt", desc: "Create receipts" },
                    { name: "HTML to PDF", endpoint: "/html-to-pdf", desc: "Convert HTML to PDF" },
                    { name: "Markdown to PDF", endpoint: "/markdown-to-pdf", desc: "Convert Markdown to PDF" },
                    { name: "Text to DOCX", endpoint: "/text-to-docx", desc: "Create Word documents" },
                    { name: "JSON to Excel", endpoint: "/json-to-excel", desc: "Convert JSON to spreadsheet" },
                    { name: "OCR Extract Text", endpoint: "/ocr-extract-text", desc: "Extract text from images" },
                  ].map((tool) => (
                    <div key={tool.endpoint} className="bg-[#120B27]/40 border border-violet-500/10 rounded-xl p-4 hover:border-violet-500/30 transition-colors">
                      <h4 className="font-bold text-white mb-1">{tool.name}</h4>
                      <p className="text-sm text-slate-400 mb-2">{tool.desc}</p>
                      <code className="text-xs text-violet-300">/v1/tools{tool.endpoint}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div id="examples" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-violet-400" />
                  Usage Examples
                </h2>

                <div className="space-y-6">
                  <div className="bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-white">With Kiro IDE</h3>
                    <p className="text-slate-300 mb-4">
                      Once configured, simply ask your AI agent:
                    </p>
                    <div className="bg-slate-900 p-4 rounded-xl text-slate-300">
                      <p className="italic">"Merge these two PDFs: doc1.pdf and doc2.pdf"</p>
                      <p className="italic mt-2">"Generate a QR code for https://example.com"</p>
                      <p className="italic mt-2">"Remove the background from image.png"</p>
                    </div>
                  </div>

                  <div className="bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-white">JavaScript Example</h3>
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-300 p-6 rounded-xl overflow-x-auto">
                        <code>{`const response = await fetch('https://zebridge.vercel.app/v1/tools/generate-qrcode', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    data: 'https://example.com',
    size: 512
  })
});

const result = await response.json();
console.log('QR Code URL:', result.fileUrl);`}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(`const response = await fetch('https://zebridge.vercel.app/v1/tools/generate-qrcode', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    data: 'https://example.com',
    size: 512
  })
});

const result = await response.json();
console.log('QR Code URL:', result.fileUrl);`, 'js-example')}
                        className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {copiedSection === 'js-example' ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-white">Python Example</h3>
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-300 p-6 rounded-xl overflow-x-auto">
                        <code>{`import requests

response = requests.post(
    'https://zebridge.vercel.app/v1/tools/image-upscale',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'imageUrl': 'https://example.com/image.jpg',
        'scaleFactor': '2x'
    }
)

result = response.json()
print('Upscaled image:', result['fileUrl'])`}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(`import requests

response = requests.post(
    'https://zebridge.vercel.app/v1/tools/image-upscale',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'imageUrl': 'https://example.com/image.jpg',
        'scaleFactor': '2x'
    }
)

result = response.json()
print('Upscaled image:', result['fileUrl'])`, 'py-example')}
                        className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {copiedSection === 'py-example' ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need Help? */}
              <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-white">Need Help?</h3>
                <p className="text-slate-300 mb-6">
                  Can't find what you're looking for? We're here to help!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="mailto:team@zeppelinlabs.digital"
                    className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Contact Support
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-6 py-3 rounded-lg font-semibold hover:bg-violet-500/20 transition-colors"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
