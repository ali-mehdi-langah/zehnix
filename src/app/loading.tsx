export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F5F8FE]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#5D91F5]/20 border-t-[#5D91F5] animate-spin" />
        <p className="text-sm text-[#15254B]/60">Loading...</p>
      </div>
    </div>
  );
}