import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * /dashboard is a legacy entry point — redirect authenticated users
 * to the correct role-specific dashboard.
 */
export default async function DashboardRedirectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(profile?.role === "teacher" ? "/teacher" : "/student");
}
