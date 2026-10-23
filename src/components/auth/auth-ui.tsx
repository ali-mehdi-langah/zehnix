"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Reusable field                                                       */
/* ------------------------------------------------------------------ */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export function Field({
  label,
  id,
  error,
  className,
  type = "text",
  ...props
}: FieldProps) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-[#15254B]/70 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={inputType}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-[#15254B] placeholder:text-[#15254B]/30 outline-none transition-all duration-200",
            "focus:border-[#5D91F5] focus:bg-white focus:ring-2 focus:ring-[#5D91F5]/15",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-400 focus:border-red-400 focus:ring-red-400/15",
            isPassword && "pr-11",
            className
          )}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#15254B]/40 hover:text-[#15254B]/70 transition-colors"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Alert banner                                                         */
/* ------------------------------------------------------------------ */
interface AlertProps {
  type: "error" | "success";
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl px-4 py-3 text-sm font-medium",
        type === "error"
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
      )}
    >
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Submit button with built-in pending state                           */
/* ------------------------------------------------------------------ */
interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  pending: boolean;
}

export function SubmitButton({ label, pendingLabel, pending }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-800 text-white text-sm font-semibold px-6 py-3 shadow-lg shadow-[#5D91F5]/30 hover:shadow-xl hover:shadow-[#5D91F5]/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {pending ? (pendingLabel ?? label) : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Auth card shell                                                      */
/* ------------------------------------------------------------------ */
interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      {/* Glass card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#15254B]/8 border border-white/70 px-8 py-10 sm:px-10">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-[#5D91F5]/20 blur-xl rounded-full" />
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
              <ellipse cx="24" cy="24" rx="18" ry="21" stroke="#5D91F5" strokeWidth="1.75" fill="none" />
              <ellipse cx="24" cy="24" rx="9" ry="21" stroke="#5D91F5" strokeWidth="1.75" fill="none" />
              <line x1="24" y1="3" x2="24" y2="45" stroke="#5D91F5" strokeWidth="1.75" />
              <circle cx="24" cy="24" r="3.5" fill="#5D91F5" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-[#15254B] tracking-tight">{title}</h1>
          <p className="text-sm text-[#15254B]/50 mt-1 text-center">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Divider                                                              */
/* ------------------------------------------------------------------ */
export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs text-[#15254B]/40 font-medium">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}
