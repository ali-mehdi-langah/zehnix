"use client";

import { useState, useTransition } from "react";
import { Check, Send, X } from "lucide-react";
import { sendNudge } from "@/app/teacher/class/[id]/risk/actions";

export default function SendNudgeDialog({
  classId,
  studentId,
  studentName,
}: {
  classId: string;
  studentId: string;
  studentName: string;
}) {
  const firstName = studentName.split(" ")[0] || "there";
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState(
    `Hi ${firstName}, I noticed you've fallen behind on recent quizzes. Let me know if you need any help. I'm happy to support you.`
  );
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await sendNudge(classId, studentId, message);
      if (res.ok) {
        setSent(true);
        setOpen(false);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          sent
            ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium px-3.5 py-2"
            : "inline-flex items-center gap-1.5 rounded-full border border-[#15254B]/15 text-[#15254B] hover:bg-slate-50 text-xs font-medium px-3.5 py-2 transition-colors"
        }
      >
        {sent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" strokeWidth={1.75} />}
        {sent ? "Nudge sent" : "Send nudge"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={() => !pending && setOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && !pending && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Send a nudge to ${studentName}`}
            className="w-full max-w-md rounded-2xl bg-white border border-slate-100 shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#15254B] tracking-tight">
                  Send a nudge
                </h3>
                <p className="text-sm text-[#15254B]/60 mt-0.5" dir="auto">
                  To {studentName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                aria-label="Close"
                className="text-[#15254B]/40 hover:text-[#15254B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={500}
              dir="auto"
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-[#15254B] outline-none focus:border-[#5D91F5] focus:bg-white focus:ring-2 focus:ring-[#5D91F5]/15 resize-none"
            />

            {error && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-[#15254B]/70 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="rounded-full bg-[#15254B] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#15254B]/90 disabled:opacity-60 transition-colors"
              >
                {pending ? "Sending..." : "Send nudge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}