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
