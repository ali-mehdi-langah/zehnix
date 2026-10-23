"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { GraduationCap, BookOpen } from "lucide-react";
import { register } from "../actions";
import {
  AuthCard,
  Field,
  SubmitButton,
  Alert,
  Divider,
} from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/database.types";

// ─── Role pill selector ────────────────────────────────────────────────────────
function RoleSelector({
  value,
  onChange,
  disabled,
}: {
  value: UserRole;
  onChange: (r: UserRole) => void;
  disabled: boolean;
}) {
  const options: { role: UserRole; label: string; Icon: typeof GraduationCap; desc: string }[] = [
    { role: "student", label: "Student",  Icon: BookOpen,     desc: "I'm here to learn" },
    { role: "teacher", label: "Teacher",  Icon: GraduationCap, desc: "I manage classes" },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-[#15254B]/70 tracking-wide uppercase">
        I am a…
      </span>
      <div className="grid grid-cols-2 gap-2">
        {options.map(({ role, label, Icon, desc }) => (
          <button
            key={role}
            type="button"
            disabled={disabled}
            onClick={() => onChange(role)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-all duration-200",
              value === role
                ? "border-[#5D91F5] bg-[#5D91F5]/8 text-[#5D91F5]"
                : "border-slate-200 bg-slate-50/60 text-[#15254B]/60 hover:border-slate-300 hover:text-[#15254B]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
            <span className="text-[10px] font-normal opacity-70">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [role, setRole]               = useState<UserRole>("student");
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | undefined>();

  function validate(formData: FormData): boolean {
    const password = formData.get("password") as string;
    const confirm  = formData.get("confirmPassword") as string;

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirm) {
      setPasswordError("Passwords do not match.");
      return false;
    }
    setPasswordError(undefined);
    return true;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    formData.set("role", role); // inject selected role
    if (!validate(formData)) return;

    startTransition(async () => {
      const result = await register(formData);
      if (result?.error)   setError(result.error);
      else if (result?.success) setSuccess(result.success);
    });
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start your personalized learning journey today"
    >
      {success ? (
        <div className="flex flex-col items-center gap-5 py-2">
          <Alert type="success" message={success} />
          <Link
            href="/login"
            className="text-sm text-[#5D91F5] font-semibold hover:underline"
          >
            Back to sign in →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {error && <Alert type="error" message={error} />}

          {/* Role selector */}
          <RoleSelector value={role} onChange={setRole} disabled={isPending} />

          <Field
            label="Full name"
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Alex Johnson"
            autoComplete="name"
            required
            disabled={isPending}
          />

          <Field
            label="Email address"
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={isPending}
          />

          <Field
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
            disabled={isPending}
            error={passwordError}
          />

          <Field
            label="Confirm password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
            disabled={isPending}
          />

          <p className="text-xs text-[#15254B]/40 -mt-2">
            By creating an account you agree to our{" "}
            <Link href="/terms"   className="text-[#5D91F5] hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-[#5D91F5] hover:underline">Privacy Policy</Link>.
          </p>

          <SubmitButton
            label="Create account"
            pendingLabel="Creating account…"
            pending={isPending}
          />

          <Divider label="or" />

          <p className="text-center text-sm text-[#15254B]/60">
            Already have an account?{" "}
            <Link href="/login" className="text-[#5D91F5] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
