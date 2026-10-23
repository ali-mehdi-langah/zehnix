import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In — Zehnix",
  description: "Sign in to your Zehnix account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden selection:bg-[#5D91F5]/20 selection:text-[#15254B]">
      {/* Sky gradient background */}
      <div className="absolute top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-[#7CB2FE] via-[#B4D7FE] via-55% to-white pointer-events-none z-0" />

      {/* Cloud decorations */}
      <div className="absolute top-0 left-0 right-0 h-[380px] pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-10 -left-10 w-[320px] h-[240px] opacity-80">
          <svg viewBox="0 0 500 350" className="w-full h-full fill-white filter blur-[0.5px]">
            <ellipse cx="180" cy="220" rx="170" ry="85" />
            <circle cx="160" cy="140" r="105" />
            <circle cx="280" cy="160" r="115" />
            <circle cx="360" cy="220" r="80" />
          </svg>
        </div>
        <div className="absolute -top-14 -right-10 w-[340px] h-[260px] opacity-80">
          <svg viewBox="0 0 500 350" className="w-full h-full fill-white filter blur-[0.5px]">
            <ellipse cx="320" cy="220" rx="170" ry="85" />
            <circle cx="340" cy="140" r="105" />
            <circle cx="220" cy="160" r="120" />
            <circle cx="130" cy="210" r="85" />
          </svg>
        </div>
        <div className="absolute top-[280px] left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/80 to-white" />
      </div>

      {/* Navbar strip */}
      <header className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              aria-label="Zehnix Home"
            >
              <div className="transition-transform duration-200 group-hover:scale-105">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="3" fill="#5D91F5" />
                  <circle cx="24" cy="8" r="3" fill="#5D91F5" />
                  <circle cx="8" cy="24" r="3" fill="#5D91F5" />
                  <circle cx="24" cy="24" r="3" fill="#5D91F5" />
                  <line x1="24" y1="8" x2="8" y2="24" stroke="#5D91F5" strokeWidth="2.5" />
                  <line x1="8" y1="8" x2="24" y2="8" stroke="#5D91F5" strokeWidth="2.5" />
                  <line x1="8" y1="24" x2="24" y2="24" stroke="#5D91F5" strokeWidth="2.5" />
                </svg>
              </div>
              <span className="font-bold text-xl text-[#15254B] tracking-tight">zehnix</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="relative z-10 flex items-center justify-center px-4 py-8 sm:py-12 min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
}
