import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-slate-200/70", className)}
      aria-hidden="true"
    />
  );
}

/** Placeholder for the dark floating DashboardHeader pill. */
export function HeaderSkeleton() {
  return (
    <div className="sticky top-0 z-40 px-4 pt-3" aria-hidden="true">
      <div className="mx-auto max-w-3xl h-14 rounded-full bg-slate-800 flex items-center justify-between pl-5 pr-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-white/15 animate-pulse" />
          <div className="w-16 h-4 rounded bg-white/15 animate-pulse" />
        </div>
        <div className="w-24 h-8 rounded-full bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

export function TitleSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-72 max-w-full" />
      <Skeleton className="h-4 w-56 max-w-full" />
    </div>
  );
}

export function StatsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-5 flex items-center gap-4"
        >
          <Skeleton className="w-11 h-11 shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
          <Skeleton className="h-10 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function LoadingLabel({ text = "Loading" }: { text?: string }) {
  return <span className="sr-only">{text}</span>;
}