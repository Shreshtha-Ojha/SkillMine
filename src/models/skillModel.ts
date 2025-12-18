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
