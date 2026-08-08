/**
 * Purpose
 * -------
 * Stores a user's structured resume data used by the resume builder feature.
 * Distinct from the raw PDF resume used in ATS checking — this is the platform's
 * own structured representation that drives PDF generation.
 *
 * Relationships
 * - `user` is an ObjectId ref to the User collection. One user has at most one
 *   resume document (the route uses upsert semantics on the user's ID).
 *
 * Business Rules
 * - All sub-schemas use `{ _id: false }` to avoid generating unnecessary ObjectIds
 *   for embedded sub-documents that are never queried individually.
 * - `templateStyle` controls which PDF template is rendered client-side. Adding a
 *   new template requires updating this enum and the builder component.
 * - The `pre('save')` hook auto-updates `lastUpdated` so the builder can display
 *   "last edited" without the caller explicitly setting the field.
 * - `project.description` is `string[]` (bullet points) rather than a single
 *   string so the PDF template can render each point as a separate line.
 *
 * TODO: Add a version field and store snapshots of previous resume states so
 * users can revert to an earlier version — especially important before the ATS
 * checker rewrites their content.
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IEducation {
  institution: string;
  degree: string;
  field?: string;
  score: string;
  scoreType: 'CPI' | 'CGPA' | 'Percentage';
  startYear: string;
  endYear: string;
  current?: boolean;
}

export interface IProject {
  title: string;
  description: string[];
  liveLink?: string;
  codeLink?: string;
  demoLink?: string;
  startDate: string;
  endDate: string;
}

export interface IExperience {
  title: string;
  organization: string;
  description: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  links?: { label: string; url: string }[];
}

export interface IAchievement {
  year: string;
  title: string;
  description: string;
  certificateLink?: string;
}

export interface ICodingProfile {
  platform: string;
  username: string;
  link: string;
  rating?: string;
}

export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  
  // Sections
  education: IEducation[];
  projects: IProject[];
  skills: {
    programmingLanguages: string[];
    technologies: string[];
    developerTools: string[];
    concepts: string[];
  };
  experience: IExperience[];
  achievements: IAchievement[];
  codingProfiles: ICodingProfile[];
  
  // Meta
  templateStyle: 'classic' | 'modern' | 'minimal';
  lastUpdated: Date;
  createdAt: Date;
}

const educationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String },
  score: { type: String, required: true },
  scoreType: { type: String, enum: ['CPI', 'CGPA', 'Percentage'], default: 'Percentage' },
  startYear: { type: String, required: true },
  endYear: { type: String, required: true },
  current: { type: Boolean, default: false }
}, { _id: false });

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: [{ type: String }],
  liveLink: { type: String },
  codeLink: { type: String },
  demoLink: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true }
}, { _id: false });

const experienceSchema = new Schema({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  current: { type: Boolean, default: false },
  links: [{
    label: { type: String },
    url: { type: String }
  }]
}, { _id: false });

const achievementSchema = new Schema({
  year: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  certificateLink: { type: String }
}, { _id: false });

const codingProfileSchema = new Schema({
  platform: { type: String, required: true },
  username: { type: String, required: true },
  link: { type: String, required: true },
  rating: { type: String }
}, { _id: false });

const resumeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Personal Info
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  github: { type: String },
  linkedin: { type: String },
  portfolio: { type: String },
  
  // Sections
  education: [educationSchema],
  projects: [projectSchema],
  skills: {
    programmingLanguages: [{ type: String }],
    technologies: [{ type: String }],
    developerTools: [{ type: String }],
    concepts: [{ type: String }]
  },
  experience: [experienceSchema],
  achievements: [achievementSchema],
  codingProfiles: [codingProfileSchema],
  
  // Meta
  templateStyle: { type: String, enum: ['classic', 'modern', 'minimal'], default: 'classic' },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Update lastUpdated on save
resumeSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Resume = mongoose.models.Resume || mongoose.model<IResume>('Resume', resumeSchema);

export default Resume;
