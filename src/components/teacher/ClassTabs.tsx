"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClassTabs({ classId }: { classId: string }) {
  const pathname = usePathname();
  const base = `/teacher/class/${classId}`;
  const tabs = [
    { label: "Overview", href: base },
    { label: "Quizzes", href: `${base}/quizzes` },
    { label: "Risk", href: `${base}/risk` },
  ];

  return (
    <nav className="mt-6 flex gap-1 border-b border-slate-200" aria-label="Class sections">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors ${
              active
                ? "border-[#5D91F5] text-[#5D91F5]"
                : "border-transparent text-[#15254B]/50 hover:text-[#15254B]"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}