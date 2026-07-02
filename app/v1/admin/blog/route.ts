import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Helper to check admin access
async function checkAdminAccess(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "admin") {
    return { error: "Forbidden: Admin access required", status: 403 };
  }

  return { user };
}

// GET - Fetch all blog posts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const access = await checkAdminAccess(supabase);
    
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: posts, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error("Admin blog GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const access = await checkAdminAccess(supabase);
    
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const body = await request.json();
    const { title, category, excerpt, content, status } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, category" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", slug)
      .single();

    if (existingPost) {
      return NextResponse.json(
        { error: "A post with this title already exists" },
        { status: 409 }
      );
    }

    const postData: any = {
      title,
      slug,
      category,
      content,
      status: status || "draft",
      excerpt: excerpt || content.slice(0, 150) + "...",
      author_id: access.user.id,
    };

    // Set published_at if publishing
    if (postData.status === "published") {
      postData.published_at = new Date().toISOString();
    }

    const { data: newPost, error } = await supabase
      .from("blog_posts")
      .insert(postData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Admin blog POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update existing blog post
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const access = await checkAdminAccess(supabase);
    
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: "Missing id or updates" },
        { status: 400 }
      );
    }

    // If updating title, regenerate slug
    if (updates.title) {
      updates.slug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if new slug conflicts with other posts
      const { data: existingPost } = await supabase
        .from("blog_posts")
        .select("id, slug")
        .eq("slug", updates.slug)
        .neq("id", id)
        .single();

      if (existingPost) {
        return NextResponse.json(
          { error: "A post with this title already exists" },
          { status: 409 }
        );
      }
    }

    // Update excerpt if content changed
    if (updates.content && !updates.excerpt) {
      updates.excerpt = updates.content.slice(0, 150) + "...";
    }

    // Set published_at when status changes to published
    if (updates.status === "published") {
      const { data: currentPost } = await supabase
        .from("blog_posts")
        .select("published_at")
        .eq("id", id)
        .single();

      if (currentPost && !currentPost.published_at) {
        updates.published_at = new Date().toISOString();
      }
    }

    const { data: updatedPost, error } = await supabase
      .from("blog_posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error("Admin blog PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const access = await checkAdminAccess(supabase);
    
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing post id" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin blog DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
