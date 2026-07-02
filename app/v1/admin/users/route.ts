import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all users with auth data using the database function
    const { data: usersData, error: usersError } = await supabase
      .rpc('get_all_users_with_emails');

    if (usersError) {
      throw usersError;
    }

    // Fetch API key counts
    const { data: apiKeys } = await supabase
      .from("api_keys")
      .select("user_id")
      .is("revoked_at", null);

    const apiKeyMap = (apiKeys || []).reduce((acc: Record<string, number>, key: any) => {
      acc[key.user_id] = (acc[key.user_id] || 0) + 1;
      return acc;
    }, {});

    // Combine data
    const users = (usersData || []).map((u: any) => ({
      id: u.id,
      email: u.email || "unknown@email.com",
      plan: u.plan,
      role: u.role,
      keysCount: apiKeyMap[u.id] || 0,
      joinedAt: new Date(u.created_at).toISOString().split("T")[0],
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json(
        { error: "Missing userId or updates" },
        { status: 400 }
      );
    }

    // Update user
    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
