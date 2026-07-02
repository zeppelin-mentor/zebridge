"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import { useParams } from "next/navigation";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt: string;
  published_at: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  async function fetchPost() {
    try {
      const response = await fetch(`/v1/blog/${slug}`);
      if (response.status === 404) {
        setNotFound(true);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch post");
      
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error("Failed to fetch blog post:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090614] text-white flex items-center justify-center">
        <div className="text-slate-400">Loading post...</div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#090614] text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-slate-400 mb-6">The blog post you're looking for doesn't exist.</p>
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090614] text-white">
      {/* Header */}
      <Header />

      {/* Article */}
      <article className="py-12 px-6">
        <div className="container mx-auto max-w-3xl">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-6 text-sm">
            <span className="inline-flex items-center gap-1.5 bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full font-semibold">
              <Tag className="h-3.5 w-3.5" />
              {post.category}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.published_at).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-slate-400 mb-12 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Content */}
          <div className="prose prose-invert prose-violet max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-white" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 text-white" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3 text-white" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 text-slate-300 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="mb-4 ml-6 list-disc text-slate-300 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="mb-4 ml-6 list-decimal text-slate-300 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="text-slate-300" {...props} />,
                a: ({node, ...props}) => <a className="text-violet-400 hover:text-violet-300 underline" {...props} />,
                code: ({node, inline, ...props}: any) => 
                  inline 
                    ? <code className="bg-slate-800 text-violet-300 px-1.5 py-0.5 rounded text-sm" {...props} />
                    : <code className="block bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm" {...props} />,
                pre: ({node, ...props}) => <pre className="bg-slate-900 rounded-lg overflow-hidden mb-4" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-violet-500 pl-4 italic text-slate-400 my-4" {...props} />,
                hr: ({node, ...props}) => <hr className="border-slate-700 my-8" {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Back to Blog */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Posts
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
