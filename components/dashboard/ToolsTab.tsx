"use client";

import React, { useState } from "react";
import { 
  Play, 
  Upload, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Cpu, 
  Wrench, 
  Search, 
  CheckCircle2, 
  Terminal as TermIcon,
  RefreshCw
} from "lucide-react";

interface ToolItem {
  name: string;
  slug: string;
  category: "PDF" | "Images" | "Office" | "AI";
  desc: string;
  premium: boolean;
}

export default function ToolsTab() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  
  // Execution Console State
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [mockFileName, setMockFileName] = useState("sample_avatar.png");
  const [isFinished, setIsFinished] = useState(false);

  const toolsList: ToolItem[] = [
    // PDF
    { name: "Merge PDFs", slug: "pdf-merge", category: "PDF", desc: "Combines multiple PDF documents into a single consolidated file.", premium: false },
    { name: "Split PDF", slug: "pdf-split", category: "PDF", desc: "Splits pages from a PDF document into separate page extracts.", premium: false },
    { name: "Markdown to PDF", slug: "markdown-to-pdf", category: "PDF", desc: "Converts Markdown formatted text into professional PDF documents.", premium: false },
    { name: "HTML to PDF", slug: "html-to-pdf", category: "PDF", desc: "Converts HTML content into formatted PDF documents.", premium: false },
    
    // Images
    { name: "Background Removal", slug: "remove-background", category: "Images", desc: "Removes background alpha mask from images using high-fidelity segmentation.", premium: true },
    { name: "Image Upscaling", slug: "image-upscale", category: "Images", desc: "Doubles visual dimensions of inputs using super-resolution neural rendering.", premium: true },
    
    // Office Documents
    { name: "Text to DOCX", slug: "text-to-docx", category: "Office", desc: "Converts plain text content into formatted Microsoft Word documents.", premium: false },
    { name: "JSON to Excel", slug: "json-to-excel", category: "Office", desc: "Converts JSON data arrays into Excel spreadsheet format (CSV).", premium: false },
    { name: "Generate Receipt", slug: "generate-receipt", category: "Office", desc: "Creates professional receipt PDFs with itemized billing details.", premium: false },
    
    // AI
    { name: "Invoice Generator", slug: "generate-invoice", category: "AI", desc: "Creates professional invoices with automated calculations and formatting.", premium: true },
    { name: "OCR Extract Text", slug: "ocr-extract-text", category: "AI", desc: "Extracts text content from images using optical character recognition.", premium: true },
    { name: "QR Code Generator", slug: "generate-qrcode", category: "AI", desc: "Generates high-resolution QR codes from text or URL inputs.", premium: false }
  ];

  const categories = ["All", "PDF", "Images", "Office", "AI"];

  const filteredTools = toolsList.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || 
                          tool.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectToolForExecution = (tool: ToolItem) => {
    setSelectedTool(tool);
    setIsFinished(false);
    setProgress(0);
    setLogs([]);
    if (tool.category === "PDF") {
      setMockFileName("annual_report_draft.pdf");
    } else if (tool.category === "Images") {
      setMockFileName("profile_photo_raw.png");
    } else {
      setMockFileName("input_dataset.json");
    }
  };

  const executeSandboxTool = () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setIsFinished(false);
    setProgress(0);
    setLogs(["[DISPATCH] Queueing task in region: US-East-1 (AWS)..."]);

    const executionLogs = [
      "[WORKER] Spawned container runtime instance: node-19-alpine-slim",
      "[SANDBOX] Locked input file descriptors: /tmp/uploads/" + mockFileName,
      `[PROCESS] Resolving execution arguments for module: [${selectedTool?.slug}]`,
      "[NEURAL] Launching execution pipeline... (CUDA drivers allocated)",
      "[NEURAL] Scanning input buffers & layouts...",
      "[NEURAL] Optimizing transparency levels (alpha layer mapping)",
      "[WORKER] Generating result asset buffer...",
      "[STORAGE] Uploading output files to bucket: supabase/outputs/",
      "[DISPATCH] Job completed successfully! Output file hash: sha256_9c228fb"
    ];

    let currentLogIdx = 0;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLogs(prevLogs => [...prevLogs, "[DISPATCH] Releasing worker process thread. OK."]);
          setTimeout(() => {
            setIsExecuting(false);
            setIsFinished(true);
          }, 400);
          return 100;
        }

        // Inject log statement at milestones
        const checkLog = Math.floor(prev / 11);
        if (checkLog > currentLogIdx && currentLogIdx < executionLogs.length) {
          setLogs(prevLogs => [...prevLogs, executionLogs[currentLogIdx]]);
          currentLogIdx++;
        }

        return prev + 5;
      });
    }, 120);
  };

  return (
    <div className="space-y-6">
      {/* Category selector & Search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 border border-white/5 p-1 rounded-xl w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search registry tools..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-white/5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Tools Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTools.map((tool) => (
            <button
              key={tool.slug}
              onClick={() => selectToolForExecution(tool)}
              className={`text-left rounded-2xl p-5 border transition-all duration-200 relative group flex flex-col justify-between h-40 ${
                selectedTool?.slug === tool.slug
                  ? "bg-slate-900 border-emerald-400/40 shadow-[0_0_20px_rgba(74,222,128,0.05)]"
                  : "bg-slate-900/30 border-white/5 hover:border-white/10 hover:bg-slate-900/40"
              }`}
            >
              {tool.premium && (
                <span className="absolute top-4 right-4 bg-sky-500/10 text-sky-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Pro Tool
                </span>
              )}
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">{tool.category}</span>
                <h4 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">{tool.name}</h4>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{tool.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Slug: {tool.slug}</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  Sandbox
                  <Play className="h-2.5 w-2.5 fill-emerald-400" />
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Right Side: Execution Console */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
          {selectedTool ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{selectedTool.name}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">[{selectedTool.slug}]</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedTool.desc}</p>
              </div>

              {/* Upload input preview */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-white/5 space-y-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Input File Assets</span>
                <div className="border border-dashed border-white/10 rounded-lg p-4 text-center hover:bg-slate-900/20 transition-colors cursor-pointer relative">
                  <Upload className="h-5 w-5 text-slate-500 mx-auto mb-2" />
                  <span className="text-xs text-slate-300 font-medium block">{mockFileName}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Drag file or click to change</span>
                </div>
              </div>

              {/* Console logs output */}
              {(isExecuting || logs.length > 0) && (
                <div className="bg-slate-950 rounded-xl border border-white/5 p-4 font-mono text-[10px] space-y-2 max-h-40 overflow-y-auto">
                  <div className="flex items-center justify-between text-slate-500 border-b border-white/5 pb-1">
                    <span className="flex items-center gap-1">
                      <TermIcon className="h-3 w-3" />
                      Worker stdout
                    </span>
                    {isExecuting && <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />}
                  </div>
                  <div className="space-y-1 text-slate-400">
                    {logs.map((log, idx) => (
                      <div key={idx} className="leading-normal">{log}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress and status */}
              {isExecuting && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Processing file nodes...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Success Result Container */}
              {isFinished && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>Tool executed successfully!</span>
                  </div>

                  {/* Render Visual Mock Asset if Image tool */}
                  {selectedTool.category === "Images" && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-white/5 bg-slate-950 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:8px_8px] grid grid-cols-2" />
                      <div className="z-10 text-center p-3">
                        <ImageIcon className="h-8 w-8 text-emerald-400 mx-auto opacity-75 mb-1" />
                        <span className="text-[10px] text-slate-400 font-mono block">output_alpha_{mockFileName}</span>
                        <span className="text-[9px] text-slate-500 block">Transparent Mask PNG &bull; 1.4 MB</span>
                      </div>
                    </div>
                  )}

                  {/* Render Visual Mock Document if PDF or AI tool */}
                  {(selectedTool.category === "PDF" || selectedTool.category === "AI") && (
                    <div className="rounded-lg border border-white/5 bg-slate-950 p-3 flex items-center gap-3">
                      <FileText className="h-8 w-8 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-200 font-semibold block truncate">output_processed_{mockFileName}</span>
                        <span className="text-[9px] text-slate-500 block">Formatted Artifact &bull; 850 KB</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => alert(`Success: Saved output_${mockFileName} to your desktop downloads folder.`)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-500 text-xs font-bold text-slate-950 py-2 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Output File
                  </button>
                </div>
              )}

              {/* Action Button */}
              {!isExecuting && (
                <button
                  onClick={executeSandboxTool}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 py-3 text-xs font-bold text-slate-950 transition-colors shadow-sm"
                >
                  <Play className="h-3.5 w-3.5 fill-slate-950 stroke-slate-950" />
                  <span>Run Sandbox Test</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="h-12 w-12 bg-slate-950 rounded-full flex items-center justify-center border border-white/10 mx-auto text-slate-500">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-300">No Tool Selected</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
                  Choose any tool from the registry list to trigger its execution panel here.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
