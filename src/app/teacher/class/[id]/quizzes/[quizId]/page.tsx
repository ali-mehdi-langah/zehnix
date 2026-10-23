import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Question = {
  id: string;
  type: "mcq" | "short";
  topic: string;
  difficulty: number;
  prompt: string;
  options: string[] | null;
  correct_answer: string | null;
  model_answer: string | null;
  rubric: string | null;
};

const LEVEL = ["", "Easy", "Medium", "Hard"];

export default async function QuizPreviewPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id, quizId } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, topic")
    .eq("id", quizId)
    .eq("class_id", id)
    .maybeSingle();
  if (!quiz) notFound();

  const { data: qs } = await supabase
    .from("questions")
    .select("id, type, topic, difficulty, prompt, options, correct_answer, model_answer, rubric")
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  const questions = (qs ?? []) as Question[];

  return (
    <div>
      <Link
        href={`/teacher/class/${id}/quizzes`}
        className="text-sm font-medium text-[#15254B]/50 hover:text-[#15254B] transition-colors"
      >
        ← All quizzes
      </Link>

      <div className="mt-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-xl font-extrabold text-[#15254B]">{quiz.title}</p>
             <Link
          href={`/teacher/class/${id}/quizzes/${quizId}/submissions`}
          className="mt-3 inline-block rounded-full bg-[#5D91F5] hover:bg-[#4a7fe6] transition-colors text-white text-sm font-semibold px-5 py-2"
        >
          View student submissions
        </Link>
        <p className="mt-1 text-sm text-[#15254B]/50">
          {quiz.topic} · {questions.length} questions · Visible to your students now
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="rounded-full bg-[#5D91F5]/10 text-[#5D91F5] px-2.5 py-0.5">
                {q.type === "mcq" ? "Multiple choice" : "Short answer"}
              </span>
              <span className="rounded-full bg-slate-100 text-[#15254B]/60 px-2.5 py-0.5">{q.topic}</span>
              <span className="rounded-full bg-slate-100 text-[#15254B]/60 px-2.5 py-0.5">
                {LEVEL[q.difficulty] ?? "Medium"}
              </span>
            </div>

            <p dir="auto" className="mt-3 text-sm font-semibold text-[#15254B]">
              {i + 1}. {q.prompt}
            </p>

            {q.type === "mcq" ? (
              <ul className="mt-3 space-y-1.5">
                {(q.options ?? []).map((o) => {
                  const correct = o === q.correct_answer;
                  return (
                    <li
                      key={o}
                      dir="auto"
                      className={`rounded-lg px-3 py-2 text-sm ${
                        correct ? "bg-emerald-50 text-emerald-800 font-semibold" : "bg-slate-50 text-[#15254B]/70"
                      }`}
                    >
                      {o}
                      {correct && <span className="ml-2 text-xs">Correct</span>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-3 space-y-2 text-sm">
                <p dir="auto" className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">
                  <span className="font-semibold">Model answer: </span>
                  {q.model_answer}
                </p>
                <p dir="auto" className="rounded-lg bg-slate-50 px-3 py-2 text-[#15254B]/70">
                  <span className="font-semibold text-[#15254B]">Marking rubric: </span>
                  {q.rubric}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}