import { connect } from "@/dbConfig/dbConfig";
import PricingSettings from "@/models/pricingSettingsModel";

export interface Pricing {
  premium?: number | null;
}

export async function getPricing(): Promise<Pricing> {
  try {
    await connect();
    
    const pricing = await PricingSettings.findOne({ key: "pricing" }).lean();
    if (!pricing) return { premium: null };

    return {
      premium: pricing.premium ?? null,
    };
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return { premium: null };
  }
} 
