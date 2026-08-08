/**
 * Purpose
 * -------
 * Defines the structure of a learning roadmap — the core content unit of the
 * SkillMine learning path system.
 *
 * Relationships
 * - Referenced by User.completedRoadmaps[].roadmapId (string, not ObjectId) to
 *   track per-user progress without a join.
 * - Referenced by RoadmapTest.roadmapId — each roadmap can have one associated
 *   certification test.
 * - Seed scripts in `scripts/seed-*-roadmap.mjs` create and upsert documents
 *   of this schema; roadmaps are not created through the admin UI.
 *
 * Business Rules
 * - `createdBy` stores the admin's user ID as a string (not a ref) because
 *   roadmaps are intended to be long-lived and should not be tied to an admin
 *   account that may be deleted.
 * - Each Phase contains Tasks (learning resources) and Assignments (practice
 *   problems). Both are arrays of `{ title, link }` objects kept simple on
 *   purpose — all external resources are just links.
 * - The `delete mongoose.models.Roadmap` guard prevents OverwriteModelError
 *   during Next.js hot-reload in development.
 */

import mongoose, { Schema } from 'mongoose';

const assignmentSchema = new Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
});

const taskSchema = new Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
});

const phaseSchema = new Schema({
  title: { type: String, required: true },
  tasks: [taskSchema],
  assignments: [assignmentSchema],
});

const roadmapSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    createdBy: { type: String, required: true },//admin user id
    phases: [phaseSchema],
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Roadmap) {
  delete mongoose.models.Roadmap;
}

const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', roadmapSchema);

export default Roadmap;
