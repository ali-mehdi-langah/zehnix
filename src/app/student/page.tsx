import Link from "next/link";
import { BookOpen, ChevronRight, ClipboardCheck, Target, Trophy } from "lucide-react";
import { requireStudent } from "@/lib/auth/requireStudent";
import { fmtDate, pct } from "@/lib/format";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import JoinClassForm from "@/components/student/JoinClassForm";

type Rel<T> = T | T[] | null;
const one = <T,>(v: Rel<T>): T | null => (Array.isArray(v) ? v[0] ?? null : v);

type EnrollRow = { id: string; classes: Rel<{ id: string; name: string }> };
type AttemptRow = {
  id: string;
  score: number | null;
  created_at: string;
  quizzes: Rel<{ title: string }>;
};

function scorePill(p: number) {
  if (p >= 80) return "bg-emerald-50 text-emerald-700";
  if (p >= 50) return "bg-[#5D91F5]/10 text-[#3F6FD1]";
  return "bg-red-50 text-red-600";
}

export default async function StudentDashboard() {
  const { supabase, user, profile } = await requireStudent();
  const displayName = profile.full_name || user.email?.split("@")[0] || "Student";

  const [{ data: enr }, { data: att }, { data: mas }] = await Promise.all([
    supabase.from("enrollments").select("id, classes(id, name)").eq("student_id", user.id),
    supabase
      .from("attempts")
      .select("id, score, created_at, quizzes(title)")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("mastery").select("score").eq("student_id", user.id),
  ]);

  const enrollments = (enr ?? []) as unknown as EnrollRow[];
  const attempts = (att ?? []) as unknown as AttemptRow[];
  const mastery = (mas ?? []) as { score: number }[];

  const graded = attempts.filter((a) => a.score !== null);
  const avg = graded.length
    ? Math.round((graded.reduce((s, a) => s + Number(a.score), 0) / graded.length) * 100)
    : null;
  const mastered = mastery.filter((m) => Number(m.score) >= 0.8).length;

  const stats = [
    { label: "Quizzes taken", value: attempts.length.toString(), icon: ClipboardCheck },
    { label: "Average score", value: avg === null ? "—" : `${avg}%`, icon: Target },
    { label: "Topics mastered", value: mastered.toString(), icon: Trophy },
  ];

  return (
    // Page background: change this one class to match your landing page.
    <div className="min-h-screen bg-[#F5F8FE]">
      <DashboardHeader role="student" email={user.email ?? ""} />

      <main className="mx-auto max-w-4xl px-6 py-10 sm:py-12">
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-[#5D91F5]">Student dashboard</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold text-[#15254B] tracking-[-0.02em]">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#15254B]/60">
            Pick a class to take a quiz.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl bg-[#5D91F5]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#5D91F5]" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[#15254B] leading-none">{s.value}</p>
                  <p className="text-sm text-[#15254B]/60 mt-1.5">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Join class */}
        <div className="mt-8">
          <JoinClassForm />
        </div>

        {/* Classes */}
        <h2 className="mt-12 text-lg font-semibold text-[#15254B] tracking-tight">My classes</h2>
        {enrollments.length === 0 ? (
          <div className="mt-4 bg-white rounded-2xl border border-dashed border-[#15254B]/15 px-6 py-14 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#5D91F5]/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#5D91F5]" strokeWidth={1.75} />
            </div>
            <p className="mt-5 text-base font-semibold text-[#15254B]">
              You haven&apos;t joined a class yet
            </p>
            <p className="mt-1.5 text-sm text-[#15254B]/60">
              Enter a join code above to get started.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrollments.map((e) => {
              const c = one(e.classes);
              if (!c) return null;
              return (
                <Link
                  key={e.id}
                  href={`/student/class/${c.id}`}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:border-[#5D91F5]/40 transition-colors"
                >
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[#15254B] text-white flex items-center justify-center text-sm font-semibold">
                    {c.name.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-[#15254B] truncate">{c.name}</p>
                    <p className="text-sm text-[#15254B]/60 mt-0.5">View quizzes</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#15254B]/30 transition-transform group-hover:translate-x-0.5 group-hover:text-[#5D91F5]" />
                </Link>
              );
            })}
          </div>
        )}

        {/* Recent results */}
        {attempts.length > 0 && (
          <>
            <h2 className="mt-12 text-lg font-semibold text-[#15254B] tracking-tight">
              Recent results
            </h2>
            <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {attempts.slice(0, 5).map((a) => {
                const p = pct(a.score);
                return (
                  <Link
                    key={a.id}
                    href={`/student/results/${a.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#15254B] truncate">
                        {one(a.quizzes)?.title ?? "Quiz"}
                      </p>
                      <p className="text-xs text-[#15254B]/50 mt-0.5">{fmtDate(a.created_at)}</p>
                    </div>
                    {p === null ? (
                      <span className="shrink-0 rounded-full bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1">
                        Awaiting grading
                      </span>
                    ) : (
                      <span
                        className={`shrink-0 rounded-full text-sm font-semibold px-3 py-1 ${scorePill(p)}`}
                      >
                        {p}%
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}