export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-[65px] bg-white border-b border-slate-100" />
      <main className="mx-auto max-w-6xl px-6 py-10 animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-slate-200" />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-slate-100" />
          ))}
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white border border-slate-100" />
          ))}
        </div>
      </main>
    </div>
  );
}