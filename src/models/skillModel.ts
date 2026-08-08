/**
 * Purpose
 * -------
 * Two tightly coupled models for the Skill Test feature:
 * - `Skill` — an admin-managed MCQ question bank for a specific technical topic.
 * - `SkillAttempt` — a user's submitted attempt against a custom skill test.
 *
 * Relationships
 * - `Skill` is standalone; tests are composed by selecting one or more `Skill`
 *   documents at test-creation time.
 * - `SkillAttempt.userId` is a string (not an ObjectId ref) to allow lightweight
 *   lookups without a populate. History pages query by userId directly.
 * - `SkillAttempt.mcqSnapshot` stores a copy of the questions served at attempt
 *   time so the result view is stable even if the question bank is later edited.
 *
 * Business Rules
 * - `correctAnswer` stores the index (0–3) of the correct option, not the text,
 *   so option wording can change without invalidating existing attempt records.
 * - `oneTimeVisit` flag locks the test to a single-tab session — once the test
 *   page is loaded, navigating away is treated as a submission.
 * - The `delete mongoose.models.Skill` and `delete mongoose.models.SkillAttempt`
 *   guards prevent OverwriteModelError during Next.js hot-reload.
 *
 * TODO: Add a compound index on `{ userId, submittedAt }` in SkillAttempt to
 * speed up the history page query as attempt volume grows.
 */

import mongoose, { Schema } from "mongoose";

const mcqQuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  marks: { type: Number, default: 1 },
  explanation: { type: String }, // optional explanation for admins to provide
});

const skillSchema = new Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  mcqQuestions: [mcqQuestionSchema],
}, { timestamps: true });

const skillAttemptSchema = new Schema({
  userId: { type: String }, // optional for anonymous? but we'll record if available
  testName: { type: String },
  skills: [{ skillId: String, skillTitle: String }],
  mcqSnapshot: [{ type: Schema.Types.Mixed }],
  mcqAnswers: [{ type: Number }],
  mcqScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  timeLimitMinutes: { type: Number, default: 60 },
  perQuestionTimerEnabled: { type: Boolean, default: false },
  perQuestionTimeMinutes: { type: Number, default: 0 },
  oneTimeVisit: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
}, { timestamps: true });

if (mongoose.models.Skill) delete mongoose.models.Skill;
if (mongoose.models.SkillAttempt) delete mongoose.models.SkillAttempt;

export const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);
export const SkillAttempt = mongoose.models.SkillAttempt || mongoose.model('SkillAttempt', skillAttemptSchema);

export default Skill;
