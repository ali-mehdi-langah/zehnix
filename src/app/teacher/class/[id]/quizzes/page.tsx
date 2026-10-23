import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GenerateQuizForm from "@/components/teacher/GenerateQuizForm";

type Quiz = { id: string; title: string; topic: string; created_at: string };

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function QuizzesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: qz } = await supabase
    .from("quizzes")
    .select("id, title, topic, created_at")
    .eq("class_id", id)
    .order("created_at", { ascending: false });
  const quizzes = (qz ?? []) as Quiz[];

  const questionCount: Record<string, number> = {};
  const attemptCount: Record<string, number> = {};

  if (quizzes.length > 0) {
    const ids = quizzes.map((q) => q.id);
    const [{ data: qs }, { data: at }] = await Promise.all([
      supabase.from("questions").select("quiz_id").in("quiz_id", ids),
      supabase.from("attempts").select("quiz_id").in("quiz_id", ids),
    ]);
    (qs ?? []).forEach((r: { quiz_id: string }) => {
      questionCount[r.quiz_id] = (questionCount[r.quiz_id] ?? 0) + 1;
    });
    (at ?? []).forEach((r: { quiz_id: string }) => {
      attemptCount[r.quiz_id] = (attemptCount[r.quiz_id] ?? 0) + 1;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      <div className="lg:col-span-2">
        <GenerateQuizForm classId={id} />
      </div>

      <div className="lg:col-span-3">
        <h2 className="text-base font-bold text-[#15254B]">Quizzes in this class</h2>

        {quizzes.length === 0 ? (
          <div className="mt-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
            <p className="text-base font-semibold text-[#15254B]">No quizzes yet</p>
            <p className="mt-1 text-sm text-[#15254B]/50">Generate your first quiz with the form.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {quizzes.map((q) => (
              <Link
                key={q.id}
                href={`/teacher/class/${id}/quizzes/${q.id}`}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-[#5D91F5]/40 transition-colors"
              >
                <p className="text-base font-bold text-[#15254B]">{q.title}</p>
                <p className="mt-1 text-xs text-[#15254B]/50">
                  {q.topic} · {questionCount[q.id] ?? 0} questions · {attemptCount[q.id] ?? 0} submissions · Created{" "}
                  {fmt(q.created_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}