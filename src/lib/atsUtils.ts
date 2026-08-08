/**
 * Purpose
 * -------
 * Lightweight, client-safe ATS utility functions shared between server and browser.
 *
 * Responsibilities
 * - Provide a quick grammar score heuristic based on sentence length variance.
 * - Provide a quick keyword-match score between a resume and a job description.
 *
 * Used by
 * - Client-side preview components that show a live score as the user types,
 *   without making an API call.
 * - Unit tests (`src/lib/atsUtils.test.ts`) — these are the functions covered
 *   by the Vitest suite because they have no DB or network dependencies.
 *
 * Interview Talking Points
 * - These are intentionally separated from `src/lib/server/atsScorer.ts` because
 *   they contain no Node.js-specific code and can run in the browser bundle.
 *   The server scorer imports them internally for the grammar sub-score.
 * - The grammar heuristic penalises very long average sentence length (>20 words)
 *   and repeated punctuation. It is a proxy, not a real grammar parser — good
 *   enough for ATS screening feedback without an expensive NLP call.
 */

export function simpleGrammarScore(text: string) {
  if (!text) return 0;
  const sentences = text.split(/\.|\n|\?|!/).map(s => s.trim()).filter(Boolean);
  const avgLen = sentences.length ? Math.round(text.split(/\s+/).length / sentences.length) : 0;
  const penalty = Math.min(30, Math.max(0, (avgLen - 20) * 2));
  const issues = (text.match(/\.{2,}|,,+|!!+/g) || []).length * 2;
  const score = Math.max(0, 100 - penalty - issues);
  return score;
}

export function simpleATSScore(resume: string, jd: string) {
  if (!resume) return 0;
  const jdWords = (jd || '').toLowerCase().split(/\W+/).filter(Boolean);
  const resumeWords = resume.toLowerCase();
  const matches = jdWords.filter(w => resumeWords.includes(w)).length;
  const pct = jdWords.length ? Math.round((matches / jdWords.length) * 100) : 30;
  const lengthScore = Math.min(100, Math.max(20, Math.round(Math.min(1, resume.split(/\s+/).length / 300) * 100)));
  return Math.round((pct * 0.7) + (lengthScore * 0.3));
}

// PDF extraction is server-only; see `src/lib/server/pdfExtract.ts` for implementation.
