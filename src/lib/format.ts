export function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function pct(score: number | null | undefined) {
  if (score === null || score === undefined) return null;
  return Math.round(Number(score) * 100);
}