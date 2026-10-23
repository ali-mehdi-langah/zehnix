import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";
import { computeRisk, type RiskAttempt, type RiskLevel } from "@/lib/risk";
import SendNudgeDialog from "@/components/teacher/SendNudgeDialog";

const LEVEL_STYLE: Record<RiskLevel, { badge: string; dot: string; label: string }> = {
  high: { badge: "bg-red-50 text-red-600", dot: "bg-red-500", label: "High risk" },
  medium: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500", label: "Medium" },
  low: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", label: "Low" },
};

function lastActiveLabel(iso: string | null) {
  if (!iso) return "Never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return fmtDate(iso);
}

type AttemptDb = {
  student_id: string;
  quiz_id: string;
  score: number | null;
  created_at: string;
};

export default async function RiskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: enr }, { data: qz }] = await Promise.all([
    supabase.from("enrollments").select("student_id").eq("class_id", id),
    supabase.from("quizzes").select("id").eq("class_id", id),
  ]);

  const studentIds = ((enr ?? []) as { student_id: string }[]).map((e) => e.student_id);
  const quizIds = ((qz ?? []) as { id: string }[]).map((q) => q.id);

  let names: Record<string, string> = {};
  const byStudent: Record<string, RiskAttempt[]> = {};

  if (studentIds.length > 0) {
    const [{ data: profs }, { data: att }] = await Promise.all([
      supabase.from("profiles").select("id, full_name").in("id", studentIds),
      quizIds.length > 0
        ? supabase
            .from("attempts")
            .select("student_id, quiz_id, score, created_at")
            .in("quiz_id", quizIds)
            .in("student_id", studentIds)
        : Promise.resolve({ data: [] as AttemptDb[] }),
    ]);

    names = Object.fromEntries(
      ((profs ?? []) as { id: string; full_name: string | null }[]).map((p) => [
        p.id,
        p.full_name || "Student",
      ])
    );

    ((att ?? []) as AttemptDb[]).forEach((a) => {
      (byStudent[a.student_id] ??= []).push({
        quizId: a.quiz_id,
        score: a.score,
        createdAt: a.created_at,
      });
    });
  }

  const rows = studentIds
    .map((sid) => ({
      id: sid,
      name: names[sid] ?? "Student",
      risk: computeRisk(byStudent[sid] ?? [], quizIds.length),
    }))
    .sort((a, b) => b.risk.score - a.risk.score || a.name.localeCompare(b.name));

  const counts = {
    high: rows.filter((r) => r.risk.level === "high").length,
    medium: rows.filter((r) => r.risk.level === "medium").length,
    low: rows.filter((r) => r.risk.level === "low").length,
  };

  if (studentIds.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#15254B]/15 px-6 py-14 text-center">
        <p className="text-base font-semibold text-[#15254B]">No students yet</p>
        <p className="mt-1.5 text-sm text-[#15254B]/60">
          Share your join code. Risk scores appear once students join and take quizzes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#15254B] tracking-tight">
          Early-warning dashboard
        </h2>
        <p className="mt-1 text-sm text-[#15254B]/60 max-w-2xl">
          Risk combines days since last activity, recent score trend, missed
          quizzes, and weekly engagement. Students most likely to need help are
          listed first.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["high", "medium", "low"] as RiskLevel[]).map((lvl) => (
          <div
            key={lvl}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-5 flex items-center gap-4"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${LEVEL_STYLE[lvl].dot}`} />
            <div>
              <p className="text-2xl font-semibold text-[#15254B] leading-none">
                {counts[lvl]}
              </p>
              <p className="text-sm text-[#15254B]/60 mt-1.5">
                {lvl === "high" ? "High risk" : lvl === "medium" ? "Medium risk" : "On track"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {quizIds.length === 0 && (
        <p className="text-sm text-[#15254B]/60 bg-white rounded-2xl border border-slate-100 px-5 py-4">
          No quizzes in this class yet, so everyone shows as low risk. Generate a quiz first.
        </p>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-[#15254B]/50">
              <th className="font-medium px-5 py-3">Student</th>
              <th className="font-medium px-5 py-3">Risk</th>
              <th className="font-medium px-5 py-3">Why</th>
              <th className="font-medium px-5 py-3">Last active</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => {
              const style = LEVEL_STYLE[r.risk.level];
              const reasons = r.risk.reasons.slice(0, 2);
              return (
                <tr key={r.id} className="align-top">
                  <td className="px-5 py-4 font-semibold text-[#15254B]" dir="auto">
                    {r.name}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${style.badge}`}
                    >
                      {style.label}
                      <span className="opacity-60">{r.risk.score}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#15254B]/70 max-w-xs">
                    {reasons.length > 0 ? (
                      <ul className="space-y-1">
                        {reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[#15254B]/40">On track</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#15254B]/60 whitespace-nowrap">
                    {lastActiveLabel(r.risk.lastActive)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {r.risk.level !== "low" && (
                      <SendNudgeDialog classId={id} studentId={r.id} studentName={r.name} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}