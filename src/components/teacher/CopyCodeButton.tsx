"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable, ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy join code ${code}`}
      className="inline-flex items-center gap-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors px-3 py-1.5"
    >
      <span className="font-mono text-sm font-semibold tracking-widest text-[#15254B]">{code}</span>
      <span className="text-[11px] font-semibold text-[#5D91F5]">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}