export type GeneratedQuestion = {
  type: "mcq" | "short";
  prompt: string;
  options: string[] | null;
  correct_answer: string | null;
  model_answer: string | null;
  rubric: string | null;
  topic: string;
  difficulty: 1 | 2 | 3;
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DEFAULT_RUBRIC =
  "Award full marks if the answer covers the key ideas in the model answer. Give partial marks for partly correct or incomplete answers.";

/** Validates and cleans the model output. Drops any malformed question. */
export function cleanQuiz(raw: unknown, fallbackTopic: string) {
  const obj = (raw ?? {}) as { title?: unknown; questions?: unknown };
  const title = (str(obj.title) || `${fallbackTopic} quiz`).slice(0, 120);
  const list = Array.isArray(obj.questions) ? obj.questions : [];

  const mcq: GeneratedQuestion[] = [];
  const short: GeneratedQuestion[] = [];

  for (const item of list) {
    const q = (item ?? {}) as Record<string, unknown>;
    const prompt = str(q.prompt);
    if (!prompt) continue;

    const topic = str(q.topic).slice(0, 60) || fallbackTopic;
    const d = Math.round(Number(q.difficulty));
    const difficulty = (d >= 1 && d <= 3 ? d : 2) as 1 | 2 | 3;

    if (q.type === "mcq") {
      const options = Array.isArray(q.options)
        ? Array.from(new Set(q.options.map(str).filter(Boolean)))
        : [];
      if (options.length !== 4) continue;

      const given = str(q.correct_answer);
      let idx = options.findIndex((o) => o === given);
      if (idx < 0) idx = options.findIndex((o) => o.toLowerCase() === given.toLowerCase());
      if (idx < 0 && /^[A-Da-d]$/.test(given)) idx = given.toUpperCase().charCodeAt(0) - 65;
      if (idx < 0 || idx > 3) continue;

      const correct = options[idx];
      mcq.push({
        type: "mcq",
        prompt,
        options: shuffle(options),
        correct_answer: correct,
        model_answer: null,
        rubric: null,
        topic,
        difficulty,
      });
    } else if (q.type === "short") {
      const model = str(q.model_answer);
      if (!model) continue;
      short.push({
        type: "short",
        prompt,
        options: null,
        correct_answer: null,
        model_answer: model,
        rubric: str(q.rubric) || DEFAULT_RUBRIC,
        topic,
        difficulty,
      });
    }
  }

  return { title, mcq, short };
}