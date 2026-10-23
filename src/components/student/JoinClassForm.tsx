"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinClass } from "@/app/student/actions";

export default function JoinClassForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await joinClass(code);
      if (res.ok) {
        setCode("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h2 className="text-base font-bold text-[#15254B]">Join a class</h2>
      <p className="mt-1 text-sm text-[#15254B]/50">Enter the 6-character code from your teacher.</p>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          placeholder="ABC123"
          aria-label="Class join code"
          className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-sm tracking-widest uppercase text-[#15254B] placeholder:text-[#15254B]/30 focus:outline-none focus:ring-2 focus:ring-[#5D91F5]/40 focus:border-[#5D91F5]"
        />
        <button
          type="submit"
          disabled={pending || code.trim().length !== 6}
          className="rounded-full bg-[#5D91F5] hover:bg-[#4a7fe6] disabled:opacity-50 transition-colors text-white text-sm font-semibold px-6 py-2.5"
        >
          {pending ? "Joining…" : "Join class"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}