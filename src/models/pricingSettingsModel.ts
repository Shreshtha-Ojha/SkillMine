/**
 * Purpose
 * -------
 * Singleton pricing configuration document — allows admins to update the
 * platform's premium subscription price without a code deployment.
 *
 * Business Rules
 * - Only one document may exist (key = "pricing"). The `pre("save")` hook
 *   enforces this at the DB layer by rejecting a second document with the
 *   same key but a different `_id`. This is intentional: having two pricing
 *   documents would create ambiguity in payment validation.
 * - `premium` has a minimum of 9 because that is Instamojo's minimum
 *   transaction amount. Setting a price below this would cause payment
 *   creation to fail at the gateway level.
 * - `updatedBy` records the admin's user ID for audit purposes.
 *
 * Relationships
 * - Read by `src/helpers/getPricing.ts`, which is called by payment routes
 *   to validate the requested amount against the authoritative server-side price.
 *
 * TODO: Add an audit log collection to track price change history over time,
 * rather than only storing the current value and the last editor.
 */

import mongoose from "mongoose";

export interface IPricingSettings {
  _id?: string;
  key: string;
  premium: number;
  updatedAt: Date;
  updatedBy?: string;
}

const pricingSettingsSchema = new mongoose.Schema<IPricingSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "pricing",
    },
    premium: {
      type: Number,
      required: false,
      // do not hardcode a default; admin should set this explicitly
      min: 9, // Instamojo minimum (validation when set)
    },
    updatedBy: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensure only one pricing document exists
pricingSettingsSchema.pre("save", async function (next) {
  const PricingSettings = mongoose.models.PricingSettings || mongoose.model("PricingSettings", pricingSettingsSchema);
  const existingDoc = await PricingSettings.findOne({ key: "pricing" });
  if (existingDoc && existingDoc._id.toString() !== this._id?.toString()) {
    throw new Error("Only one pricing settings document can exist");
  }
  next();
});

const PricingSettings =
  mongoose.models.PricingSettings ||
  mongoose.model<IPricingSettings>("PricingSettings", pricingSettingsSchema);

export default PricingSettings; 
