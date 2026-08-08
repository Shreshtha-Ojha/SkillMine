/**
 * Purpose
 * -------
 * Fetches the current live pricing configuration from the database.
 *
 * Responsibilities
 * - Connect to MongoDB and read the single `PricingSettings` document.
 * - Return a typed `Pricing` object, or `{ premium: null }` on any failure,
 *   so callers can fall back to a static default without crashing.
 *
 * Used by
 * - Payment creation routes — to validate that the user-submitted amount
 *   matches the current server-side price before creating an Instamojo request.
 * - Admin pricing pages — to display the currently active price.
 *
 * Interview Talking Points
 * - Pricing is stored in the DB (not hard-coded) so admins can change it without
 *   a deployment. The `PricingSettings` model enforces a singleton via a
 *   pre-save hook to prevent conflicting price documents.
 * - This function is intentionally simple and never throws — payment routes
 *   must not crash on a missing price; they should surface a clear user error.
 */

import { connect } from "@/dbConfig/dbConfig";
import PricingSettings from "@/models/pricingSettingsModel";

export interface Pricing {
  premium?: number | null;
}

export async function getPricing(): Promise<Pricing> {
  try {
    await connect();
    
    const pricing = await PricingSettings.findOne({ key: "pricing" }).lean() as { premium?: number | null } | null;
    if (!pricing) return { premium: null };

    return {
      premium: pricing.premium ?? null,
    };
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return { premium: null };
  }
} 
