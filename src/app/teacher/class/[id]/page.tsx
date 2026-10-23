import { createClient } from "@/lib/supabase/server";

type StudentRow = {
  id: string;
  created_at: string;
  student_id: string;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ClassOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: cls }, { data: rows }] = await Promise.all([
    supabase.from("classes").select("join_code").eq("id", id).maybeSingle(),
    supabase
      .from("enrollments")
      .select("id, created_at, student_id, profiles(full_name)")
      .eq("class_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const students = (rows ?? []) as unknown as StudentRow[];

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-[#15254B]">Students</h2>
      </div>

      {students.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-base font-semibold text-[#15254B]">No students yet</p>
          <p className="mt-1 text-sm text-[#15254B]/50">
            Share the code{" "}
            <span className="font-mono font-semibold text-[#15254B]">{cls?.join_code}</span> so
            students can join this class.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#15254B]/50 bg-slate-50">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
                return (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-6 py-3.5 font-medium text-[#15254B]">
                      {p?.full_name || "Unnamed student"}
                    </td>
                    <td className="px-6 py-3.5 text-[#15254B]/60">{fmt(s.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}