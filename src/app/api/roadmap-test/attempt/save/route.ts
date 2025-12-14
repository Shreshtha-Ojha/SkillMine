import { connect } from "@/dbConfig/dbConfig";
import { TestAttempt } from "@/models/roadmapTestModel";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";

import { getDataFromToken } from "@/helpers/getToken";

connect();

export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { attemptId, mcqAnswers } = await request.json();
    if (!attemptId) return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
    if (!Array.isArray(mcqAnswers)) return NextResponse.json({ error: "mcqAnswers must be an array" }, { status: 400 });

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // Owner/admin check: allow owner or admin (based on env list)
    const requestingUser = await User.findById(userId);
    const adminEmails = (process.env.ADMINS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const requesterEmail = (requestingUser?.email || "").toLowerCase();
    const isAdminRequester = requestingUser?.isAdmin === true || adminEmails.includes(requesterEmail);

    if (attempt.userId !== userId && !isAdminRequester) {
      return NextResponse.json({ error: "Not authorized to save this attempt" }, { status: 403 });
    }

    const snapshot = attempt.mcqSnapshot || [];
    if (!Array.isArray(snapshot) || snapshot.length === 0) return NextResponse.json({ error: "No snapshot found" }, { status: 400 });

    if (mcqAnswers.length !== snapshot.length) return NextResponse.json({ error: "mcqAnswers length mismatch" }, { status: 400 });

    // basic validation of answers
    for (let i = 0; i < mcqAnswers.length; i++) {
      const a = mcqAnswers[i];
      if (a === null || a === undefined) continue;
      if (!Number.isInteger(a) || a < 0 || a > 3) return NextResponse.json({ error: `Invalid answer at index ${i}` }, { status: 400 });
    }

    // Use atomic update to prevent version conflicts with concurrent submit/save
    await TestAttempt.findByIdAndUpdate(attempt._id, {
      $set: { mcqAnswers, lastSavedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Progress saved" });
  } catch (error: any) {
    console.error("Error saving attempt progress:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
