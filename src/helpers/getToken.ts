/**
 * Purpose
 * -------
 * Extracts and verifies the user ID from the `token` cookie in a NextRequest.
 *
 * Responsibilities
 * - Read the `token` cookie from the incoming request.
 * - Verify the JWT signature and return the user's MongoDB ObjectId string.
 * - Return `null` on any failure (missing token, expired, invalid signature)
 *   rather than throwing, so callers can respond with 401 without wrapping in try/catch.
 *
 * Used by
 * - Older API routes that only need the user ID (not the full User document).
 *   Newer routes prefer `getUserFromRequest` which returns the full User object
 *   and also accepts Bearer tokens.
 *
 * Interview Talking Points
 * - This helper is cookie-only. `getUserFromRequest` supersedes it by also
 *   supporting the `Authorization` header — prefer that for new routes.
 *
 * TODO: Consolidate with `getUserFromRequest` to eliminate the two-helper pattern.
 * Having two auth helpers that do similar things increases the risk that a new
 * route picks the weaker one.
 */

import {NextRequest} from 'next/server'
import jwt from "jsonwebtoken";

// Returns user id string if token valid, otherwise null (no throw)
export const getDataFromToken = (request:NextRequest): string | null => {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return null;
        }
        const decodedToken:any = jwt.verify(token,process.env.TOKEN_SECRET!);
        return decodedToken.id;
    } catch (error:any) {
        // Log token errors for debugging but don't throw to avoid 500s
        console.warn("Token validation failed:", error?.message || error);
        return null;
    }
}