import { NextRequest, NextResponse } from "next/server";
import InterviewResult from "@/models/interviewModel";
import mongoose from "mongoose";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/getToken";

export async function GET(req: NextRequest) {
  // Verify authentication
  const authenticatedUserId = getDataFromToken(req);
  if (!authenticatedUserId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ results: [] });

  // Verify user is only accessing their own data
  if (authenticatedUserId !== userId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (mongoose.connection.readyState === 0) await connect();
  const results = await InterviewResult.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ results });
}
