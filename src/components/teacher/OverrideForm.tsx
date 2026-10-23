"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { overrideGrade } from "@/app/teacher/actions";

export default function OverrideForm({
  answerId,
  initialScore,
  initialFeedback,
}: {
  answerId: string;
  initialScore: number | null;
  initialFeedback: string | null;
}) {
  const [score, setScore] = useState(initialScore === null ? "" : String(Math.round(initialScore * 100)));
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function save() {
    setMsg(null);
    if (score.trim() === "") {
      setMsg({ ok: false, text: "Enter a score from 0 to 100." });
      return;
    }
    startTransition(async () => {
      const res = await overrideGrade(answerId, Number(score), feedback);
      if (res.ok) {
        setMsg({ ok: true, text: "Saved." });
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  }

  return (
    <div className="mt-3 rounded-xl bg-slate-50 p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[11px] font-medium text-[#15254B]/60" htmlFor={`s-${answerId}`}>
            Score (0–100)
          </label>
          <input
            id={`s-${answerId}`}
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="mt-1 w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-[#15254B] focus:outline-none focus:ring-2 focus:ring-[#5D91F5]/40"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] font-medium text-[#15254B]/60" htmlFor={`f-${answerId}`}>
            Feedback (optional)
          </label>
          <input
            id={`f-${answerId}`}
            dir="auto"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            maxLength={600}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-[#15254B] focus:outline-none focus:ring-2 focus:ring-[#5D91F5]/40"
          />
        </div>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-[#15254B] hover:bg-[#0f1c3a] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 transition-colors"
        >
          {pending ? "Saving…" : "Save grade"}
        </button>
      </div>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}