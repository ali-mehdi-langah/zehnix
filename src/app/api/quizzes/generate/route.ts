import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJson } from "@/lib/llm";
import { cleanQuiz } from "@/lib/quizSchema";

export const maxDuration = 60;

const LANGUAGES: Record<string, string> = {
  en: "English",
  ur: "Urdu (use Urdu script)",
  sd: "Sindhi (use Sindhi Arabic script)",
  ps: "Pashto (use Pashto script)",
};
const LEVELS = ["easy", "medium", "hard", "mixed"] as const;

const clampInt = (v: unknown, min: number, max: number) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};

const isDev = process.env.NODE_ENV === "development";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You are signed out. Log in again." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const classId = String(body.classId ?? "");
  const topic = String(body.topic ?? "").trim();
  const notes = String(body.notes ?? "").trim().slice(0, 500);
  const language = LANGUAGES[String(body.language)] ? String(body.language) : "en";
  const level = (LEVELS as readonly string[]).includes(String(body.difficulty))
    ? String(body.difficulty)
    : "mixed";
  const mcqCount = clampInt(body.mcqCount, 0, 10);
  const shortCount = clampInt(body.shortCount, 0, 6);

  if (topic.length < 3 || topic.length > 100) {
    return NextResponse.json({ error: "Topic must be 3–100 characters." }, { status: 400 });
  }
  if (mcqCount + shortCount < 1) {
    return NextResponse.json({ error: "Ask for at least one question." }, { status: 400 });
  }

  // Only the class owner may create quizzes
  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .maybeSingle();
  if (!cls) return NextResponse.json({ error: "Class not found." }, { status: 404 });

  const system =
    "You are an experienced school teacher who writes clear, accurate quiz questions. " +
    "Respond with ONLY valid JSON. No markdown, no commentary.";

  const userPrompt = `Create a quiz about: "${topic}".
${notes ? `Extra instructions from the teacher: ${notes}\n` : ""}
Requirements:
- Exactly ${mcqCount} multiple-choice questions (type "mcq") and exactly ${shortCount} short-answer questions (type "short").
- Difficulty: ${level === "mixed" ? "a mix of easy, medium and hard" : level}. Use difficulty 1 (easy), 2 (medium) or 3 (hard) on each question.
- Write all question text, options, model answers and rubrics in ${LANGUAGES[language]}.
- Keep JSON keys, "type" values and "topic" values in English.
- "topic" is a short subtopic label of 1-3 words in English (for example "Light Reaction").
- MCQ: exactly 4 distinct options. "correct_answer" must be copied exactly from one of the options. Spread the correct answer across positions.
- Short answer: "model_answer" is a concise ideal answer (1-3 sentences). "rubric" says what earns full marks and partial marks.
- Questions must be factually correct, unambiguous and suitable for school students.

Return JSON in exactly this shape:
{
  "title": "string",
  "questions": [
    {
      "type": "mcq",
      "topic": "string",
      "difficulty": 1,
      "prompt": "string",
      "options": ["string", "string", "string", "string"],
      "correct_answer": "string"
    },
    {
      "type": "short",
      "topic": "string",
      "difficulty": 2,
      "prompt": "string",
      "model_answer": "string",
      "rubric": "string"
    }
  ]
}`;

  // ---- 1. Call the AI ----
  let raw: unknown;
  try {
    raw = await generateJson(system, userPrompt);
  } catch (err) {
    console.error("[quiz generate] AI call failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: isDev
          ? `AI error: ${detail.slice(0, 400)}`
          : "The AI could not generate the quiz. Please try again.",
      },
      { status: 502 }
    );
  }

  // ---- 2. Validate the output ----
  const cleaned = cleanQuiz(raw, topic);
  const questions = [...cleaned.mcq.slice(0, mcqCount), ...cleaned.short.slice(0, shortCount)];
  const requested = mcqCount + shortCount;

  console.log(
    `[quiz generate] usable: ${cleaned.mcq.length} mcq, ${cleaned.short.length} short (requested ${mcqCount}/${shortCount})`
  );

  if (questions.length === 0 || questions.length < Math.ceil(requested / 2)) {
    console.error("[quiz generate] unusable output:", JSON.stringify(raw).slice(0, 800));
    return NextResponse.json(
      {
        error: isDev
          ? `The AI returned too few usable questions (${questions.length}/${requested}). Raw: ${JSON.stringify(raw).slice(0, 300)}`
          : "The AI returned too few usable questions. Please try again.",
      },
      { status: 502 }
    );
  }

  // ---- 3. Save to Supabase ----
  const { data: quiz, error: qzErr } = await supabase
    .from("quizzes")
    .insert({ class_id: classId, title: cleaned.title, topic })
    .select("id")
    .single();
  if (qzErr || !quiz) {
    console.error("[quiz generate] quiz insert failed:", qzErr);
    return NextResponse.json(
      { error: isDev ? `Could not save the quiz: ${qzErr?.message}` : "Could not save the quiz." },
      { status: 500 }
    );
  }

  const { error: qErr } = await supabase.from("questions").insert(
    questions.map((q) => ({
      quiz_id: quiz.id,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      correct_answer: q.correct_answer,
      model_answer: q.model_answer,
      rubric: q.rubric,
    }))
  );
  if (qErr) {
    console.error("[quiz generate] questions insert failed:", qErr);
    await supabase.from("quizzes").delete().eq("id", quiz.id);
    return NextResponse.json(
      { error: isDev ? `Could not save the questions: ${qErr.message}` : "Could not save the questions." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    quizId: quiz.id,
    count: questions.length,
    requested,
  });
}