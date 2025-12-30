import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});

export async function generateContent(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-09-2025",
      contents: prompt,
    });

    return response.text || "";
  } catch (error: any) {
    console.error("[Gemini] API error:", error.message);
    throw error;
  }
}

export async function generateContentWithConfig(
  prompt: string,
  config?: {
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<string> {
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 25000);
  const maxRetries = Number(process.env.GEMINI_RETRIES ?? 2);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Re-initialize client fresh each try to avoid stale state
      const freshAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

      const requestPromise = freshAi.models.generateContent({
        model: "gemini-2.5-flash-preview-09-2025",
        contents: prompt,
        config: {
          temperature: config?.temperature ?? 0.7,
          maxOutputTokens: config?.maxOutputTokens ?? 4000,
        },
      });

      // Race the request against a timeout
      const response = await Promise.race([
        requestPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('LLM request timed out')), timeoutMs)),
      ] as any);

      // Try to get text from response.text first
      let text = response.text;

      // If text is empty, try extracting from candidates
      if (!text && response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          text = candidate.content.parts.map((p: any) => p.text || "").join("");
        }
      }

      // Strip markdown code blocks if present
      if (text) {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          text = jsonMatch[1].trim();
        }
      }

      return text || "";
    } catch (error: any) {
      const full = (String(error?.message || '') + ' ' + (JSON.stringify(error) || '')).toLowerCase();

      // Determine if this is a transient overload / 503 / unavailable condition
      const isTimeout = full.includes('timed out') || String(error?.name || '').toLowerCase().includes('abort');
      const isOverloaded = full.includes('overload') || full.includes('model is overloaded') || full.includes('model overloaded') || full.includes('unavailable') || error?.status === 429 || error?.status === 503 || (error?.error && (error.error.code === 503 || String(error.error.status).toUpperCase() === 'UNAVAILABLE'));

      // If it's a transient overloaded condition and we have retries left, backoff and retry
      if ((isOverloaded || isTimeout) && attempt < maxRetries) {
        const backoff = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      // Rethrow so the caller can handle
      console.error('[Gemini] API error:', error?.message);
      throw error;
    }
  }

  throw new Error('Gemini: retries exhausted');
}

export { ai };
