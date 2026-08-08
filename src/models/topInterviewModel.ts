/**
 * Purpose
 * -------
 * Defines a Top Interview — an admin-created, timed, competitive mock interview
 * session where users compete for leaderboard placement and certificates.
 *
 * Relationships
 * - `createdBy` and `endedBy` reference the User collection (ObjectId).
 * - `winners[].userId` references User — populated when certificates are issued
 *   to the top 3 finishers after the admin ends the interview.
 * - Paired with `TopInterviewAttempt` (see topInterviewAttemptModel.ts) which
 *   stores each user's actual answers and score.
 *
 * Business Rules
 * - Only one attempt is allowed by default. `allowRetryForAll` overrides this
 *   globally; `retryAllowedUsers` grants it selectively per user.
 * - `isEnded` + `endedAt` mark the interview as closed. Once ended, the route
 *   prevents new attempts and triggers certificate generation for winners.
 * - `questions` is an array of question strings — the same set is served to
 *   every participant to ensure a fair, comparable competition.
 * - `certificatesIssued` is a one-way flag set after winners are determined,
 *   preventing duplicate certificate generation on re-submission.
 *
 * TODO: Add a `startsAt` field so interviews can be scheduled in advance,
 * and enforce the window server-side rather than relying on the admin to
 * manually open and close interviews.
 */

import mongoose from "mongoose";

const TopInterviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  field: { type: String, required: true },
  topics: { type: String, required: true },
  level: { type: String, required: true },
  skills: { type: String, required: true },
  questions: { type: [String], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  createdAt: { type: Date, default: Date.now },
  // Interview status
  isEnded: { type: Boolean, default: false },
  endedAt: { type: Date },
  endedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  // Certificate issued to top 3
  certificatesIssued: { type: Boolean, default: false },
  winners: [{
    rank: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    score: { type: Number },
    certificateId: { type: String },
    issuedAt: { type: Date }
  }],
  // Retry control - by default only 1 attempt allowed
  allowRetryForAll: { type: Boolean, default: false }, // If true, everyone can retry
  retryAllowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }] // Specific users allowed to retry
});

const TopInterview = mongoose.models.TopInterview || mongoose.model("TopInterview", TopInterviewSchema);

export default TopInterview;
