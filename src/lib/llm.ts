const BASE_URL = (process.env.LLM_BASE_URL ?? "https://api.groq.com/openai/v1").replace(/\/$/, "");
const MODEL = process.env.LLM_MODEL ?? "llama-3.3-70b-versatile";
const TOTAL_TIMEOUT_MS = 55_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error(`Model did not return valid JSON: ${cleaned.slice(0, 200)}`);
  }
}

export async function generateJson(system: string, user: string): Promise<unknown> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("LLM_API_KEY is not set in .env.local");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TOTAL_TIMEOUT_MS);

  let useJsonMode = true;
  let lastError = "Unknown error";

  try {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.4,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          ...(useJsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text: string = data?.choices?.[0]?.message?.content ?? "";
        if (!text) throw new Error("The model returned an empty response.");
        return parseJson(text);
      }

      const body = (await res.text()).slice(0, 400);
      lastError = `HTTP ${res.status}: ${body}`;
      console.error(`[llm] attempt ${attempt} failed: ${lastError}`);

      // Some models reject JSON mode; retry once without it.
      if (res.status === 400 && useJsonMode) {
        useJsonMode = false;
        continue;
      }

      // Busy or rate limited: wait briefly and retry.
      if (res.status === 429 || res.status === 503) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const wait =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(retryAfter * 1000, 6000)
            : 2000 * attempt;
        await sleep(wait);
        continue;
      }

      break; // 401, 404 and so on will not fix themselves
    }

    throw new Error(lastError);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("The AI request timed out.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}