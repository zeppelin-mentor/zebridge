"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  Mail,
  Presentation,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ToolItem {
  name: string;
  slug: string;
  category: "PDF" | "Images" | "Office" | "AI" | "Comms";
  desc: string;
  premium: boolean;
  enabled: boolean;
}


export default function ToolsTab() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  
  // Execution Console State
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [mockFileName, setMockFileName] = useState("sample_avatar.png");
  const [isFinished, setIsFinished] = useState(false);
  const [outputFileUrl, setOutputFileUrl] = useState<string | null>(null);
  
  // Dynamic input state
  const [toolInputs, setToolInputs] = useState<Record<string, any>>({});

  const baseTools = [
    // PDF
    { name: "Merge PDFs", slug: "pdf-merge", category: "PDF" as const, desc: "Combines multiple PDF documents into a single consolidated file.", premium: false },
    { name: "Split PDF", slug: "pdf-split", category: "PDF" as const, desc: "Splits pages from a PDF document into separate page extracts.", premium: false },
    { name: "PDF to DOCX", slug: "pdf-to-docx", category: "PDF" as const, desc: "Converts PDF documents to editable Microsoft Word format.", premium: false },
    { name: "Markdown to PDF", slug: "markdown-to-pdf", category: "PDF" as const, desc: "Converts Markdown formatted text into professional PDF documents.", premium: false },
    { name: "HTML to PDF", slug: "html-to-pdf", category: "PDF" as const, desc: "Converts HTML content into formatted PDF documents.", premium: false },
    // Images
    { name: "Background Removal", slug: "remove-background", category: "Images" as const, desc: "Removes background alpha mask from images using high-fidelity segmentation.", premium: true },
    { name: "Image Upscaling", slug: "image-upscale", category: "Images" as const, desc: "Doubles visual dimensions of inputs using super-resolution neural rendering.", premium: true },
    // Office Documents
    { name: "Text to DOCX", slug: "text-to-docx", category: "Office" as const, desc: "Converts plain text content into formatted Microsoft Word documents.", premium: false },
    { name: "JSON to Excel", slug: "json-to-excel", category: "Office" as const, desc: "Converts JSON data arrays into Excel spreadsheet format (CSV).", premium: false },
    { name: "Generate Receipt", slug: "generate-receipt", category: "Office" as const, desc: "Creates professional receipt PDFs with itemized billing details.", premium: false },
    { name: "DOCX to Markdown", slug: "docx-to-markdown", category: "Office" as const, desc: "Converts Word documents to Markdown format — ideal for AI agent pipelines.", premium: false },
    { name: "CSV to JSON", slug: "csv-to-json", category: "Office" as const, desc: "Parses CSV text into a structured JSON array with automatic header detection.", premium: false },
    { name: "Excel to JSON", slug: "excel-to-json", category: "Office" as const, desc: "Fetches a CSV/Excel file from a URL and converts it to a JSON array.", premium: false },
    { name: "DOCX Template Filler", slug: "docx-template-filler", category: "Office" as const, desc: "Merges dynamic variables into a DOCX template using {variable} placeholder syntax.", premium: false },
    { name: "Generate PPTX", slug: "generate-pptx", category: "Office" as const, desc: "Generates a full PowerPoint presentation with slides, bullets, and themes.", premium: true },
    // AI
    { name: "Invoice Generator", slug: "generate-invoice", category: "AI" as const, desc: "Creates professional invoices with automated calculations and formatting.", premium: true },
    { name: "OCR Extract Text", slug: "ocr-extract-text", category: "AI" as const, desc: "Extracts text content from images using optical character recognition.", premium: true },
    { name: "QR Code Generator", slug: "generate-qrcode", category: "AI" as const, desc: "Generates high-resolution QR codes from text or URL inputs.", premium: false },
    // Communication
    { name: "Send Email", slug: "send-email", category: "Comms" as const, desc: "Sends an email via SMTP with QStash reliable delivery and automatic retries.", premium: false },
    { name: "Send Webhook", slug: "send-webhook", category: "Comms" as const, desc: "Posts a notification to Slack, Discord, or any custom webhook URL.", premium: false },
    { name: "Email Template", slug: "generate-email-template", category: "Comms" as const, desc: "Generates a styled HTML email template from structured inputs.", premium: false },
  ];

  const toolsList: ToolItem[] = baseTools.map(t => ({
    ...t,
    enabled: enabledMap[t.slug] !== undefined ? enabledMap[t.slug] : true,
  }));


  const categories = ["All", "PDF", "Images", "Office", "AI", "Comms"];

  // Load tool preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await createClient().auth.getUser();
        if (!user) return;
        const res = await fetch('/v1/user/tool-preferences', { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        const map: Record<string, boolean> = {};
        (json.preferences || []).forEach((p: { tool_slug: string; enabled: boolean }) => {
          map[p.tool_slug] = p.enabled;
        });
        setEnabledMap(map);
      } catch { /* silently fail — default to all enabled */ }
    };
    loadPreferences();
  }, []);

  const toggleTool = useCallback(async (slug: string, currentEnabled: boolean) => {
    if (togglingSlug) return;
    const newEnabled = !currentEnabled;
    setTogglingSlug(slug);
    // Optimistic update
    setEnabledMap(prev => ({ ...prev, [slug]: newEnabled }));
    try {
      await fetch('/v1/user/tool-preferences', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug: slug, enabled: newEnabled }),
      });
    } catch {
      // Revert on failure
      setEnabledMap(prev => ({ ...prev, [slug]: currentEnabled }));
    } finally {
      setTogglingSlug(null);
    }
  }, [togglingSlug]);

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
    setOutputFileUrl(null);
    
    // Initialize default inputs for the tool
    setToolInputs(getDefaultInputsForTool(tool.slug));
    
    if (tool.category === "PDF") {
      setMockFileName("annual_report_draft.pdf");
    } else if (tool.category === "Images") {
      setMockFileName("profile_photo_raw.png");
    } else {
      setMockFileName("input_dataset.json");
    }
  };

  const getDefaultInputsForTool = (slug: string): Record<string, any> => {
    const defaults: Record<string, any> = {
      'pdf-merge': {
        pdfUrls: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      },
      'pdf-split': {
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        ranges: '[[1, 1]]'
      },
      'pdf-to-docx': {
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        outputFilename: 'converted-document.docx'
      },
      'markdown-to-pdf': {
        markdown: '# Test Document\n\nThis is a **sandbox test** of the markdown-to-pdf tool.\n\n- Item 1\n- Item 2',
        title: 'Sandbox Test'
      },
      'html-to-pdf': {
        html: '<html><body><h1>Sandbox Test</h1><p>This is a test HTML document.</p></body></html>',
        title: 'Sandbox Test'
      },
      'remove-background': {
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        outputFormat: 'png'
      },
      'image-upscale': {
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        scaleFactor: '2x'
      },
      'text-to-docx': {
        text: 'This is a sandbox test of the text-to-docx tool.\n\nIt converts plain text into formatted Word documents.',
        title: 'Sandbox Test'
      },
      'json-to-excel': {
        data: '[{"id": 1, "name": "Test Item", "value": 100}, {"id": 2, "name": "Another Item", "value": 200}]',
        sheetName: 'Sandbox Test'
      },
      'generate-receipt': {
        receiptNumber: 'SANDBOX-001',
        date: new Date().toISOString().split('T')[0],
        items: '[{"description": "Test Item", "quantity": 1, "price": 50}]',
        total: '50',
        fromName: 'ZeBridge',
        fromEmail: 'test@zebridge.com',
        toName: 'Sandbox User',
        toEmail: 'user@example.com'
      },
      'generate-invoice': {
        invoiceNumber: 'SANDBOX-001',
        date: new Date().toISOString().split('T')[0],
        fromName: 'ZeBridge',
        fromAddress: '123 Test St',
        fromEmail: 'test@zebridge.com',
        toName: 'Sandbox User',
        toAddress: '456 User Ave',
        toEmail: 'user@example.com',
        items: '[{"description": "Test Service", "quantity": 1, "unitPrice": 100, "total": 100}]',
        currency: 'USD'
      },
      'ocr-extract-text': {
        imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400',
        language: 'eng'
      },
      'generate-qrcode': {
        data: 'https://zebridge.vercel.app',
        size: '256'
      }
    };
    
    return defaults[slug] || {};
  };

  const executeSandboxTool = async () => {
    if (isExecuting || !selectedTool) return;
    setIsExecuting(true);
    setIsFinished(false);
    setProgress(0);
    setLogs([`[SANDBOX] Starting test execution for: ${selectedTool.slug}`]);

    try {
      // Get API key from database
      setLogs(prev => [...prev, "[AUTH] Fetching API key..."]);
      const { data: { user } } = await createClient().auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data: keys } = await createClient()
        .from('api_keys')
        .select('key')
        .eq('user_id', user.id)
        .is('revoked_at', null)
        .limit(1);

      if (!keys || keys.length === 0) {
        throw new Error("No API key found. Please create one first.");
      }

      const apiKey = keys[0].key;
      setLogs(prev => [...prev, "[AUTH] API key validated ✓"]);
      setProgress(20);

      // Prepare test data based on tool
      setLogs(prev => [...prev, `[PREPARE] Building test payload for ${selectedTool.slug}...`]);
      const testData = buildToolPayload(selectedTool.slug, toolInputs);
      setProgress(40);

      // Call the actual API endpoint
      setLogs(prev => [...prev, `[REQUEST] POST /v1/tools/${selectedTool.slug}`]);
      const startTime = Date.now();
      
      const response = await fetch(`/v1/tools/${selectedTool.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(testData)
      });

      const duration = Date.now() - startTime;
      setProgress(80);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setLogs(prev => [...prev, `[RESPONSE] Status: ${response.status} OK (${duration}ms)`]);
      setLogs(prev => [...prev, `[SUCCESS] Tool executed successfully!`]);
      
      if (result.fileUrl) {
        setLogs(prev => [...prev, `[OUTPUT] File available at: ${result.fileUrl}`]);
        setOutputFileUrl(result.fileUrl);
      }

      setProgress(100);
      setIsFinished(true);
      setIsExecuting(false);

    } catch (error) {
      setLogs(prev => [...prev, `[ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setProgress(0);
      setIsExecuting(false);
    }
  };

  const buildToolPayload = (slug: string, inputs: Record<string, any>): any => {
    try {
      switch (slug) {
        case 'pdf-merge':
          return {
            pdfUrls: inputs.pdfUrls.split('\n').filter((url: string) => url.trim())
          };
        case 'pdf-split':
          return {
            pdfUrl: inputs.pdfUrl,
            ranges: JSON.parse(inputs.ranges)
          };
        case 'pdf-to-docx':
          return {
            pdfUrl: inputs.pdfUrl,
            outputFilename: inputs.outputFilename
          };
        case 'markdown-to-pdf':
          return {
            markdown: inputs.markdown,
            title: inputs.title
          };
        case 'html-to-pdf':
          return {
            html: inputs.html,
            title: inputs.title
          };
        case 'remove-background':
          return {
            imageUrl: inputs.imageUrl,
            outputFormat: inputs.outputFormat
          };
        case 'image-upscale':
          return {
            imageUrl: inputs.imageUrl,
            scaleFactor: inputs.scaleFactor
          };
        case 'text-to-docx':
          return {
            text: inputs.text,
            title: inputs.title
          };
        case 'json-to-excel':
          return {
            data: JSON.parse(inputs.data),
            sheetName: inputs.sheetName
          };
        case 'generate-receipt':
          return {
            receiptNumber: inputs.receiptNumber,
            date: inputs.date,
            items: JSON.parse(inputs.items),
            total: parseFloat(inputs.total),
            from: { name: inputs.fromName, email: inputs.fromEmail },
            to: { name: inputs.toName, email: inputs.toEmail }
          };
        case 'generate-invoice':
          return {
            invoiceNumber: inputs.invoiceNumber,
            date: inputs.date,
            from: { name: inputs.fromName, address: inputs.fromAddress, email: inputs.fromEmail },
            to: { name: inputs.toName, address: inputs.toAddress, email: inputs.toEmail },
            items: JSON.parse(inputs.items),
            currency: inputs.currency
          };
        case 'ocr-extract-text':
          return {
            imageUrl: inputs.imageUrl,
            language: inputs.language
          };
        case 'generate-qrcode':
          return {
            data: inputs.data,
            size: parseInt(inputs.size)
          };
        default:
          return {};
      }
    } catch (error) {
      throw new Error(`Invalid input format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const renderInputFields = () => {
    if (!selectedTool) return null;

    const updateInput = (key: string, value: any) => {
      setToolInputs(prev => ({ ...prev, [key]: value }));
    };

    const inputClass = "w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-white/5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400/40";
    const labelClass = "text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5";

    switch (selectedTool.slug) {
      case 'pdf-merge':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>PDF URLs (one per line)</label>
              <textarea
                value={toolInputs.pdfUrls || ''}
                onChange={(e) => updateInput('pdfUrls', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="https://example.com/file1.pdf&#10;https://example.com/file2.pdf"
              />
            </div>
          </div>
        );

      case 'pdf-split':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>PDF URL</label>
              <input
                type="text"
                value={toolInputs.pdfUrl || ''}
                onChange={(e) => updateInput('pdfUrl', e.target.value)}
                className={inputClass}
                placeholder="https://example.com/document.pdf"
              />
            </div>
            <div>
              <label className={labelClass}>Ranges (JSON Array)</label>
              <input
                type="text"
                value={toolInputs.ranges || ''}
                onChange={(e) => updateInput('ranges', e.target.value)}
                className={inputClass}
                placeholder="[[1, 3], [5, 7]]"
              />
            </div>
          </div>
        );

      case 'pdf-to-docx':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>PDF URL</label>
              <input
                type="text"
                value={toolInputs.pdfUrl || ''}
                onChange={(e) => updateInput('pdfUrl', e.target.value)}
                className={inputClass}
                placeholder="https://example.com/document.pdf"
              />
            </div>
            <div>
              <label className={labelClass}>Output Filename (optional)</label>
              <input
                type="text"
                value={toolInputs.outputFilename || ''}
                onChange={(e) => updateInput('outputFilename', e.target.value)}
                className={inputClass}
                placeholder="converted-document.docx"
              />
            </div>
          </div>
        );

      case 'markdown-to-pdf':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={toolInputs.title || ''}
                onChange={(e) => updateInput('title', e.target.value)}
                className={inputClass}
                placeholder="Document Title"
              />
            </div>
            <div>
              <label className={labelClass}>Markdown Content</label>
              <textarea
                value={toolInputs.markdown || ''}
                onChange={(e) => updateInput('markdown', e.target.value)}
                className={inputClass}
                rows={4}
                placeholder="# Heading&#10;&#10;Your markdown content here..."
              />
            </div>
          </div>
        );

      case 'html-to-pdf':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={toolInputs.title || ''}
                onChange={(e) => updateInput('title', e.target.value)}
                className={inputClass}
                placeholder="Document Title"
              />
            </div>
            <div>
              <label className={labelClass}>HTML Content</label>
              <textarea
                value={toolInputs.html || ''}
                onChange={(e) => updateInput('html', e.target.value)}
                className={inputClass}
                rows={4}
                placeholder="<html><body>...</body></html>"
              />
            </div>
          </div>
        );

      case 'remove-background':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Image URL</label>
              <input
                type="text"
                value={toolInputs.imageUrl || ''}
                onChange={(e) => updateInput('imageUrl', e.target.value)}
                className={inputClass}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className={labelClass}>Output Format</label>
              <select
                value={toolInputs.outputFormat || 'png'}
                onChange={(e) => updateInput('outputFormat', e.target.value)}
                className={inputClass}
              >
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>
        );

      case 'image-upscale':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Image URL</label>
              <input
                type="text"
                value={toolInputs.imageUrl || ''}
                onChange={(e) => updateInput('imageUrl', e.target.value)}
                className={inputClass}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className={labelClass}>Scale Factor</label>
              <select
                value={toolInputs.scaleFactor || '2x'}
                onChange={(e) => updateInput('scaleFactor', e.target.value)}
                className={inputClass}
              >
                <option value="2x">2x</option>
                <option value="4x">4x</option>
              </select>
            </div>
          </div>
        );

      case 'text-to-docx':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={toolInputs.title || ''}
                onChange={(e) => updateInput('title', e.target.value)}
                className={inputClass}
                placeholder="Document Title"
              />
            </div>
            <div>
              <label className={labelClass}>Text Content</label>
              <textarea
                value={toolInputs.text || ''}
                onChange={(e) => updateInput('text', e.target.value)}
                className={inputClass}
                rows={4}
                placeholder="Your text content here..."
              />
            </div>
          </div>
        );

      case 'json-to-excel':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Sheet Name</label>
              <input
                type="text"
                value={toolInputs.sheetName || ''}
                onChange={(e) => updateInput('sheetName', e.target.value)}
                className={inputClass}
                placeholder="Sheet1"
              />
            </div>
            <div>
              <label className={labelClass}>JSON Data (Array)</label>
              <textarea
                value={toolInputs.data || ''}
                onChange={(e) => updateInput('data', e.target.value)}
                className={inputClass}
                rows={4}
                placeholder='[{"name": "Item", "value": 100}]'
              />
            </div>
          </div>
        );

      case 'generate-receipt':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Receipt #</label>
                <input
                  type="text"
                  value={toolInputs.receiptNumber || ''}
                  onChange={(e) => updateInput('receiptNumber', e.target.value)}
                  className={inputClass}
                  placeholder="RCP-001"
                />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={toolInputs.date || ''}
                  onChange={(e) => updateInput('date', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>From Name</label>
                <input
                  type="text"
                  value={toolInputs.fromName || ''}
                  onChange={(e) => updateInput('fromName', e.target.value)}
                  className={inputClass}
                  placeholder="Your Company"
                />
              </div>
              <div>
                <label className={labelClass}>From Email</label>
                <input
                  type="email"
                  value={toolInputs.fromEmail || ''}
                  onChange={(e) => updateInput('fromEmail', e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>To Name</label>
                <input
                  type="text"
                  value={toolInputs.toName || ''}
                  onChange={(e) => updateInput('toName', e.target.value)}
                  className={inputClass}
                  placeholder="Customer Name"
                />
              </div>
              <div>
                <label className={labelClass}>To Email</label>
                <input
                  type="email"
                  value={toolInputs.toEmail || ''}
                  onChange={(e) => updateInput('toEmail', e.target.value)}
                  className={inputClass}
                  placeholder="customer@example.com"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Items (JSON Array)</label>
              <textarea
                value={toolInputs.items || ''}
                onChange={(e) => updateInput('items', e.target.value)}
                className={inputClass}
                rows={2}
                placeholder='[{"description": "Item", "quantity": 1, "price": 50}]'
              />
            </div>
            <div>
              <label className={labelClass}>Total Amount</label>
              <input
                type="number"
                value={toolInputs.total || ''}
                onChange={(e) => updateInput('total', e.target.value)}
                className={inputClass}
                placeholder="50.00"
                step="0.01"
              />
            </div>
          </div>
        );

      case 'generate-invoice':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Invoice #</label>
                <input
                  type="text"
                  value={toolInputs.invoiceNumber || ''}
                  onChange={(e) => updateInput('invoiceNumber', e.target.value)}
                  className={inputClass}
                  placeholder="INV-001"
                />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={toolInputs.date || ''}
                  onChange={(e) => updateInput('date', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>From Name</label>
                <input
                  type="text"
                  value={toolInputs.fromName || ''}
                  onChange={(e) => updateInput('fromName', e.target.value)}
                  className={inputClass}
                  placeholder="Your Company"
                />
              </div>
              <div>
                <label className={labelClass}>From Email</label>
                <input
                  type="email"
                  value={toolInputs.fromEmail || ''}
                  onChange={(e) => updateInput('fromEmail', e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>From Address</label>
              <input
                type="text"
                value={toolInputs.fromAddress || ''}
                onChange={(e) => updateInput('fromAddress', e.target.value)}
                className={inputClass}
                placeholder="123 Business St"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>To Name</label>
                <input
                  type="text"
                  value={toolInputs.toName || ''}
                  onChange={(e) => updateInput('toName', e.target.value)}
                  className={inputClass}
                  placeholder="Client Name"
                />
              </div>
              <div>
                <label className={labelClass}>To Email</label>
                <input
                  type="email"
                  value={toolInputs.toEmail || ''}
                  onChange={(e) => updateInput('toEmail', e.target.value)}
                  className={inputClass}
                  placeholder="client@example.com"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>To Address</label>
              <input
                type="text"
                value={toolInputs.toAddress || ''}
                onChange={(e) => updateInput('toAddress', e.target.value)}
                className={inputClass}
                placeholder="456 Client Ave"
              />
            </div>
            <div>
              <label className={labelClass}>Items (JSON Array)</label>
              <textarea
                value={toolInputs.items || ''}
                onChange={(e) => updateInput('items', e.target.value)}
                className={inputClass}
                rows={2}
                placeholder='[{"description": "Service", "quantity": 1, "unitPrice": 100, "total": 100}]'
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <input
                type="text"
                value={toolInputs.currency || ''}
                onChange={(e) => updateInput('currency', e.target.value)}
                className={inputClass}
                placeholder="USD"
              />
            </div>
          </div>
        );

      case 'ocr-extract-text':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Image URL</label>
              <input
                type="text"
                value={toolInputs.imageUrl || ''}
                onChange={(e) => updateInput('imageUrl', e.target.value)}
                className={inputClass}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className={labelClass}>Language Code</label>
              <input
                type="text"
                value={toolInputs.language || ''}
                onChange={(e) => updateInput('language', e.target.value)}
                className={inputClass}
                placeholder="eng"
              />
            </div>
          </div>
        );

      case 'generate-qrcode':
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Data / URL</label>
              <input
                type="text"
                value={toolInputs.data || ''}
                onChange={(e) => updateInput('data', e.target.value)}
                className={inputClass}
                placeholder="https://zebridge.vercel.app"
              />
            </div>
            <div>
              <label className={labelClass}>Size (px)</label>
              <input
                type="number"
                value={toolInputs.size || ''}
                onChange={(e) => updateInput('size', e.target.value)}
                className={inputClass}
                placeholder="256"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
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
            <div
              key={tool.slug}
              className={`text-left rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between h-44 overflow-hidden ${
                !tool.enabled
                  ? "bg-slate-950/50 border-white/5 opacity-60"
                  : selectedTool?.slug === tool.slug
                  ? "bg-slate-900 border-emerald-400/40 shadow-[0_0_20px_rgba(74,222,128,0.05)]"
                  : "bg-slate-900/30 border-white/5 hover:border-white/10 hover:bg-slate-900/40"
              }`}
            >
              {/* Toggle switch — top-right */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleTool(tool.slug, tool.enabled); }}
                disabled={togglingSlug === tool.slug}
                title={tool.enabled ? 'Disable tool' : 'Enable tool'}
                className="absolute top-3 right-3 z-10 flex items-center gap-1 transition-opacity"
              >
                {tool.enabled
                  ? <ToggleRight className="h-5 w-5 text-emerald-400" />
                  : <ToggleLeft className="h-5 w-5 text-slate-600" />}
              </button>

              {/* Card content — clickable only when enabled */}
              <button
                onClick={() => tool.enabled && selectToolForExecution(tool)}
                disabled={!tool.enabled}
                className="flex flex-col justify-between h-full w-full p-5 text-left"
              >
                {tool.premium && tool.enabled && (
                  <span className="absolute top-4 right-12 bg-sky-500/10 text-sky-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                )}
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">{tool.category}</span>
                  <h4 className={`text-sm font-bold mt-1 transition-colors ${
                    tool.enabled ? 'text-white group-hover:text-emerald-300' : 'text-slate-500'
                  }`}>{tool.name}</h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{tool.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">/{tool.slug}</span>
                  {tool.enabled ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      Sandbox <Play className="h-2.5 w-2.5 fill-emerald-400" />
                    </span>
                  ) : (
                    <span className="text-slate-600">Disabled</span>
                  )}
                </div>
              </button>
            </div>
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

              {/* Input Fields */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-white/5 space-y-3 max-h-96 overflow-y-auto">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Tool Parameters</span>
                {renderInputFields()}
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
                    onClick={() => {
                      if (outputFileUrl) {
                        window.open(outputFileUrl, '_blank');
                      } else {
                        alert('No output file URL available');
                      }
                    }}
                    disabled={!outputFileUrl}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-500 text-xs font-bold text-slate-950 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {outputFileUrl ? 'Download Output File' : 'No Output Available'}
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
