import { connect } from "@/dbConfig/dbConfig";
import { RoadmapTest, TestAttempt } from "@/models/roadmapTestModel";
import Roadmap from "@/models/roadmapModel";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { getDataFromToken } from "@/helpers/getToken";


connect();

// NOTE: Auto-generation via Gemini has been removed. Admins should provide MCQ questions
// in the admin panel. The system will pick 60 random MCQs for each user's test attempt.

// POST: Generate or get test for a roadmap
export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roadmapId, regenerate } = await request.json();
    
    if (!roadmapId) {
      return NextResponse.json({ error: "roadmapId is required" }, { status: 400 });
    }

    // Check if user has completed the roadmap
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the roadmap
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    // Check if roadmap is 100% completed
    const userProgress = user.completedRoadmaps?.find(
      (r: any) => r.roadmapId === roadmapId
    );
    
    const totalItems = roadmap.phases.reduce(
      (acc: number, phase: any) => 
        acc + (phase.tasks?.length || 0) + (phase.assignments?.length || 0),
      0
    );
    
    const completedItems = userProgress
      ? (userProgress.completedTasks?.length || 0) + (userProgress.completedAssignments?.length || 0)
      : 0;

    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    if (progressPercent < 100 && !user.isAdmin) {
      return NextResponse.json(
        { error: "You must complete the roadmap 100% before taking the test" },
        { status: 403 }
      );
    }

    // Check if user already attempted the test
    // Check for most recent submitted attempt (if any)
    const existingAttempt = await TestAttempt.findOne({
      userId,
      roadmapId,
      submittedAt: { $exists: true },
    }).sort({ submittedAt: -1 });

    if (existingAttempt && !existingAttempt.canRetry) {
      return NextResponse.json(
        { 
          error: "You have already taken this test",
          attempt: existingAttempt,
          canRetry: false
        },
        { status: 403 }
      );
    }

    // Check for existing test
    let test = await RoadmapTest.findOne({ roadmapId });
    
    // Check if test exists and is not expired (4 days)
    const isExpired = test && test.expiresAt && new Date() > new Date(test.expiresAt);
    
    if (isExpired) {
      console.log(`Test for roadmap ${roadmapId} expired. Deleting and regenerating...`);
      await RoadmapTest.deleteOne({ roadmapId });
      test = null;
    }

    // If test doesn't exist, inform the user to contact admin to add questions
    if (!test) {
      return NextResponse.json({ error: "Test not configured. Contact admin to add MCQ questions for this roadmap." }, { status: 404 });
    }

    // Ensure enough questions exist
    if (!test.mcqQuestions || test.mcqQuestions.length < 60) {
      return NextResponse.json({ error: "Not enough questions configured for this test. Admin must add at least 60 MCQs." }, { status: 400 });
    }

    // Return test without correct answers for taking
    // Select 60 random MCQs for user (without exposing correctAnswer)
    const shuffled = test.mcqQuestions
      .map((s: any) => ({ s, sort: Math.random() }))
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((x: any) => x.s);

    const selectedMcqs = shuffled.slice(0, 60);

    const testForUser = {
      _id: test._id,
      roadmapId: test.roadmapId,
      roadmapTitle: test.roadmapTitle,
      duration: 60,
      totalMarks: 60,
      passingPercentage: test.passingPercentage || 60,
      expiresAt: test.expiresAt, // Include expiration for UI if needed
      mcqQuestions: selectedMcqs.map((q: any) => ({
        question: q.question,
        options: q.options,
        marks: 1,
      })),
    };

    // Create a draft TestAttempt storing the exact questions shown to the user
    const attempt = await TestAttempt.create({
      testId: test._id,
      userId,
      roadmapId,
      mcqSnapshot: selectedMcqs,
      startedAt: new Date(),
      canRetry: false,
    });

    return NextResponse.json({
      test: testForUser,
      attemptId: attempt._id,
      message: "Test retrieved successfully",
      cached: !isExpired, // Indicate if test was from cache
      expiresAt: test.expiresAt,
    });
  } catch (error: any) {
    console.error("Error in test generation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Check if user can take test for a roadmap
export async function GET(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    const { searchParams } = new URL(request.url);
    const roadmapId = searchParams.get("roadmapId");

    if (!roadmapId) {
      return NextResponse.json({ error: "roadmapId is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({
        canTakeTest: false,
        reason: "Not logged in",
        hasAttempted: false,
      });
    }

    // Get user and check roadmap completion
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        canTakeTest: false,
        reason: "User not found",
        hasAttempted: false,
      });
    }

    // Get roadmap
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return NextResponse.json({
        canTakeTest: false,
        reason: "Roadmap not found",
        hasAttempted: false,
      });
    }

    // Calculate completion percentage
    const userProgress = user.completedRoadmaps?.find(
      (r: any) => r.roadmapId === roadmapId
    );
    
    const totalItems = roadmap.phases.reduce(
      (acc: number, phase: any) => 
        acc + (phase.tasks?.length || 0) + (phase.assignments?.length || 0),
      0
    );
    
    const completedItems = userProgress
      ? (userProgress.completedTasks?.length || 0) + (userProgress.completedAssignments?.length || 0)
      : 0;

    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Check for existing attempt
    // Check for most recent submitted attempt (if any)
    const existingAttempt = await TestAttempt.findOne({
      userId,
      roadmapId,
      submittedAt: { $exists: true },
    }).sort({ submittedAt: -1 });

    // Check if test exists
    const testExists = await RoadmapTest.exists({ roadmapId });

    // Check if user has all required profile details (full name, age, gender)
    const hasFullDetails = !!(user.fullName && user.age && user.gender);

    return NextResponse.json({
      canTakeTest: progressPercent >= 100 && !existingAttempt && hasFullDetails,
      progressPercent,
      hasAttempted: !!existingAttempt,
      attempt: existingAttempt,
      testExists: !!testExists,
      hasFullDetails,
      userDetails: {
        fullName: user.fullName || null,
        age: user.age || null,
        gender: user.gender || null,
      },
      missingDetails: !hasFullDetails ? "Please update your profile (full name, age, gender)" : null,
      canRetry: existingAttempt?.canRetry || false,
    });
  } catch (error: any) {
    console.error("Error checking test eligibility:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
