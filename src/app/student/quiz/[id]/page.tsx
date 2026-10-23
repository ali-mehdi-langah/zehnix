import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuizRunner from "@/components/student/QuizRunner";
import type { ClientQuestion } from "@/types/quiz";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireStudent();

  // RLS returns the quiz only if the student joined its class
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, class_id")
    .eq("id", id)
    .maybeSingle();
  if (!quiz) notFound();

  const { data: qs } = await supabase
    .from("questions")
    .select("id, type, prompt, options, topic")
    .eq("quiz_id", id)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  // Strip everything the student must not see (correct answers, rubric)
  const questions: ClientQuestion[] = (qs ?? []).map((q) => ({
    id: q.id as string,
    type: q.type as "mcq" | "short",
    prompt: q.prompt as string,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
    topic: q.topic as string,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader role="student" email={user.email ?? ""} />
      <main className="mx-auto max-w-2xl px-6 py-8">
        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
            <p className="text-base font-semibold text-[#15254B]">This quiz has no questions yet</p>
          </div>
        ) : (
          <QuizRunner quizId={quiz.id as string} title={quiz.title as string} questions={questions} />
        )}
      </main>
    </div>
  );
}