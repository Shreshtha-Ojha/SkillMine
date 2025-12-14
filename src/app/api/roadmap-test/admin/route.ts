import { connect } from "@/dbConfig/dbConfig";
import { TestAttempt } from "@/models/roadmapTestModel";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { getDataFromToken } from "@/helpers/getToken";

connect();

// POST: Admin allows a user to retry a test
export async function POST(request: NextRequest) {
  try {
    const adminId = await getDataFromToken(request);
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if requester is admin
    const admin = await User.findById(adminId);
    const adminEmails = process.env.ADMINS ? process.env.ADMINS.split(",").map(e => e.trim().toLowerCase()) : [];
    const userEmail = admin?.email?.trim().toLowerCase() || "";
    const isAdmin = adminEmails.includes(userEmail) || admin?.isAdmin === true;
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId, roadmapId } = await request.json();

    if (!userId || !roadmapId) {
      return NextResponse.json(
        { error: "userId and roadmapId are required" },
        { status: 400 }
      );
    }

    // Update all submitted attempts for this user & roadmap to allow retry
    const updateResult = await TestAttempt.updateMany(
      { userId, roadmapId, submittedAt: { $exists: true } },
      { $set: { canRetry: true } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: "No submitted attempts found for this user and roadmap" },
        { status: 404 }
      );
    }

    // Fetch the updated attempts to return to the admin UI
    const updatedAttempts = await TestAttempt.find({ userId, roadmapId, submittedAt: { $exists: true } }).sort({ submittedAt: -1 }).limit(100);

    console.log(`Allow retry: updated ${updateResult.modifiedCount} attempt(s) for user ${userId} roadmap ${roadmapId}`);

    return NextResponse.json({
      success: true,
      message: "User can now retry the test",
      updatedCount: updateResult.modifiedCount,
      attempts: updatedAttempts,
    });
  } catch (error: any) {
    console.error("Error allowing retry:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get all test attempts (for admin)
export async function GET(request: NextRequest) {
  try {
    const adminId = await getDataFromToken(request);
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if requester is admin
    const admin = await User.findById(adminId);
    const adminEmails = process.env.ADMINS ? process.env.ADMINS.split(",").map(e => e.trim().toLowerCase()) : [];
    const userEmail = admin?.email?.trim().toLowerCase() || "";
    const isAdmin = adminEmails.includes(userEmail) || admin?.isAdmin === true;
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roadmapId = searchParams.get("roadmapId");
    const userId = searchParams.get("userId");

    let query: any = { submittedAt: { $exists: true } };
    if (roadmapId) query.roadmapId = roadmapId;
    if (userId) query.userId = userId;

    const attempts = await TestAttempt.find(query)
      .sort({ submittedAt: -1 })
      .limit(100);

    // Get user details for each attempt
    const attemptsWithUsers = await Promise.all(
      attempts.map(async (attempt) => {
        const user = await User.findById(attempt.userId).select(
          "username email fullName"
        );
        return {
          ...attempt.toObject(),
          user: user
            ? {
                username: user.username,
                email: user.email,
                fullName: user.fullName,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ attempts: attemptsWithUsers });
  } catch (error: any) {
    console.error("Error getting attempts:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
