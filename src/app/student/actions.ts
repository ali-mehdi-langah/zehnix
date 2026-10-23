"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { applyMastery, gradePendingAnswers } from "@/lib/grading";

export async function joinClass(
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const clean = (code ?? "").trim().toUpperCase();
  if (clean.length !== 6) {
    return { ok: false, error: "Join codes have 6 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You are signed out. Log in again." };

  const { error } = await supabase.rpc("join_class", { code: clean });
  if (error) {
    return {
      ok: false,
      error: error.message.includes("Invalid")
        ? "That code doesn't match any class. Check it and try again."
        : "Could not join the class. Try again.",
    };
  }

  revalidatePath("/student");
  return { ok: true };
}

type DbQuestion = {
  id: string;
  topic: string;
  type: "mcq" | "short";
  correct_answer: string | null;
};

async function studentLanguage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data } = await supabase.from("profiles").select("language").eq("id", userId).maybeSingle();
  return (data?.language as string) ?? "en";
}

export async function submitAttempt(
  quizId: string,
  answers: Record<string, string>
): Promise<{ ok: true; attemptId: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You are signed out. Log in again." };

  const { data: quiz } = await supabase.from("quizzes").select("id").eq("id", quizId).maybeSingle();
  if (!quiz) return { ok: false, error: "This quiz is not available." };

  const { data: qs, error: qErr } = await supabase
    .from("questions")
    .select("id, topic, type, correct_answer")
    .eq("quiz_id", quizId);
  if (qErr || !qs || qs.length === 0) {
    return { ok: false, error: "This quiz has no questions." };
  }
  const questions = qs as DbQuestion[];

  // ---- MCQs are graded immediately; short answers wait for the AI ----
  const rows = questions.map((q) => {
    const response = String(answers?.[q.id] ?? "").slice(0, 2000);
    const empty = response.trim() === "";

    if (q.type === "mcq") {
      const correct = !empty && response.trim() === (q.correct_answer ?? "").trim();
      return {
        question_id: q.id,
        response,
        score: correct ? 1 : 0,
        pending_review: false,
        topic: q.topic,
      };
    }
    return {
      question_id: q.id,
      response,
      score: empty ? 0 : (null as number | null),
      pending_review: !empty,
      topic: q.topic,
    };
  });

  const hasPending = rows.some((r) => r.score === null);
  const attemptScore = hasPending
    ? null
    : rows.reduce((sum, r) => sum + (r.score ?? 0), 0) / rows.length;

  const { data: attempt, error: aErr } = await supabase
    .from("attempts")
    .insert({ quiz_id: quizId, student_id: user.id, score: attemptScore })
    .select("id")
    .single();
  if (aErr || !attempt) {
    return { ok: false, error: "Could not save your attempt. Try again." };
  }

  const { error: ansErr } = await supabase.from("answers").insert(
    rows.map((r) => ({
      attempt_id: attempt.id,
      question_id: r.question_id,
      response: r.response,
      score: r.score,
      pending_review: r.pending_review,
    }))
  );
  if (ansErr) {
    return { ok: false, error: "Could not save your answers. Try again." };
  }

  // mastery from the already-graded answers
  await applyMastery(
    supabase,
    user.id,
    rows.filter((r) => r.score !== null).map((r) => ({ topic: r.topic, score: r.score as number }))
  );

  // AI grading for short answers; if it fails they stay "awaiting grading"
  if (hasPending) {
    try {
      await gradePendingAnswers(supabase, attempt.id as string, user.id, await studentLanguage(supabase, user.id));
    } catch (err) {
      console.error("[submitAttempt] grading error:", err);
    }
  }

  revalidatePath("/student", "layout");
  return { ok: true, attemptId: attempt.id as string };
}

/** Lets a student grade an attempt that is still "awaiting grading". */
export async function gradeMyAttempt(
  attemptId: string
): Promise<{ ok: true; graded: number; failed: number } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You are signed out. Log in again." };

  const { data: attempt } = await supabase
    .from("attempts")
    .select("id")
    .eq("id", attemptId)
    .eq("student_id", user.id)
    .maybeSingle();
  if (!attempt) return { ok: false, error: "Attempt not found." };

  try {
    const res = await gradePendingAnswers(supabase, attemptId, user.id, await studentLanguage(supabase, user.id));
    revalidatePath("/student", "layout");
    return { ok: true, ...res };
  } catch (err) {
    console.error("[gradeMyAttempt]", err);
    return { ok: false, error: "Grading failed. Try again in a moment." };
  }
}