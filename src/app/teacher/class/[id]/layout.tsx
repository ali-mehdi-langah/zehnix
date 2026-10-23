import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";
import type { ClassRow } from "@/types/teacher";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CopyCodeButton from "@/components/teacher/CopyCodeButton";
import ClassTabs from "@/components/teacher/ClassTabs";

export default async function ClassLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<Pick<Profile, "role">>();
  if (!profile || profile.role !== "teacher") redirect("/login");

  const { data: cls } = await supabase
    .from("classes")
    .select("id, teacher_id, name, join_code, created_at")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .maybeSingle();
  if (!cls) notFound();
  const klass = cls as ClassRow;

  const { count } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("class_id", id);
  const studentCount = count ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader role="teacher" email={user.email ?? ""} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/teacher"
          className="text-sm font-medium text-[#15254B]/50 hover:text-[#15254B] transition-colors"
        >
          ← All classes
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#15254B] tracking-tight">{klass.name}</h1>
            <p className="mt-1.5 text-sm text-[#15254B]/50">
              {studentCount} {studentCount === 1 ? "student" : "students"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#15254B]/50 mb-1.5">Join code</p>
            <CopyCodeButton code={klass.join_code} />
          </div>
        </div>

        <ClassTabs classId={id} />

        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}