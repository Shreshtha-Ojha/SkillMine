/**
 * Purpose
 * -------
 * Centralized Gemini AI client — the single integration point for all LLM calls.
 *
 * Responsibilities
 * - Expose two call surfaces: a simple fire-and-forget variant and a production-grade
 *   variant with timeout, retry, and response normalization.
 * - Strip markdown code fences from responses so callers always receive plain text
 *   or raw JSON strings, never fenced output.
 *
 * Used by
 * - /api/interview/ask — generates interview questions.
 * - /api/interview/feedback — scores and critiques user answers.
 * - /api/ai/gemini-ats and /api/ats/process — resume analysis.
 * - /api/roadmap-test — generates MCQ questions for certification tests.
 * - /api/top-interviews/generate-questions — creates structured interview sets.
 *
 * Interview Talking Points
 * - `generateContent` is intentionally simple (no retry, no timeout). It is only
 *   used in routes where the caller already has its own error handling and where
 *   simplicity matters more than resilience (e.g. debug/test routes).
 * - `generateContentWithConfig` is the production path. The timeout race prevents
 *   serverless functions from hanging past Vercel's function timeout limit.
 * - A fresh client is instantiated on each retry attempt because a stale SDK client
 *   can carry an aborted internal state that causes subsequent calls to fail silently.
 * - Exponential backoff with jitter (`500 * 2^attempt + random(0-200)ms`) avoids
 *   thundering-herd against the Gemini quota limit on 429s and 503s.
 * - LLM output is always untrusted input. Callers must validate/clamp before
 *   persisting. See `src/lib/llmParse.ts` for structured JSON parsing.
 *
 * TODO: Centralise model ID in an env var (e.g. GEMINI_MODEL) so it can be updated
 * across all call sites without touching source code.
 */

import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});

/**
 * Simple Gemini call with no retry or timeout.
 *
 * Why this exists:
 * Some routes (debug endpoints, simple one-off generations) do not need the
 * overhead of retry logic. Keeping a simple variant avoids forcing all callers
 * to configure retry parameters they don't need.
 *
 * Use `generateContentWithConfig` for any production-facing route.
 */
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

/**
 * Production Gemini call with timeout, retry, and response normalisation.
 *
 * Why this exists:
 * Gemini returns 429 (quota) and 503 (overloaded) transiently under load.
 * Without retry logic, these surface as user-visible errors. The timeout
 * prevents serverless functions from hanging past Vercel's execution limit
 * when Gemini is slow.
 *
 * Security / reliability considerations:
 * - A fresh client is created on each retry because the SDK client can carry
 *   stale abort state from a previous failed attempt.
 * - Exponential backoff with jitter prevents thundering-herd retries.
 * - Markdown code fences are stripped so callers always receive raw text/JSON,
 *   not fenced output that would break JSON.parse downstream.
 *
 * @param config.temperature  Sampling temperature (default 0.7).
 * @param config.maxOutputTokens  Token cap (default 4000).
 * @returns Raw text from Gemini with code fences removed.
 */
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
