"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "../actions";
import {
  AuthCard,
  Field,
  SubmitButton,
  Alert,
  Divider,
} from "@/components/auth/auth-ui";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await login(formData);
      // login() redirects on success; result is only returned on error
      if (result?.error) setError(result.error);
    });
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue your learning journey"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {error && <Alert type="error" message={error} />}

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

        <div className="flex flex-col gap-1.5">
          <Field
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={isPending}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-[#5D91F5] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <SubmitButton
          label="Sign in"
          pendingLabel="Signing in…"
          pending={isPending}
        />

        <Divider label="or" />

        <p className="text-center text-sm text-[#15254B]/60">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#5D91F5] font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
