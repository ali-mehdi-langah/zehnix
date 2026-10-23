import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { pct } from "@/lib/format";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GradeNowButton from "@/components/common/GradeNowButton";

type Rel<T> = T | T[] | null;
const one = <T,>(v: Rel<T>): T | null => (Array.isArray(v) ? v[0] ?? null : v);

type QInfo = {
  prompt: string;
  type: "mcq" | "short";
  topic: string;
  correct_answer: string | null;
  model_answer: string | null;
};
type AnswerRow = {
  id: string;
  response: string | null;
  score: number | null;
  feedback: string | null;
  missing_points: string[] | null;
  pending_review: boolean;
  questions: Rel<QInfo>;
};

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const { supabase, user } = await requireStudent();

  // 1. The attempt (only attempts columns here)
  const { data: attempt, error: attemptErr } = await supabase
    .from("attempts")
    .select("id, quiz_id, score")
    .eq("id", attemptId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (attemptErr) console.error("[results] attempt query failed:", attemptErr);
  if (!attempt) notFound();

  // 2. The quiz title and class
  const { data: quizRow } = await supabase
    .from("quizzes")
    .select("title, class_id")
    .eq("id", attempt.quiz_id)
    .maybeSingle();
  const quiz = quizRow as { title: string; class_id: string } | null;

  // 3. The answers, with their questions
  const { data: ans, error: ansErr } = await supabase
    .from("answers")
    .select(
      "id, response, score, feedback, missing_points, pending_review, questions(prompt, type, topic, correct_answer, model_answer)"
    )
    .eq("attempt_id", attemptId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (ansErr) console.error("[results] answers query failed:", ansErr);

  const answers = (ans ?? []) as unknown as AnswerRow[];

  const mcq = answers.filter((a) => one(a.questions)?.type === "mcq");
  const mcqCorrect = mcq.filter((a) => Number(a.score) === 1).length;
  const overall = pct(attempt.score as number | null);
  const hasUngraded = answers.some((a) => a.score === null);

  // weak topics: graded answers with accuracy below 60%
  const topicStats: Record<string, { sum: number; n: number }> = {};
  answers.forEach((a) => {
    const q = one(a.questions);
    if (!q || a.score === null) return;
    topicStats[q.topic] ??= { sum: 0, n: 0 };
    topicStats[q.topic].sum += Number(a.score);
    topicStats[q.topic].n += 1;
  });
  const weakTopics = Object.entries(topicStats)
    .filter(([, s]) => s.sum / s.n < 0.6)
    .map(([t]) => t);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader role="student" email={user.email ?? ""} />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link
          href={quiz ? `/student/class/${quiz.class_id}` : "/student"}
          className="text-sm font-medium text-[#15254B]/50 hover:text-[#15254B] transition-colors"
        >
          ← Back to class
        </Link>

        <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
          <p className="text-sm text-[#15254B]/50">{quiz?.title ?? "Quiz"}</p>
          {overall !== null ? (
            <p className="mt-2 text-5xl font-extrabold text-[#15254B]">{overall}%</p>
          ) : (
            <>
              <p className="mt-2 text-3xl font-extrabold text-[#15254B]">
                {mcqCorrect} / {mcq.length}
              </p>
              <p className="mt-1 text-sm text-[#15254B]/60">multiple-choice correct</p>
              <p className="mt-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Short answers are awaiting grading
              </p>
            </>
          )}

          {weakTopics.length > 0 && (
            <p className="mt-4 text-sm text-[#15254B]/70">
              Topics to practise: <span className="font-semibold text-[#15254B]">{weakTopics.join(", ")}</span>
            </p>
          )}
        </div>

        {hasUngraded && (
          <div className="mt-4">
            <GradeNowButton attemptId={attemptId} mode="student" />
          </div>
        )}

        <h2 className="mt-8 text-lg font-bold text-[#15254B]">Review your answers</h2>
        <div className="mt-4 space-y-3">
          {answers.map((a, i) => {
            const q = one(a.questions);
            if (!q) return null;
            const isMcq = q.type === "mcq";
            const correct = Number(a.score) === 1;
            const pendingGrade = a.score === null;

            let badge = { text: "", cls: "" };
            if (pendingGrade) badge = { text: "Awaiting grading", cls: "bg-amber-50 text-amber-700" };
            else if (isMcq && correct) badge = { text: "Correct", cls: "bg-emerald-50 text-emerald-700" };
            else if (isMcq) badge = { text: "Incorrect", cls: "bg-red-50 text-red-600" };
            else badge = { text: `${pct(a.score)}%`, cls: "bg-[#5D91F5]/10 text-[#5D91F5]" };

            return (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <p dir="auto" className="text-sm font-semibold text-[#15254B]">
                    {i + 1}. {q.prompt}
                  </p>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
                    {badge.text}
                  </span>
                </div>

                <p dir="auto" className="mt-3 text-sm text-[#15254B]/70">
                  <span className="font-medium text-[#15254B]">Your answer: </span>
                  {a.response?.trim() ? a.response : "No answer"}
                </p>

                {isMcq && !correct && q.correct_answer && (
                  <p dir="auto" className="mt-1.5 text-sm text-emerald-700">
                    <span className="font-medium">Correct answer: </span>
                    {q.correct_answer}
                  </p>
                )}

                {!isMcq && !pendingGrade && q.model_answer && (
                  <p dir="auto" className="mt-1.5 text-sm text-[#15254B]/70">
                    <span className="font-medium text-[#15254B]">Sample answer: </span>
                    {q.model_answer}
                  </p>
                )}

                {a.feedback && (
                  <p dir="auto" className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-[#15254B]/80">
                    {a.feedback}
                  </p>
                )}

                {Array.isArray(a.missing_points) && a.missing_points.length > 0 && (
                  <ul dir="auto" className="mt-2 list-disc ps-5 text-xs text-[#15254B]/60">
                    {a.missing_points.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}