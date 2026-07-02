"use client";

import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Trash2, Edit3, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  published_at?: string;
  excerpt: string;
  content: string;
  author_id: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Product");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const response = await fetch("/v1/admin/blog");
      if (!response.ok) throw new Error("Failed to fetch posts");
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
      setError("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }

  const handleSavePost = async (e: React.FormEvent, status: "draft" | "published") => {
    e.preventDefault();
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingPost) {
        // Update existing post
        const response = await fetch("/v1/admin/blog", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingPost.id,
            updates: {
              title,
              category,
              excerpt: excerpt || content.slice(0, 150) + "...",
              content,
              status,
            },
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update post");
        }

        const data = await response.json();
        setPosts(prev => prev.map(p => p.id === data.post.id ? data.post : p));
        setEditingPost(null);
      } else {
        // Create new post
        const response = await fetch("/v1/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            category,
            excerpt: excerpt || content.slice(0, 150) + "...",
            content,
            status,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create post");
        }

        const data = await response.json();
        setPosts(prev => [data.post, ...prev]);
      }

      // Reset form
      setTitle("");
      setExcerpt("");
      setContent("");
      setCategory("Product");
    } catch (error) {
      console.error("Save post error:", error);
      setError((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/v1/admin/blog?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Delete post error:", error);
      setError("Failed to delete post");
    }
  };

  const handleSelectEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setCategory(post.category);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategory("Product");
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* Left side: Compose Box */}
      <div className="lg:col-span-7 bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-violet-500/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {editingPost ? "Edit Blog Entry" : "Write New Announcement"}
          </h3>
          {editingPost && (
            <button 
              onClick={handleCancelEdit}
              className="text-xs text-slate-500 hover:text-white"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Article Title</label>
            <input
              type="text"
              placeholder="e.g. ZeBridge Release Announcement v1.2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              className="w-full bg-slate-950 border border-violet-500/10 focus:border-violet-400/40 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-700 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Category Tag</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={saving}
                className="w-full bg-slate-950 border border-violet-500/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none disabled:opacity-50"
              >
                <option value="Product">Product Release</option>
                <option value="Guides">Tutorials / Guides</option>
                <option value="Company">Company News</option>
                <option value="Engineering">Engineering Logs</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Slug Preview</label>
              <div className="bg-slate-950/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-slate-500 font-mono truncate">
                /blog/{title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "post-url"}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Short Summary Excerpt</label>
            <input
              type="text"
              placeholder="Provide a quick 1-sentence abstract..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={saving}
              className="w-full bg-slate-950 border border-violet-500/10 focus:border-violet-400/40 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-700 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Post Markdown Content</label>
            <textarea
              rows={8}
              placeholder="Write markdown content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={saving}
              className="w-full bg-slate-950 border border-violet-500/10 focus:border-violet-400/40 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-700 focus:outline-none font-mono leading-relaxed disabled:opacity-50"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={(e) => handleSavePost(e, "draft")}
              disabled={saving || !title || !content}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/15 bg-violet-950/20 hover:bg-violet-950/40 px-4 py-2.5 text-xs font-bold text-violet-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={(e) => handleSavePost(e, "published")}
              disabled={saving || !title || !content}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
              {saving ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>

      {/* Right side: Current Archives list */}
      <div className="lg:col-span-5 bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-violet-500/10">
          Published Articles ({posts.length})
        </h3>

        {posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-slate-950/40 rounded-xl p-4 border border-white/5 space-y-3 group hover:border-violet-500/20 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-violet-400 font-mono font-bold uppercase tracking-wider">{post.category}</span>
                    <h4 className="text-xs font-bold text-white mt-1 group-hover:text-violet-300 transition-colors">{post.title}</h4>
                  </div>
                  
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    post.status === "published" 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : post.status === "archived"
                      ? "bg-slate-800 text-slate-500"
                      : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {post.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{post.excerpt}</p>
                
                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleSelectEdit(post)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Edit Post"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No posts created yet. Write one on the left.
          </div>
        )}
      </div>

    </div>
  );
}
