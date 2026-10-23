"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAttempt } from "@/app/student/actions";
import type { ClientQuestion } from "@/types/quiz";

export default function QuizRunner({
  quizId,
  title,
  questions,
}: {
  quizId: string;
  title: string;
  questions: ClientQuestion[];
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const q = questions[index];
  const isLast = index === questions.length - 1;
  const unanswered = questions.filter((x) => (answers[x.id] ?? "").trim() === "").length;
  const progress = Math.round(((index + 1) / questions.length) * 100);

  function setAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await submitAttempt(quizId, answers);
      if (res.ok) {
        router.push(`/student/results/${res.attemptId}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[#15254B] tracking-tight">{title}</h1>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-[#15254B]/50 mb-1.5">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>{q.topic}</span>
        </div>
        <div
          className="h-2 rounded-full bg-slate-200 overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-[#5D91F5] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <p dir="auto" className="text-lg font-semibold text-[#15254B] leading-snug">
          {q.prompt}
        </p>

        {q.type === "mcq" ? (
          <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Answer options">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  dir="auto"
                  onClick={() => setAnswer(opt)}
                  className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    selected
                      ? "border-[#5D91F5] bg-[#5D91F5]/10 text-[#15254B]"
                      : "border-slate-200 text-[#15254B]/80 hover:border-[#5D91F5]/50 hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5">
            <label htmlFor="short-answer" className="sr-only">
              Your answer
            </label>
            <textarea
              id="short-answer"
              dir="auto"
              rows={5}
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={2000}
              placeholder="Write your answer in any language you like…"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#15254B] placeholder:text-[#15254B]/30 focus:outline-none focus:ring-2 focus:ring-[#5D91F5]/40 focus:border-[#5D91F5]"
            />
          </div>
        )}
      </div>

      {isLast && unanswered > 0 && (
        <p className="mt-4 text-sm text-amber-700">
          You have {unanswered} unanswered {unanswered === 1 ? "question" : "questions"}. Unanswered questions score 0.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0 || pending}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-[#15254B]/60 hover:text-[#15254B] hover:bg-slate-100 disabled:opacity-40 transition-colors"
        >
          Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-full bg-[#5D91F5] hover:bg-[#4a7fe6] disabled:opacity-60 transition-colors text-white text-sm font-semibold px-6 py-2.5"
          >
            {pending ? "Submitting…" : "Submit quiz"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="rounded-full bg-[#5D91F5] hover:bg-[#4a7fe6] transition-colors text-white text-sm font-semibold px-6 py-2.5"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}