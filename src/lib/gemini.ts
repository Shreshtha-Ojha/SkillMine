import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client - use apiKey from env or let SDK pick it up automatically
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});

console.log("[Gemini] Initialized with API key:", apiKey ? `${apiKey.substring(0, 10)}...` : "auto-detect");

export async function generateContent(prompt: string): Promise<string> {
  try {
    console.log("[Gemini] generateContent called, prompt length:", prompt.length);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-09-2025",
      contents: prompt,
    });
    
    console.log("[Gemini] Response received, text length:", response.text?.length || 0);
    return response.text || "";
  } catch (error: any) {
    console.error("[Gemini] API error:", error.message || error);
    console.error("[Gemini] Full error:", JSON.stringify(error, null, 2));
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
  console.log("[Gemini] generateContentWithConfig called");
  console.log("[Gemini] Prompt length:", prompt.length);
  console.log("[Gemini] Config:", config);

  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 25000);
  const maxRetries = Number(process.env.GEMINI_RETRIES ?? 2); // number of retry attempts after the first

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Gemini] attempt ${attempt + 1}/${maxRetries + 1}`);
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

      // Race the request against a timeout to avoid long-running requests causing gateway timeouts
      const response = await Promise.race([
        requestPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('LLM request timed out')), timeoutMs)),
      ] as any);

      console.log("[Gemini] Response received");
      console.log("[Gemini] Response.text:", response.text ? `${response.text.length} chars` : "UNDEFINED");

      // Try to get text from response.text first
      let text = response.text;

      // If text is empty, try extracting from candidates
      if (!text && response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        console.log("[Gemini] Trying to extract from candidate...");
        console.log("[Gemini] Finish reason:", candidate.finishReason);

        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          text = candidate.content.parts.map((p: any) => p.text || "").join("");
          console.log("[Gemini] Extracted from parts:", text ? `${text.length} chars` : "EMPTY");
        }
      }

      // Strip markdown code blocks if present
      if (text) {
        // Remove ```json ... ``` wrapper
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          console.log("[Gemini] Stripped markdown code block wrapper");
          text = jsonMatch[1].trim();
        }
      }

      console.log("[Gemini] Final text length:", text?.length || 0);
      console.log("[Gemini] Final text preview:", text?.substring(0, 200));

      return text || "";
    } catch (error: any) {
      console.error(`[Gemini] attempt ${attempt + 1} error:`, error?.message || error);
      const full = (String(error?.message || '') + ' ' + (JSON.stringify(error) || '')).toLowerCase();

      // Determine if this is a transient overload / 503 / unavailable condition
      const isTimeout = full.includes('timed out') || String(error?.name || '').toLowerCase().includes('abort');
      const isOverloaded = full.includes('overload') || full.includes('model is overloaded') || full.includes('model overloaded') || full.includes('unavailable') || error?.status === 429 || error?.status === 503 || (error?.error && (error.error.code === 503 || String(error.error.status).toUpperCase() === 'UNAVAILABLE'));

      // If it's a transient overloaded condition and we have retries left, backoff and retry
      if ((isOverloaded || isTimeout) && attempt < maxRetries) {
        const backoff = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
        console.warn(`[Gemini] transient error detected (overloaded or timeout). Retrying after ${backoff}ms`);
        await new Promise((r) => setTimeout(r, backoff));
        continue; // next attempt
      }

      // Otherwise, rethrow so the caller can handle (route currently maps 503 to friendly message)
      console.error('[Gemini] non-retriable error or retries exhausted:', error);
      throw error;
    }
  }

  throw new Error('Gemini: retries exhausted');
}

export { ai };
