"use client";

import React, { useState, useEffect } from "react";
import { FileText, Download, Trash2, Search, RefreshCw, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FileItem {
  id: string;
  filename: string;
  storage_path: string;
  storage_bucket: string;
  mime_type: string;
  size: number;
  created_at: string;
  execution_id: string;
}

export default function FilesTab() {
  const supabase = createClient();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchFiles();
  }, [filterType]);

  async function fetchFiles() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get executions for this user to find their files
      const { data: executionData } = await supabase
        .from('executions')
        .select('id')
        .eq('user_id', user.id);

      if (!executionData || executionData.length === 0) {
        setFiles([]);
        return;
      }

      const executionIds = executionData.map(e => e.id);

      let query = supabase
        .from('files')
        .select('*')
        .in('execution_id', executionIds)
        .eq('type', 'output')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data, error } = await query;

      if (error) throw error;
      
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(file: FileItem) {
    try {
      const { data, error } = await supabase.storage
        .from(file.storage_bucket)
        .download(file.storage_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  }

  async function handleDelete(fileId: string) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      // Refresh list
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getFileIcon(mimeType: string) {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('docx')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('csv') || mimeType.includes('excel')) return '📊';
    return '📁';
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || file.mime_type.includes(filterType);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-400 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Files</h2>
          <p className="text-sm text-slate-400 mt-1">
            All your generated files from tool executions
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-950/80 border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'all'
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            All Files
          </button>
          <button
            onClick={() => setFilterType('pdf')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'pdf'
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            PDFs
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'image'
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setFilterType('word')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'word'
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Documents
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-600" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400/40"
            />
          </div>
          
          <button
            onClick={fetchFiles}
            className="p-2 rounded-lg border border-white/5 bg-slate-900 text-slate-400 hover:text-white hover:border-emerald-400/40 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Total Files</p>
          <p className="text-lg font-bold text-white">{files.length}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Total Size</p>
          <p className="text-lg font-bold text-white">
            {formatBytes(files.reduce((sum, f) => sum + f.size, 0))}
          </p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">This Month</p>
          <p className="text-lg font-bold text-white">
            {files.filter(f => {
              const fileDate = new Date(f.created_at);
              const now = new Date();
              return fileDate.getMonth() === now.getMonth() && 
                     fileDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-slate-900/30 border border-white/5 rounded-xl p-4 hover:border-emerald-400/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{getFileIcon(file.mime_type)}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white mb-1 truncate" title={file.filename}>
                {file.filename}
              </h3>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{formatBytes(file.size)}</span>
                <span>{formatDateTime(file.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-12 text-center">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-1">
            {searchQuery ? 'No files match your search' : 'No files yet'}
          </p>
          <p className="text-slate-500 text-xs">
            {searchQuery ? 'Try a different search term' : 'Generated files from your tool executions will appear here'}
          </p>
        </div>
      )}
    </div>
  );
}
