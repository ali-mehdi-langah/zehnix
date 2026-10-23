import Link from "next/link";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";

export default function DashboardHeader({
  role,
  email,
}: {
  role: "student" | "teacher";
  email: string;
}) {
  const initial = (email.trim().charAt(0) || "?").toUpperCase();

  return (
    <header className="sticky top-0 z-40 px-4 pt-3">
      <div className="mx-auto max-w-4xl h-14 pl-5 pr-2 rounded-full bg-slate-800 border border-white/10 shadow-lg shadow-slate-900/10 flex items-center justify-between">
        {/* Left: logo + role */}
        <Link
          href={role === "teacher" ? "/teacher" : "/student"}
          className="flex items-center gap-2.5"
          aria-label="Zehnix dashboard"
        >
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="3" fill="#5D91F5" />
            <circle cx="24" cy="8" r="3" fill="#5D91F5" />
            <circle cx="8" cy="24" r="3" fill="#5D91F5" />
            <circle cx="24" cy="24" r="3" fill="#5D91F5" />
            <line x1="24" y1="8" x2="8" y2="24" stroke="#5D91F5" strokeWidth="2.5" />
            <line x1="8" y1="8" x2="24" y2="8" stroke="#5D91F5" strokeWidth="2.5" />
            <line x1="8" y1="24" x2="24" y2="24" stroke="#5D91F5" strokeWidth="2.5" />
          </svg>
          <span className="font-semibold text-lg text-white tracking-tight">zehnix</span>
          <span className="ml-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-200">
            {role === "teacher" ? "Teacher" : "Student"}
          </span>
        </Link>

        {/* Right: user + sign out */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 pr-1">
            <div
              className="w-8 h-8 rounded-full bg-[#5D91F5] text-white flex items-center justify-center text-xs font-semibold"
              aria-hidden="true"
            >
              {initial}
            </div>
            <span className="hidden md:block max-w-[140px] truncate text-sm text-slate-300">
              {email}
            </span>
          </div>

          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors h-10 px-3.5"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}