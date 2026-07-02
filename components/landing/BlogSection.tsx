"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  published_at: string;
}

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  async function fetchLatestPosts() {
    try {
      const response = await fetch("/v1/blog?limit=2");
      if (!response.ok) throw new Error("Failed to fetch posts");
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || posts.length === 0) {
    return null; // Don't show section if no posts
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-[#090614] to-[#0D0A1A]">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <BookOpen className="h-4 w-4" />
            Latest Updates
          </div>
          <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            From Our Blog
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Stay updated with the latest features, tutorials, and announcements
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-[#120B27]/40 border border-violet-500/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all hover:transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="text-xs text-slate-600">•</span>
                <span className="text-xs text-slate-500">
                  {new Date(post.published_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors line-clamp-2">
                {post.title}
              </h3>
              
              <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold group-hover:gap-3 transition-all">
                Read More
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold transition-colors"
          >
            View All Posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
