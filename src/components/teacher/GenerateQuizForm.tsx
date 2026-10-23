"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LANGS = [
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu" },
  { value: "sd", label: "Sindhi" },
  { value: "ps", label: "Pashto" },
];

const field =
  "mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[#15254B] placeholder:text-[#15254B]/30 focus:outline-none focus:ring-2 focus:ring-[#5D91F5]/40 focus:border-[#5D91F5]";

export default function GenerateQuizForm({ classId }: { classId: string }) {
  const [topic, setTopic] = useState("");
  const [mcqCount, setMcqCount] = useState(4);
  const [shortCount, setShortCount] = useState(1);
  const [language, setLanguage] = useState("en");
  const [difficulty, setDifficulty] = useState("mixed");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (topic.trim().length < 3) {
      setError("Enter a topic of at least 3 characters.");
      return;
    }
    if (mcqCount + shortCount < 1) {
      setError("Ask for at least one question.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, topic, mcqCount, shortCount, language, difficulty, notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      router.push(`/teacher/class/${classId}/quizzes/${data.quizId}`);
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-base font-bold text-[#15254B]">Generate a quiz</h2>
      <p className="mt-1 text-sm text-[#15254B]/50">Describe the topic and the AI writes the questions.</p>

      <label htmlFor="topic" className="mt-5 block text-sm font-medium text-[#15254B]">
        Topic
      </label>
      <input
        id="topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        maxLength={100}
        placeholder="Photosynthesis in plants"
        className={field}
      />

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="mcq" className="block text-sm font-medium text-[#15254B]">
            Multiple-choice (0–10)
          </label>
          <input
            id="mcq"
            type="number"
            min={0}
            max={10}
            value={mcqCount}
            onChange={(e) => setMcqCount(Math.min(10, Math.max(0, Number(e.target.value) || 0)))}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="short" className="block text-sm font-medium text-[#15254B]">
            Short answer (0–6)
          </label>
          <input
            id="short"
            type="number"
            min={0}
            max={6}
            value={shortCount}
            onChange={(e) => setShortCount(Math.min(6, Math.max(0, Number(e.target.value) || 0)))}
            className={field}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="lang" className="block text-sm font-medium text-[#15254B]">
            Language
          </label>
          <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)} className={field}>
            {LANGS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="diff" className="block text-sm font-medium text-[#15254B]">
            Difficulty
          </label>
          <select id="diff" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={field}>
            <option value="mixed">Mixed</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <label htmlFor="notes" className="mt-4 block text-sm font-medium text-[#15254B]">
        Extra instructions <span className="text-[#15254B]/40 font-normal">(optional)</span>
      </label>
      <textarea
        id="notes"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={500}
        placeholder="Grade 8 level, focus on the light reaction"
        className={field}
      />

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full sm:w-auto rounded-full bg-[#5D91F5] hover:bg-[#4a7fe6] disabled:opacity-60 transition-colors text-white text-sm font-semibold px-6 py-2.5"
      >
        {loading ? "Generating… this takes up to 30 seconds" : "Generate quiz"}
      </button>
    </form>
  );
}