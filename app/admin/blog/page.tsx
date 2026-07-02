"use client";

import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Trash2, Edit3, Send, CheckCircle2 } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "draft" | "published";
  createdAt: string;
  excerpt: string;
  content: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Product");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem("zebridge_blog_posts");
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      const defaultPosts: BlogPost[] = [
        { 
          id: "p-1", 
          title: "Announcing ZeBridge 1.0 Release", 
          slug: "announcing-zebridge-v1", 
          category: "Product", 
          status: "published", 
          createdAt: "2026-06-15", 
          excerpt: "Secure Model Context Protocol connection client interfaces are now live globally.", 
          content: "We are thrilled to launch ZeBridge 1.0, connecting AI assistants to real-world operational tools."
        },
        { 
          id: "p-2", 
          title: "How to configure Claude Code with custom MCP URL", 
          slug: "configure-claude-mcp-url", 
          category: "Guides", 
          status: "published", 
          createdAt: "2026-06-25", 
          excerpt: "Step-by-step setup guides to resolve secure SSE tokens inside Claude CLI settings.", 
          content: "Connecting Claude Code is simple. Just export the token header and specify our SSE URL endpoint."
        }
      ];
      setPosts(defaultPosts);
      localStorage.setItem("zebridge_blog_posts", JSON.stringify(defaultPosts));
    }
  }, []);

  const savePostsList = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    localStorage.setItem("zebridge_blog_posts", JSON.stringify(newPosts));
  };

  const handleSavePost = (e: React.FormEvent, status: "draft" | "published") => {
    e.preventDefault();
    if (!title || !content) return;

    const postSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (editingPost) {
      // Modify
      const updated = posts.map(p => {
        if (p.id === editingPost.id) {
          return {
            ...p,
            title,
            slug: postSlug,
            category,
            excerpt: excerpt || content.slice(0, 100) + "...",
            content,
            status
          };
        }
        return p;
      });
      savePostsList(updated);
      setEditingPost(null);
    } else {
      // Create
      const newPost: BlogPost = {
        id: Math.random().toString(),
        title,
        slug: postSlug,
        category,
        status,
        createdAt: new Date().toISOString().split("T")[0],
        excerpt: excerpt || content.slice(0, 100) + "...",
        content
      };
      savePostsList([newPost, ...posts]);
    }

    // Reset inputs
    setTitle("");
    setExcerpt("");
    setContent("");
  };

  const handleDeletePost = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post? It will immediately disappear from the platform archives.")) {
      const updated = posts.filter(p => p.id !== id);
      savePostsList(updated);
    }
  };

  const handleSelectEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setCategory(post.category);
    setExcerpt(post.excerpt);
    setContent(post.content);
  };

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
              onClick={() => {
                setEditingPost(null);
                setTitle("");
                setExcerpt("");
                setContent("");
              }}
              className="text-xs text-slate-500 hover:text-white"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Article Title</label>
            <input
              type="text"
              placeholder="e.g. ZeBridge Release Announcement v1.2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-violet-500/10 focus:border-violet-400/40 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-700 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Category Tag</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-violet-500/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none"
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
              className="w-full bg-slate-950 border border-violet-500/10 focus:border-violet-400/40 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-700 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Post markdown Content</label>
            <textarea
              rows={8}
              placeholder="Write raw markdown code details here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-violet-500/10 focus:border-violet-400/40 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-700 focus:outline-none font-mono leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={(e) => handleSavePost(e, "draft")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/15 bg-violet-950/20 hover:bg-violet-950/40 px-4 py-2.5 text-xs font-bold text-violet-300 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={(e) => handleSavePost(e, "published")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              Publish Post
            </button>
          </div>
        </form>
      </div>

      {/* Right side: Current Archives list */}
      <div className="lg:col-span-5 bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-violet-500/10">
          Published Articles
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
                  
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                    post.status === "published" 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {post.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{post.excerpt}</p>
                
                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{post.createdAt}</span>
                  
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
            No posts compiled. Comprise one on the left.
          </div>
        )}
      </div>

    </div>
  );
}
