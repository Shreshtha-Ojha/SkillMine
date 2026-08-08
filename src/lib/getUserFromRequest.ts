/**
 * Purpose
 * -------
 * The authoritative server-side identity resolver for all protected API routes.
 *
 * Responsibilities
 * - Extract a JWT from either the `Authorization: Bearer` header or the `token` cookie.
 * - Cryptographically verify the token signature using `TOKEN_SECRET`.
 * - Fetch and return the full User document from MongoDB.
 *
 * Used by
 * - Every API route that writes data on behalf of a user (interviews, ATS, roadmap
 *   progress, payments, profile updates, etc.).
 *
 * Interview Talking Points
 * - This is the real auth boundary — not middleware. Middleware only redirects page
 *   routes; this function enforces identity on every mutating API call.
 * - Supports Bearer header so mobile clients or Cypress tests can authenticate
 *   without relying on cookies.
 * - Returns `null` instead of throwing so callers decide the response shape (401 vs
 *   redirect). A null return always means "unauthenticated or invalid token."
 * - Never trust a user ID from the request body for writes — always derive it from
 *   the verified token here. (See git history: /api/interview/feedback previously
 *   accepted a client-supplied `user` field, which was a privilege escalation vector.)
 *
 * TODO: Cache the User DB lookup (e.g. 30s in-memory) keyed by token JTI to avoid
 * a MongoDB round-trip on every API call in high-traffic routes.
 */

import jwt from "jsonwebtoken";
import User from "@/models/userModel";

/**
 * Resolves the authenticated User from an incoming API request.
 *
 * Why this exists:
 * Every protected API route needs to know who is calling it, but the token
 * can arrive via two different channels (cookie for browser, Authorization
 * header for programmatic/test clients). Centralising this logic ensures
 * both channels are handled consistently and signature verification is never
 * skipped.
 *
 * Security considerations:
 * - Performs full JWT signature verification (not just decode) using TOKEN_SECRET.
 * - Returns null on any failure rather than throwing, so routes return 401
 *   without an unhandled exception leaking stack traces.
 * - Never accept a user ID from the request body — always use this function.
 *
 * @returns The full Mongoose User document if authenticated, or null.
 */
export default async function getUserFromRequest(req: Request) {
  try {
    // Try Authorization header first (Bearer token) then fall back to cookie
    const authHeader = req.headers?.get?.('authorization');
    let token: string | undefined;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }

    if (!token) {
      const cookieHeader = req.headers?.get?.('cookie') || '';
      const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
      token = match?.[1];
    }

    if (!token) {
      console.warn('getUserFromRequest: no auth token found in Authorization header or cookies');
      return null;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(decodeURIComponent(token), process.env.TOKEN_SECRET!) as { id: string };
    } catch (err: any) {
      console.warn('getUserFromRequest: token verification failed', String(err?.message || err));
      return null;
    }

    if (!decoded?.id) return null;
    const user = await User.findById(decoded.id);
    return user;
  } catch (err) {
    console.error('getUserFromRequest unexpected error', err);
    return null;
  }
}
