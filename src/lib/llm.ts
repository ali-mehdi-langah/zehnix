const DEFAULT_MODEL = "gemini-3.8-flash";
const TIMEOUT_MS = 55_000;

function parseJson(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const s = cleaned.indexOf("{");
    const e = cleaned.lastIndexOf("}");
    if (s >= 0 && e > s) return JSON.parse(cleaned.slice(s, e + 1));
    throw new Error("The AI returned an invalid response.");
  }
}

async function callGemini(
  apiKey: string,
  model: string,
  system: string,
  user: string,
  signal: AbortSignal
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const send = (withThinkingOff: boolean) =>
    fetch(url, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
          // keep reasoning short so replies come back fast
          ...(withThinkingOff ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      }),
    });

  let res = await send(true);

  // Some models reject the thinking setting: retry once without it
  if (res.status === 400) {
    const body = await res.text();
    if (/thinking/i.test(body)) {
      res = await send(false);
    } else {
      throw new Error(`Gemini HTTP 400: ${body}`);
    }
  }

  // Temporary overload / rate limit: wait a moment and retry once
  if (res.status === 503 || res.status === 429) {
    await new Promise((r) => setTimeout(r, 1500));
    res = await send(true);
  }

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const parts: { text?: string; thought?: boolean }[] =
    data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("");

  if (!text) {
    const reason =
      data?.candidates?.[0]?.finishReason ?? data?.promptFeedback?.blockReason ?? "unknown";
    throw new Error(
      `Gemini returned no text (reason: ${reason}). Raw: ${JSON.stringify(data).slice(0, 400)}`
    );
  }
  return text;
}

/** Ask Gemini for JSON and return it parsed (validate it yourself). */
export async function generateJson(system: string, user: string): Promise<unknown> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("LLM_API_KEY is not set in .env.local");

  const model = process.env.LLM_MODEL || DEFAULT_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const text = await callGemini(apiKey, model, system, user, controller.signal);
    return parseJson(text);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "The AI took too long to respond (over 55 seconds). Try fewer questions or a faster model."
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}