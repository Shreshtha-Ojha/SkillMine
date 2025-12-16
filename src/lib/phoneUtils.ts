// Return a sanitized 10-digit Indian phone number string, or null if invalid
export function sanitizeIndianPhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = String(phone).replace(/[^0-9\+]/g, "");

  // Remove leading + if present
  let cleaned = digits.replace(/^\+/, "");

  // If starts with international prefix 91, strip it
  if (cleaned.startsWith("91") && cleaned.length > 10) {
    cleaned = cleaned.slice(cleaned.length - 10);
  }

  // If starts with 0 and length 11, drop leading 0
  if (cleaned.length === 11 && cleaned.startsWith("0")) cleaned = cleaned.slice(1);

  if (cleaned.length === 10 && /^[6-9][0-9]{9}$/.test(cleaned)) return cleaned;

  // Not a valid Indian mobile number
  return null;
}
