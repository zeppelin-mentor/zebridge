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

    // Fetch user count
    const { count: userCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Fetch execution count
    const { count: execCount } = await supabase
      .from("executions")
      .select("*", { count: "exact", head: true });

    // Fetch today's execution count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabase
      .from("executions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Fetch file count and storage
    const { count: fileCount, data: files } = await supabase
      .from("files")
      .select("size", { count: "exact" });

    const totalStorage = files?.reduce((sum, file) => sum + (file.size || 0), 0) || 0;

    // Fetch active API keys count
    const { count: apiKeyCount } = await supabase
      .from("api_keys")
      .select("*", { count: "exact", head: true })
      .is("revoked_at", null);

    // Fetch execution history for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: executionHistory } = await supabase
      .from("executions")
      .select("created_at, status")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    // Group executions by day
    const dailyStats: Record<string, number> = {};
    executionHistory?.forEach((exec) => {
      const date = new Date(exec.created_at).toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    // Fetch recent errors (last 10)
    const { data: recentErrors } = await supabase
      .from("executions")
      .select("id, tool_slug, error, created_at")
      .in("status", ["error", "failed"])
      .order("created_at", { ascending: false })
      .limit(10);

    // Get blog posts count
    const { count: blogCount } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      stats: {
        totalUsers: userCount || 0,
        totalExecutions: execCount || 0,
        totalFiles: fileCount || 0,
        activeApiKeys: apiKeyCount || 0,
        todayExecutions: todayCount || 0,
        totalStorage: totalStorage,
        totalBlogPosts: blogCount || 0,
      },
      executionHistory: dailyStats,
      recentErrors: recentErrors || [],
    });
  } catch (error) {
    console.error("Admin stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
