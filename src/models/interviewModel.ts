/**
 * Purpose
 * -------
 * Stores the full result of a completed AI mock interview session.
 *
 * Relationships
 * - `user` is a soft reference to the User collection (not required). Anonymous
 *   or unauthenticated sessions are not persisted — the route enforces auth
 *   before calling `InterviewResult.create`.
 *
 * Business Rules
 * - A single document captures the entire interview: all questions, all answers,
 *   the Gemini-generated feedback string, and the aggregate score.
 * - `score` is an integer in [0, 10], clamped by the feedback route before save.
 *   The clamping happens server-side because LLM output cannot be trusted to
 *   stay within a stated range.
 * - Documents are append-only — there is no update path. The user's history is
 *   shown by querying all documents where `user` matches.
 *
 * Interview Talking Points
 * - Storing the full question/answer snapshot (not just the score) allows the
 *   detailed feedback view to reconstruct the entire session without re-calling Gemini.
 */

import mongoose from "mongoose";

const InterviewResultSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  questions: { type: [String], required: true }, // Array of all questions
  answers: { type: [String], required: true },   // Array of all answers
  feedback: { type: String, required: true },    // Overall feedback
  score: { type: Number, required: true },       // Overall score
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  createdAt: { type: Date, default: Date.now }
});

const InterviewResult = mongoose.models.InterviewResult || mongoose.model("InterviewResult", InterviewResultSchema);

export default InterviewResult;
