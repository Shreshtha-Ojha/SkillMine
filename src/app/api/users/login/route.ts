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
  } catch (error: any) {
    console.error("❌ Login error:", error);
    
    // Handle network/connection errors
    if(error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError'){
      return NextResponse.json(
        { error: "Database connection failed. Please check your internet connection and try again." },
        { status: 503 }
      );
    }
    
    // Handle JWT errors
    if(error.name === 'JsonWebTokenError'){
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
