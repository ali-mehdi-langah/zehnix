"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClass } from "@/app/teacher/actions";

export default function CreateClassDialog({ label = "Create class" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function close() {
    if (pending) return;
    setOpen(false);
    setError(null);
    setName("");
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) {
        setOpen(false);
        setError(null);
        setName("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 60) {
      setError("Class name must be 2–60 characters.");
      return;
    }
    startTransition(async () => {
      const res = await createClass(trimmed);
      if (res.ok) {
        setOpen(false);
        setName("");
        router.refresh();
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
        className="rounded-full bg-[#5D91F5] hover:bg-[#4a7fe6] transition-colors text-white text-sm font-semibold px-5 py-2.5 shadow-sm"
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#15254B]/40 px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-class-title"
        >
          <form
            onSubmit={onSubmit}
            className="w-full max-w-md rounded-2xl bg-white border border-slate-100 shadow-xl p-6"
          >
            <h2 id="create-class-title" className="text-lg font-bold text-[#15254B]">
              Create a class
            </h2>
            <p className="mt-1 text-sm text-[#15254B]/50">
              Students join with a code we generate for you.
            </p>

            <label htmlFor="class-name" className="mt-5 block text-sm font-medium text-[#15254B]">
              Class name
            </label>
            <input
              id="class-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Grade 8 Science"
              maxLength={60}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[#15254B] placeholder:text-[#15254B]/30 focus:outline-none focus:ring-2 focus:ring-[#5D91F5]/40 focus:border-[#5D91F5]"
            />

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="rounded-full px-4 py-2 text-sm font-medium text-[#15254B]/60 hover:text-[#15254B] hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-[#5D91F5] hover:bg-[#4a7fe6] disabled:opacity-60 transition-colors text-white text-sm font-semibold px-5 py-2"
              >
                {pending ? "Creating…" : "Create class"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}