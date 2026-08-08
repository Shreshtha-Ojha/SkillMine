/**
 * Purpose
 * -------
 * Pure pricing computation utilities used wherever a "crossed-out original
 * price" and discount percentage need to be derived from a live price.
 *
 * Responsibilities
 * - Compute a synthetic "original" price for display purposes (live price + bump).
 * - Compute the discount percentage to show alongside the live price.
 *
 * Used by
 * - Premium subscription UI components and payment pages.
 * - Admin pricing debug route to verify display math.
 *
 * Interview Talking Points
 * - These are pure functions with no side effects, making them straightforward
 *   to unit-test — see `src/lib/priceUtils.test.ts`.
 * - Both functions return `null` on invalid/missing input rather than defaulting
 *   to 0 or NaN. This lets the caller decide whether to show the original price
 *   at all, rather than showing a confusing "₹0 crossed out."
 */

export function computeOriginalPrice(price: number | null | undefined, bump = 100) {
  if (price === null || price === undefined) return null;
  // Only compute if price > 0; otherwise return null so callers can fall back to static original
  if (price <= 0) return null;
  return price + bump;
}

export function computeDiscountPercent(price: number | null | undefined, original: number | null | undefined) {
  if (price === null || price === undefined) return null;
  if (original === null || original === undefined) return null;
  if (original === 0) return null;
  return Math.round((1 - price / original) * 100);
}
