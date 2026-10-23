"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { gradeMyAttempt } from "@/app/student/actions";
import { gradePendingAttempt } from "@/app/teacher/actions";

export default function GradeNowButton({
  attemptId,
  mode,
}: {
  attemptId: string;
  mode: "student" | "teacher";
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run() {
    setMsg(null);
    startTransition(async () => {
      const res = mode === "student" ? await gradeMyAttempt(attemptId) : await gradePendingAttempt(attemptId);
      if (res.ok) {
        setMsg(
          res.failed > 0
            ? `Graded ${res.graded}, ${res.failed} failed. Try again.`
            : `Graded ${res.graded} ${res.graded === 1 ? "answer" : "answers"}.`
        );
        router.refresh();
      } else {
        setMsg(res.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-full bg-[#5D91F5] hover:bg-[#4a7fe6] disabled:opacity-60 transition-colors text-white text-sm font-semibold px-5 py-2"
      >
        {pending ? "Grading…" : "Grade short answers now"}
      </button>
      {msg && <span className="text-xs text-[#15254B]/60">{msg}</span>}
    </div>
  );
}