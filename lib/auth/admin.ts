import { createClient } from "@/lib/supabase/server";

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !userData) return false;

  return userData.role === "admin";
}

/**
 * Get current admin user details
 */
export async function getAdminUser() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userData, error } = await supabase
    .from("users")
    .select("role, plan")
    .eq("id", user.id)
    .single();

  if (error || !userData || userData.role !== "admin") return null;

  return {
    id: user.id,
    email: user.email,
    role: userData.role,
    plan: userData.plan,
  };
}

/**
 * Require admin access (throws redirect if not admin)
 */
export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}
