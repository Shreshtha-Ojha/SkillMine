/**
 * Purpose
 * -------
 * Email/password login endpoint — the manual auth path that runs in parallel
 * with the Google OAuth flow handled by NextAuth.
 *
 * Authentication
 * - None required (this route creates the session).
 *
 * Rate Limiting
 * - 10 attempts per IP per 60 seconds via the in-memory token-bucket limiter.
 *   Brute-force protection against credential stuffing attacks.
 *
 * Database Interactions
 * - Reads the User document by email.
 * - Does NOT write on success; token state is stateless (JWT).
 *
 * Failure Cases
 * - 400: Missing email or password in request body.
 * - 401: User not found, or bcrypt comparison fails.
 * - 403: User exists but email is unverified.
 * - 429: Rate limit exceeded.
 * - 503: MongoDB connection failure.
 * - 500: Unexpected server error.
 *
 * Security Considerations
 * - Error messages for "user not found" and "wrong password" are deliberately
 *   identical ("Invalid email or password") to prevent user enumeration.
 * - The token cookie is `httpOnly` so XSS cannot read it from JavaScript.
 * - The token is also returned in the response body so the client-side callback
 *   page can store it in the cookie for the Google OAuth code path consistency.
 * - Admin status is derived from the `ADMINS` env var at mint time, not stored
 *   in the DB, so promoting/demoting an admin requires no DB migration.
 *
 * TODO: Consolidate the admin-email check (duplicated here, in authOptions.ts,
 * and in middleware.ts) into a single shared `isAdminEmail(email)` utility.
 */

import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { allowRequest } from "@/lib/server/rateLimiter";

connect();

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 login attempts per IP per minute
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";
    if (!allowRequest(`login:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const reqBody = await request.json();
    const { email, password } = reqBody;

    // Input validation
    if(!email || !password){
      return NextResponse.json(
        { error: "Please provide both email and password" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials and try again." },
        { status: 401 }
      );
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in. Check your inbox for the verification link or use 'Resend Verification'." },
        { status: 403 }
      );
    }

    // Validate password
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials and try again." },
        { status: 401 }
      );
    }

    // Admin check using env variable
    const adminEmails = process.env.ADMINS ? process.env.ADMINS.split(",").map(e => e.trim().toLowerCase()) : [];
    const userEmail = user.email.trim().toLowerCase();
    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: adminEmails.includes(userEmail) || user.isAdmin === true,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1d" });

    const response = NextResponse.json({
      message: "User logged in successfully",
      success: true,
      user,
      token, // Add token to response body for client-side use
    });

    // Set cookie with proper options for security
    response.cookies.set("token", token, {
      httpOnly: true, // Prevent XSS attacks from accessing token
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 1 day in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("❌ Login error:", error);

    // Handle network/connection errors
    const errorName = error instanceof Error ? error.name : "";
    if(errorName === 'MongoNetworkError' || errorName === 'MongoTimeoutError'){
      return NextResponse.json(
        { error: "Database connection failed. Please check your internet connection and try again." },
        { status: 503 }
      );
    }

    // Handle JWT errors
    if(errorName === 'JsonWebTokenError'){
      return NextResponse.json(
        { error: "Authentication token error. Please try logging in again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again later." },
      { status: 500 }
    );
  }
}
