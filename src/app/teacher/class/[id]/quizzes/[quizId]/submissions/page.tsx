import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmtDate, pct } from "@/lib/format";
import GradeNowButton from "@/components/common/GradeNowButton";
import OverrideForm from "@/components/teacher/OverrideForm";

type Rel<T> = T | T[] | null;
const one = <T,>(v: Rel<T>): T | null => (Array.isArray(v) ? v[0] ?? null : v);

type AttemptRow = {
  id: string;
  score: number | null;
  created_at: string;
  student_id: string;
  profiles: Rel<{ full_name: string | null }>;
};
type AnswerRow = {
  id: string;
  attempt_id: string;
  response: string | null;
  score: number | null;
  feedback: string | null;
  missing_points: string[] | null;
  teacher_override: boolean;
  questions: Rel<{
    prompt: string;
    type: "mcq" | "short";
    model_answer: string | null;
    correct_answer: string | null;
  }>;
};

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id, quizId } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("id", quizId)
    .eq("class_id", id)
    .maybeSingle();
  if (!quiz) notFound();

  const { data: att } = await supabase
    .from("attempts")
    .select("id, score, created_at, student_id, profiles(full_name)")
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: false });
  const attempts = (att ?? []) as unknown as AttemptRow[];

  const answersByAttempt: Record<string, AnswerRow[]> = {};
  if (attempts.length > 0) {
    const { data: ans } = await supabase
      .from("answers")
      .select(
        "id, attempt_id, response, score, feedback, missing_points, teacher_override, questions(prompt, type, model_answer, correct_answer)"
      )
      .in("attempt_id", attempts.map((a) => a.id))
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });
    ((ans ?? []) as unknown as AnswerRow[]).forEach((a) => {
      (answersByAttempt[a.attempt_id] ??= []).push(a);
    });
  }

  const graded = attempts.filter((a) => a.score !== null);
  const avg = graded.length
    ? Math.round((graded.reduce((s, a) => s + Number(a.score), 0) / graded.length) * 100)
    : null;
  const ungraded = attempts.length - graded.length;

  return (
    <div>
      <Link
        href={`/teacher/class/${id}/quizzes/${quizId}`}
        className="text-sm font-medium text-[#15254B]/50 hover:text-[#15254B] transition-colors"
      >
        ← Back to quiz
      </Link>

      <h2 className="mt-3 text-xl font-extrabold text-[#15254B]">{quiz.title}: submissions</h2>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Submissions", value: attempts.length.toString() },
          { label: "Average score", value: avg === null ? "—" : `${avg}%` },
          { label: "Awaiting grading", value: ungraded.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4">
            <p className="text-2xl font-extrabold text-[#15254B]">{s.value}</p>
            <p className="text-[11px] text-[#15254B]/50 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {attempts.length === 0 ? (
        <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
          <p className="text-base font-semibold text-[#15254B]">No submissions yet</p>
          <p className="mt-1 text-sm text-[#15254B]/50">Results appear here once students take this quiz.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {attempts.map((a) => {
            const name = one(a.profiles)?.full_name || "Unnamed student";
            const list = answersByAttempt[a.id] ?? [];
            const hasPending = list.some((x) => x.score === null);
            const p = pct(a.score);

            return (
              <details key={a.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-[#15254B]">{name}</p>
                    <p className="text-xs text-[#15254B]/50">{fmtDate(a.created_at)}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      p === null ? "bg-amber-50 text-amber-700" : "bg-[#5D91F5]/10 text-[#5D91F5]"
                    }`}
                  >
                    {p === null ? "Awaiting grading" : `${p}%`}
                  </span>
                </summary>

                <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                  {hasPending && <GradeNowButton attemptId={a.id} mode="teacher" />}

                  {list.map((x, i) => {
                    const q = one(x.questions);
                    if (!q) return null;
                    const isMcq = q.type === "mcq";
                    return (
                      <div key={x.id} className="text-sm">
                        <p dir="auto" className="font-semibold text-[#15254B]">
                          {i + 1}. {q.prompt}
                        </p>
                        <p dir="auto" className="mt-1.5 text-[#15254B]/70">
                          <span className="font-medium text-[#15254B]">Answer: </span>
                          {x.response?.trim() ? x.response : "No answer"}
                        </p>

                        {isMcq ? (
                          <p className={`mt-1 text-xs font-semibold ${Number(x.score) === 1 ? "text-emerald-700" : "text-red-600"}`}>
                            {Number(x.score) === 1 ? "Correct" : `Incorrect (correct: ${q.correct_answer})`}
                          </p>
                        ) : (
                          <>
                            <p className="mt-1 text-xs text-[#15254B]/50">
                              {x.score === null ? "Not graded yet" : `Score: ${pct(x.score)}%`}
                              {x.teacher_override ? " · adjusted by you" : x.score !== null ? " · graded by AI" : ""}
                            </p>
                            {x.feedback && (
                              <p dir="auto" className="mt-1 text-xs text-[#15254B]/70">
                                {x.feedback}
                              </p>
                            )}
                            <OverrideForm answerId={x.id} initialScore={x.score} initialFeedback={x.feedback} />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}