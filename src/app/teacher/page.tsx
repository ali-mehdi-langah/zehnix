import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, ClipboardList, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";
import type { ClassRow } from "@/types/teacher";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CreateClassDialog from "@/components/teacher/CreateClassDialog";
import CopyCodeButton from "@/components/teacher/CopyCodeButton";

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile || profile.role !== "teacher") redirect("/login");

  const displayName = profile.full_name || user.email?.split("@")[0] || "Teacher";

  const { data: classesData } = await supabase
    .from("classes")
    .select("id, teacher_id, name, join_code, created_at")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });
  const classes = (classesData ?? []) as ClassRow[];
  const classIds = classes.map((c) => c.id);

  const studentCounts: Record<string, number> = {};
  const quizCounts: Record<string, number> = {};
  let totalStudents = 0;
  let totalQuizzes = 0;

  if (classIds.length > 0) {
    const [{ data: enr }, { data: qz }] = await Promise.all([
      supabase.from("enrollments").select("class_id").in("class_id", classIds),
      supabase.from("quizzes").select("id, class_id").in("class_id", classIds),
    ]);
    (enr ?? []).forEach((e: { class_id: string }) => {
      studentCounts[e.class_id] = (studentCounts[e.class_id] ?? 0) + 1;
      totalStudents += 1;
    });
    (qz ?? []).forEach((q: { class_id: string }) => {
      quizCounts[q.class_id] = (quizCounts[q.class_id] ?? 0) + 1;
      totalQuizzes += 1;
    });
  }

  const stats = [
    { label: "Classes", value: classes.length, icon: BookOpen },
    { label: "Students", value: totalStudents, icon: Users },
    { label: "Quizzes created", value: totalQuizzes, icon: ClipboardList },
  ];

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader role="teacher" email={user.email ?? ""} />

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#5D91F5]">{today}</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-semibold text-[#15254B] tracking-[-0.02em]">
              {greeting()}, {displayName}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#15254B]/60">
              Manage your classes, quizzes and students.
            </p>
          </div>
          {classes.length > 0 && <CreateClassDialog />}
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
                  <p className="text-2xl font-semibold text-[#15254B] leading-none">
                    {s.value}
                  </p>
                  <p className="text-sm text-[#15254B]/60 mt-1.5">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Classes */}
        <div className="mt-12 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-[#15254B] tracking-tight">
            My classes
          </h2>
          {classes.length > 0 && (
            <p className="text-sm text-[#15254B]/50">
              {classes.length} {classes.length === 1 ? "class" : "classes"}
            </p>
          )}
        </div>

        {classes.length === 0 ? (
          <div className="mt-4 bg-white rounded-2xl border border-dashed border-[#15254B]/15 px-6 py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#5D91F5]/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#5D91F5]" strokeWidth={1.75} />
            </div>
            <p className="mt-5 text-base font-semibold text-[#15254B]">
              No classes yet
            </p>
            <p className="mt-1.5 text-sm text-[#15254B]/60 max-w-sm mx-auto">
              Create your first class, share the join code with your students,
              and start generating quizzes.
            </p>
            <div className="mt-6">
              <CreateClassDialog label="Create your first class" />
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => {
              const students = studentCounts[c.id] ?? 0;
              const quizzes = quizCounts[c.id] ?? 0;
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col hover:border-[#5D91F5]/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-[#15254B] text-white flex items-center justify-center text-sm font-semibold">
                      {c.name.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-[#15254B] leading-snug truncate">
                        {c.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-[#15254B]/50">
                        Created {fmt(c.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-lg font-semibold text-[#15254B] leading-none">
                        {students}
                      </p>
                      <p className="text-xs text-[#15254B]/60 mt-1">
                        {students === 1 ? "Student" : "Students"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-lg font-semibold text-[#15254B] leading-none">
                        {quizzes}
                      </p>
                      <p className="text-xs text-[#15254B]/60 mt-1">
                        {quizzes === 1 ? "Quiz" : "Quizzes"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs text-[#15254B]/50 mb-1.5">Join code</p>
                    <CopyCodeButton code={c.join_code} />
                  </div>

                  <Link
                    href={`/teacher/class/${c.id}`}
                    className="group mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#15254B] text-white hover:bg-[#15254B]/90 active:scale-[0.98] transition-all text-sm font-medium py-2.5"
                  >
                    <span>Open class</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
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