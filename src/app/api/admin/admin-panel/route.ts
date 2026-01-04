import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";

// Force dynamic rendering - prevents Vercel from caching this route
export const dynamic = 'force-dynamic';

connect();

export async function GET(request: NextRequest) {
  try {
    const users = await User.find().select("-password"); // Don't return password for security

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
