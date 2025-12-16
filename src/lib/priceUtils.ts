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
