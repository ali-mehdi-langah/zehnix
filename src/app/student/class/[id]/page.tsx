import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { fmtDate, pct } from "@/lib/format";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

type Quiz = { id: string; title: string; topic: string; created_at: string };
type Attempt = { quiz_id: string; score: number | null };

export default async function StudentClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireStudent();

  // RLS only returns classes the student has joined
  const { data: cls } = await supabase.from("classes").select("id, name").eq("id", id).maybeSingle();
  if (!cls) notFound();

  const { data: qz } = await supabase
    .from("quizzes")
    .select("id, title, topic, created_at")
    .eq("class_id", id)
    .order("created_at", { ascending: false });
  const quizzes = (qz ?? []) as Quiz[];

  const attemptsByQuiz: Record<string, Attempt[]> = {};
  if (quizzes.length > 0) {
    const { data: att } = await supabase
      .from("attempts")
      .select("quiz_id, score")
      .eq("student_id", user.id)
      .in("quiz_id", quizzes.map((q) => q.id));
    ((att ?? []) as Attempt[]).forEach((a) => {
      (attemptsByQuiz[a.quiz_id] ??= []).push(a);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader role="student" email={user.email ?? ""} />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/student" className="text-sm font-medium text-[#15254B]/50 hover:text-[#15254B] transition-colors">
          ← My classes
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-[#15254B] tracking-tight">{cls.name}</h1>
        <p className="mt-1.5 text-sm text-[#15254B]/50">
          {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} available
        </p>

        {quizzes.length === 0 ? (
          <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
            <p className="text-base font-semibold text-[#15254B]">No quizzes yet</p>
            <p className="mt-1 text-sm text-[#15254B]/50">Your teacher hasn&apos;t published a quiz for this class.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {quizzes.map((q) => {
              const tries = attemptsByQuiz[q.id] ?? [];
              const scores = tries.map((t) => pct(t.score)).filter((s): s is number => s !== null);
              const best = scores.length ? Math.max(...scores) : null;
              const pendingOnly = tries.length > 0 && scores.length === 0;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-base font-bold text-[#15254B]">{q.title}</p>
                    <p className="mt-1 text-xs text-[#15254B]/50">
                      {q.topic} · Added {fmtDate(q.created_at)}
                    </p>
                    {tries.length > 0 && (
                      <p className="mt-2 text-xs font-semibold text-[#5D91F5]">
                        {best !== null
                          ? `Best score ${best}% · ${tries.length} ${tries.length === 1 ? "attempt" : "attempts"}`
                          : pendingOnly
                          ? "Awaiting grading"
                          : ""}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/student/quiz/${q.id}`}
                    className="rounded-full bg-[#5D91F5] hover:bg-[#4a7fe6] transition-colors text-white text-sm font-semibold px-5 py-2"
                  >
                    {tries.length > 0 ? "Retake quiz" : "Start quiz"}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}