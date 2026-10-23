"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "About us", href: "/about-us" },
];

type AuthState =
  | { status: "loading" }
  | { status: "out" }
  | { status: "in"; dashboardHref: string };

export interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function resolve(userId: string | null) {
      if (!userId) {
        if (!cancelled) setAuth({ status: "out" });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      const role = (data as { role?: string } | null)?.role;
      setAuth({
        status: "in",
        dashboardHref: role === "teacher" ? "/teacher" : "/student",
      });
    }

    supabase.auth.getUser().then(({ data }) => resolve(data.user?.id ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      resolve(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#15254B] text-white text-sm font-medium hover:bg-[#15254B]/90 active:scale-[0.98] transition-all duration-200";

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 px-4 pt-4", className)}>
      <div className="max-w-3xl mx-auto">
        {/* Pill */}
        <div className="flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between h-14 pl-5 pr-2 rounded-full bg-white/70 backdrop-blur-md border border-[#15254B]/10">
          {/* Left: Logo */}
          <a
            href="#home"
            className="flex items-center gap-2.5 justify-self-start"
            aria-label="Zehnix Home"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="3" fill="#5D91F5" />
              <circle cx="24" cy="8" r="3" fill="#5D91F5" />
              <circle cx="8" cy="24" r="3" fill="#5D91F5" />
              <circle cx="24" cy="24" r="3" fill="#5D91F5" />
              <line x1="24" y1="8" x2="8" y2="24" stroke="#5D91F5" strokeWidth="2.5" />
              <line x1="8" y1="8" x2="24" y2="8" stroke="#5D91F5" strokeWidth="2.5" />
              <line x1="8" y1="24" x2="24" y2="24" stroke="#5D91F5" strokeWidth="2.5" />
            </svg>
            <span className="font-semibold text-lg text-[#15254B] tracking-tight">
              zehnix
            </span>
          </a>

          {/* Center: Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-[#15254B]/70 hover:text-[#15254B] hover:bg-[#15254B]/5 px-4 py-2 rounded-full transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right: Desktop actions */}
          <div className="hidden md:flex items-center gap-1 justify-self-end">
            {auth.status === "loading" && (
              <div className="h-10 w-32" aria-hidden="true" />
            )}

            {auth.status === "out" && (
              <>
                <a
                  href="/login"
                  className="text-sm font-medium text-[#15254B]/70 hover:text-[#15254B] px-4 py-2 rounded-full transition-colors duration-200"
                >
                  Sign in
                </a>
                <a href="/register" className={cn(primaryBtn, "group px-5 py-2.5")}>
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </>
            )}

            {auth.status === "in" && (
              <a
                href={auth.dashboardHref}
                className={cn(primaryBtn, "group px-5 py-2.5")}
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[#15254B] hover:bg-[#15254B]/5 transition-colors"
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isOpen
              ? "max-h-[28rem] opacity-100 mt-2"
              : "max-h-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="bg-white rounded-2xl border border-[#15254B]/10 p-3 flex flex-col gap-1">
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-[#15254B]/80 hover:text-[#15254B] hover:bg-slate-50 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {auth.status !== "loading" && (
              <div className="mt-2 pt-3 border-t border-[#15254B]/10 flex flex-col gap-2">
                {auth.status === "out" ? (
                  <>
                    <a
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full inline-flex items-center justify-center text-sm font-medium text-[#15254B] px-5 py-3 rounded-full border border-[#15254B]/15 hover:bg-slate-50 transition-colors"
                    >
                      Sign in
                    </a>
                    <a
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className={cn(primaryBtn, "w-full px-5 py-3")}
                    >
                      <span>Get started</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </>
                ) : (
                  <a
                    href={auth.dashboardHref}
                    onClick={() => setIsOpen(false)}
                    className={cn(primaryBtn, "w-full px-5 py-3")}
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}