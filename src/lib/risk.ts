export type RiskLevel = "low" | "medium" | "high";

export type RiskAttempt = {
  quizId: string;
  score: number | null; // 0 to 1
  createdAt: string;
};

export type RiskResult = {
  score: number; // 0 to 100
  level: RiskLevel;
  reasons: string[];
  lastActive: string | null;
};

const DAY = 86_400_000;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function levelFor(score: number): RiskLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * Weights: inactivity 35, score trend 30, missed quizzes 20, weekly engagement 15.
 */
export function computeRisk(
  attempts: RiskAttempt[],
  totalQuizzes: number,
  now: Date = new Date()
): RiskResult {
  const t = now.getTime();
  const sorted = [...attempts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const last = sorted[sorted.length - 1];
  const lastActive = last ? last.createdAt : null;

  // Nothing to be at risk of yet.
  if (totalQuizzes === 0) {
    return { score: 0, level: "low", reasons: [], lastActive };
  }

  const reasons: string[] = [];

  // 1) Days since last activity (35%), reaches the maximum at 14 days
  let inactivity = 1;
  if (last) {
    const days = Math.floor((t - new Date(last.createdAt).getTime()) / DAY);
    inactivity = clamp01(days / 14);
    if (days >= 7) reasons.push(`No activity for ${days} days`);
  } else {
    reasons.push("Has not attempted any quiz yet");
  }

  // 2) Score trend over the last 3 graded attempts (30%), reaches the maximum at a 30-point drop
  let decline = 0;
  const graded = sorted.filter((a) => a.score !== null).slice(-3);
  if (graded.length >= 2) {
    const first = Number(graded[0].score);
    const final = Number(graded[graded.length - 1].score);
    const drop = first - final;
    decline = clamp01(drop / 0.3);
    if (drop >= 0.1) {
      reasons.push(
        `Scores dropped from ${Math.round(first * 100)}% to ${Math.round(final * 100)}% over the last ${graded.length} quizzes`
      );
    }
  }

  // 3) Quizzes not attempted (20%)
  const attemptedIds = new Set(attempts.map((a) => a.quizId));
  const missed = Math.max(0, totalQuizzes - attemptedIds.size);
  const missedRatio = missed / totalQuizzes;
  if (last && missed > 0 && missedRatio >= 0.3) {
    reasons.push(`Has not attempted ${missed} of ${totalQuizzes} quizzes`);
  }

  // 4) Weekly engagement drop (15%): this week vs last week
  let engagement = 0;
  const cur = attempts.filter((a) => t - new Date(a.createdAt).getTime() < 7 * DAY).length;
  const prev = attempts.filter((a) => {
    const age = t - new Date(a.createdAt).getTime();
    return age >= 7 * DAY && age < 14 * DAY;
  }).length;
  if (prev > 0) {
    engagement = clamp01((prev - cur) / prev);
    if (engagement >= 0.5) {
      reasons.push(`Activity fell from ${prev} to ${cur} attempts week over week`);
    }
  }

  const score = Math.round(
    inactivity * 35 + decline * 30 + missedRatio * 20 + engagement * 15
  );

  return { score, level: levelFor(score), reasons, lastActive };
}