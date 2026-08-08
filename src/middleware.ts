/**
 * Purpose
 * -------
 * Next.js Edge Middleware — fast, pre-render route protection for page routes.
 *
 * Responsibilities
 * - Block unauthenticated users from protected pages (/interview, /profile, etc.)
 * - Block non-admin users from /admin/* routes.
 * - Redirect authenticated users away from auth pages (/auth/login, /auth/signup).
 *
 * Used by
 * - Next.js runtime automatically — runs on every request matched by `config.matcher`.
 *
 * Interview Talking Points
 * - This middleware decodes the JWT payload (base64) but does NOT cryptographically
 *   verify the signature. That is intentional: Edge runtime lacks the Node.js crypto
 *   primitives that `jsonwebtoken` needs. The real security boundary is `getUserFromRequest`
 *   inside each API route, which performs full signature verification.
 * - API routes are excluded entirely. A crafted request can bypass a middleware redirect
 *   but cannot forge a valid signature, so the API layer is the authoritative gate.
 * - The `ADMINS` env var is the source of truth for admin status — checking it here and
 *   inside authOptions/login keeps the admin list in one place without a DB round-trip.
 *
 * TODO: Migrate admin check to Web Crypto API signature verification so a tampered
 * `isAdmin: true` claim in an unsigned or weakly-signed token cannot slip through.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')) {
    return NextResponse.next();
  }

  // Admin routes that require admin privileges
  const isAdminRoute = path.startsWith('/admin');

  // Interview-related routes that require authentication
  const isProtectedRoute = path.startsWith('/interview') || 
                          path.startsWith('/top-interviews') || 
                          path.includes('interview-history') ||
                          path.startsWith('/prepare-interviews') ||
                          path.startsWith('/placement-data') ||
                          path.startsWith('/profile') ||
                          path.startsWith('/roadmap-test') ||
                          path.startsWith('/sample-test');
  // Public paths that should redirect to home if logged in
  const isPublicPath = path === '/auth/login' || path === '/auth/signup';
  
  // Login-required page should redirect logged-in users to home
  const isLoginRequired = path === '/auth/login-required';

  // Get token from cookies
  const token = request.cookies.get("token")?.value;
  
  // Simple token presence check - must be at least 20 chars (valid JWT or token)
  const hasToken = Boolean(token && token.length > 20);

  // Try to decode token to check admin status
  let isAdmin = false;
  let userEmail = "";
  if (token && token.length > 20) {
    try {
      // Check if it's a JWT token (has 3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length === 3) {
        // It's a JWT - decode the payload
        const payload = JSON.parse(atob(parts[1]));
        userEmail = payload.email?.trim().toLowerCase() || "";
        
        // Check both: token's isAdmin flag AND if email is in ADMINS env var
        const adminEmails = process.env.ADMINS ? process.env.ADMINS.split(",").map(e => e.trim().toLowerCase()) : [];
        isAdmin = payload.isAdmin === true || adminEmails.includes(userEmail);
      } else {
        // Not a JWT, but token exists - allow it (NextAuth or other session token)
        isAdmin = false; // Default to non-admin for non-JWT tokens
      }
    } catch {
      isAdmin = false;
    }
  }

  // Redirect logged-in users away from auth pages
  if ((isPublicPath || isLoginRequired) && hasToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Block admin routes for non-admin users
  if (isAdminRoute) {
    if (!hasToken) {
      return NextResponse.redirect(new URL('/auth/login-required', request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Block protected routes for users without tokens
  if (isProtectedRoute && !hasToken) {
    return NextResponse.redirect(new URL('/auth/login-required', request.url));
  }

  return NextResponse.next();
}

// matcher tells where middleware should run
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
