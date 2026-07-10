"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Image as ImageIcon, 
  Briefcase, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ArrowUpRight,
  Mail
} from "lucide-react";

interface ToolItem {
  name: string;
  slug: string;
  category: "PDF" | "Images" | "Office" | "AI" | "Comms";
  desc: string;
  premium: boolean;
  inputs: string[];
}

export default function ToolsCatalog() {
  const [activeCategory, setActiveCategory] = useState<"PDF" | "Images" | "Office" | "AI" | "Comms">("PDF");

  const toolsList: ToolItem[] = [
    // PDF
    { 
      name: "Merge PDFs", 
      slug: "pdf-merge", 
      category: "PDF", 
      desc: "Combines multiple PDF documents into a single consolidated file.", 
      premium: false,
      inputs: ["pdfUrls (array)"] 
    },
    { 
      name: "Split PDF", 
      slug: "pdf-split", 
      category: "PDF", 
      desc: "Splits pages from a PDF document into separate page extracts.", 
      premium: false,
      inputs: ["pdfUrl (string)", "ranges (string)"] 
    },
    { 
      name: "PDF to DOCX", 
      slug: "pdf-to-docx", 
      category: "PDF", 
      desc: "Converts PDF documents to editable Microsoft Word format.", 
      premium: false,
      inputs: ["pdfUrl (string)", "outputFilename (string)"] 
    },
    { 
      name: "Markdown to PDF", 
      slug: "markdown-to-pdf", 
      category: "PDF", 
      desc: "Converts Markdown formatted text into professional PDF documents.", 
      premium: false,
      inputs: ["markdown (string)", "title (string)"] 
    },
    { 
      name: "HTML to PDF", 
      slug: "html-to-pdf", 
      category: "PDF", 
      desc: "Converts HTML content into formatted PDF documents.", 
      premium: false,
      inputs: ["html (string)", "title (string)"] 
    },
    
    // Images
    { 
      name: "Background Removal", 
      slug: "remove-background", 
      category: "Images", 
      desc: "Removes background alpha mask from images using high-fidelity segmentation.", 
      premium: true,
      inputs: ["imageUrl (string)", "outputFormat (string)"] 
    },
    { 
      name: "Image Upscaling", 
      slug: "image-upscale", 
      category: "Images", 
      desc: "Doubles visual dimensions of inputs using super-resolution neural rendering.", 
      premium: true,
      inputs: ["imageUrl (string)", "scaleFactor (string)"] 
    },
    
    // Office Documents
    { 
      name: "Text to DOCX", 
      slug: "text-to-docx", 
      category: "Office", 
      desc: "Converts plain text content into formatted Microsoft Word documents.", 
      premium: false,
      inputs: ["text (string)", "title (string)"] 
    },
    { 
      name: "JSON to Excel", 
      slug: "json-to-excel", 
      category: "Office", 
      desc: "Converts JSON data arrays into Excel spreadsheet format (CSV).", 
      premium: false,
      inputs: ["data (string)", "sheetName (string)"] 
    },
    { 
      name: "Generate Receipt", 
      slug: "generate-receipt", 
      category: "Office", 
      desc: "Creates professional receipt PDFs with itemized billing details.", 
      premium: false,
      inputs: ["receiptNumber (string)", "items (JSON string)", "total (string)", "toName (string)"] 
    },
    { 
      name: "DOCX to Markdown", 
      slug: "docx-to-markdown", 
      category: "Office", 
      desc: "Converts Word documents to Markdown format — ideal for AI agent pipelines.", 
      premium: false,
      inputs: ["docxUrl (string)", "includeHeadings (boolean)"] 
    },
    { 
      name: "CSV to JSON", 
      slug: "csv-to-json", 
      category: "Office", 
      desc: "Parses CSV text into a structured JSON array with automatic header detection.", 
      premium: false,
      inputs: ["csv (string)", "delimiter (string)"] 
    },
    { 
      name: "Excel to JSON", 
      slug: "excel-to-json", 
      category: "Office", 
      desc: "Fetches a CSV/Excel file from a URL and converts it to a structured JSON array.", 
      premium: false,
      inputs: ["fileUrl (string)", "delimiter (string)"] 
    },
    { 
      name: "DOCX Template Filler", 
      slug: "docx-template-filler", 
      category: "Office", 
      desc: "Merges dynamic variables into a DOCX template using {variable} placeholder syntax.", 
      premium: false,
      inputs: ["templateUrl (string)", "variables (object)"] 
    },
    { 
      name: "Generate PPTX", 
      slug: "generate-pptx", 
      category: "Office", 
      desc: "Generates a full PowerPoint presentation with slides, bullet points, and themes.", 
      premium: true,
      inputs: ["presentationTitle (string)", "slides (array)", "theme (string)"] 
    },
    
    // AI
    { 
      name: "Invoice Generator", 
      slug: "generate-invoice", 
      category: "AI", 
      desc: "Creates professional invoices with automated calculations and formatting.", 
      premium: true,
      inputs: ["invoiceNumber (string)", "fromName (string)", "toName (string)", "items (JSON string)"] 
    },
    { 
      name: "OCR Extract Text", 
      slug: "ocr-extract-text", 
      category: "AI", 
      desc: "Extracts text content from images using optical character recognition.", 
      premium: true,
      inputs: ["imageUrl (string)"] 
    },
    { 
      name: "QR Code Generator", 
      slug: "generate-qrcode", 
      category: "AI", 
      desc: "Generates high-resolution QR codes from text or URL inputs.", 
      premium: false,
      inputs: ["text (string)"] 
    },

    // Communication & Notifications
    { 
      name: "Send Email", 
      slug: "send-email", 
      category: "Comms", 
      desc: "Sends an email via SMTP. Uses QStash for reliable delivery with automatic retries on failure.", 
      premium: false,
      inputs: ["to (email)", "subject (string)", "body (string)", "isHtml (boolean)"] 
    },
    { 
      name: "Send Webhook", 
      slug: "send-webhook", 
      category: "Comms", 
      desc: "Posts a notification message to Slack, Discord, or any custom webhook endpoint.", 
      premium: false,
      inputs: ["webhookUrl (string)", "message (string)", "platform (slack|discord|generic)"] 
    },
    { 
      name: "Email Template", 
      slug: "generate-email-template", 
      category: "Comms", 
      desc: "Generates a styled HTML email from structured inputs — ready to pass to send-email.", 
      premium: false,
      inputs: ["subject (string)", "heading (string)", "body (string)", "ctaText (string)", "ctaUrl (string)"] 
    },
  ];


  const categories = [
    { id: "PDF" as const, label: "PDF Document Tools", icon: FileText },
    { id: "Images" as const, label: "Image Processing", icon: ImageIcon },
    { id: "Office" as const, label: "Office & Sheets", icon: Briefcase },
    { id: "AI" as const, label: "AI & Utilities", icon: Sparkles },
    { id: "Comms" as const, label: "Communication", icon: Mail },
  ];


  const filteredTools = toolsList.filter(t => t.category === activeCategory);

  return (
    <section id="tools-catalog" className="py-20 bg-slate-900/10 border-t border-white/5 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-sky-500/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Tool Library
          </h2>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Explore our pre-built AI-ready tools
          </h3>
          <p className="mt-4 text-slate-400 text-base">
            These tools are fully implemented and optimized. AI agents can access them via the Model Context Protocol (MCP) or you can invoke them via developer APIs.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-white text-slate-950 shadow-[0_4px_20px_rgba(255,255,255,0.1)] scale-105" 
                    : "bg-slate-900/50 text-slate-400 hover:text-white border border-white/5 hover:bg-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div 
              key={tool.slug}
              className="group flex flex-col justify-between p-6 rounded-2xl border border-white/5 bg-slate-950/40 hover:border-emerald-500/20 hover:bg-slate-950/80 transition-all duration-300 relative overflow-hidden"
            >
              {/* Premium Glow effect */}
              {tool.premium && (
                <div className="absolute top-0 right-0 -tr-10 h-16 w-16 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-md pointer-events-none" />
              )}

              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    tool.premium 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-slate-800 text-slate-300"
                  }`}>
                    {tool.premium ? "Premium" : "Free"}
                  </span>
                  <code className="text-[10px] text-slate-500 font-mono font-semibold bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                    {tool.slug}
                  </code>
                </div>

                {/* Info */}
                <h4 className="text-base font-bold text-slate-100 group-hover:text-white transition-colors">
                  {tool.name}
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              {/* Inputs & Action */}
              <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                {/* Inputs badge */}
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-mono">Parameters:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {tool.inputs.map((inp) => (
                      <span key={inp} className="text-[10px] text-slate-300 font-mono bg-slate-900/80 px-2 py-0.5 rounded">
                        {inp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct CTA */}
                <Link
                  href="/signup"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-400 hover:text-slate-950 hover:border-emerald-400 transition-all duration-200 group-hover:bg-white/10"
                >
                  Get API Access
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Global Catalog Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500">
            Need custom tools for your team? 
            <Link href="mailto:team@zeppelinlabs.digital" className="text-emerald-400 font-semibold ml-1 hover:underline">
              Contact Zeppelin Labs
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
}
