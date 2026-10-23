"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // Fetch role from profiles table and redirect accordingly
  const {
    data: { user },
  } = await supabase.auth.getUser();

    let role: UserRole = "student";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single<{ role: UserRole }>();
    if (profile) role = profile.role;
  }

  revalidatePath("/", "layout");
  redirect(role === "teacher" ? "/teacher" : "/student");
}

// ─── Register ─────────────────────────────────────────────────────────────────
export async function register(formData: FormData) {
  const supabase = await createClient();

  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role     = (formData.get("role") as UserRole) ?? "student";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) return { error: error.message };

  return {
    success:
      "Account created! Check your email to confirm your address, then sign in.",
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
