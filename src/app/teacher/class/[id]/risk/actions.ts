"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function sendNudge(
  classId: string,
  studentId: string,
  message: string
): Promise<Result> {
  const text = message.trim();
  if (!text) return { ok: false, error: "Write a message first." };
  if (text.length > 500) return { ok: false, error: "Keep it under 500 characters." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You are not signed in." };

  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .maybeSingle();
  if (!cls) return { ok: false, error: "Class not found." };

  const { error } = await supabase.from("nudges").insert({
    class_id: classId,
    student_id: studentId,
    teacher_id: user.id,
    message: text,
  } as never);

  if (error) {
    console.error("sendNudge failed:", error);
    return {
      ok: false,
      error:
        process.env.NODE_ENV === "development"
          ? `Nudge failed: ${error.message}`
          : "Could not send the nudge. Please try again.",
    };
  }

  revalidatePath(`/teacher/class/${classId}/risk`);
  return { ok: true };
}