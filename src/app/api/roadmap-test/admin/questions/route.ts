import { connect } from "@/dbConfig/dbConfig";
import { RoadmapTest } from "@/models/roadmapTestModel";
import User from "@/models/userModel";
import Roadmap from "@/models/roadmapModel";
import { NextResponse, NextRequest } from "next/server";
import { getDataFromToken } from "@/helpers/getToken";

connect();

// GET: Fetch questions for a roadmap (admin-only)
export async function GET(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId);
    if (!user || !user.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const roadmapId = searchParams.get("roadmapId");
    if (!roadmapId) return NextResponse.json({ error: "roadmapId is required" }, { status: 400 });

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });

    const test = await RoadmapTest.findOne({ roadmapId });
    return NextResponse.json({ questions: (test?.mcqQuestions || []), roadmapTitle: roadmap.title });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Create or update MCQ questions for a roadmap (admin-only)
export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId);
    if (!user || !user.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const body = await request.json();
    const { roadmapId, mcqQuestions, append } = body;
    if (!roadmapId) return NextResponse.json({ error: "roadmapId is required" }, { status: 400 });
    if (!Array.isArray(mcqQuestions)) return NextResponse.json({ error: "mcqQuestions must be an array" }, { status: 400 });

    // Basic validation for questions
    mcqQuestions.forEach((q: any, i: number) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        return NextResponse.json({ error: `Invalid question at index ${i}. Ensure question and 4 options.` }, { status: 400 });
      }
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) {
        return NextResponse.json({ error: `Invalid correctAnswer at index ${i}. It must be 0-3.` }, { status: 400 });
      }
      // Normalize marks to 1
      q.marks = 1;
      // keep optional explanation if provided
      if (q.explanation && typeof q.explanation === 'string') q.explanation = q.explanation;
    });

    // Upsert RoadmapTest
    let test = await RoadmapTest.findOne({ roadmapId });
    if (!test) {
      const roadmap = await Roadmap.findById(roadmapId);
      if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
      test = await RoadmapTest.create({
        roadmapId,
        roadmapTitle: roadmap.title,
        mcqQuestions,
        duration: 60,
        totalMarks: 60,
        passingPercentage: 60,
      });
    } else {
      if (append) {
        // Append new validated questions to existing bank, avoiding duplicates by question text
        const existingSet = new Set((test.mcqQuestions || []).map((q: any) => (q.question || "").trim().toLowerCase()));

        // Dedupe incoming array (preserve first occurrence)
        const seen = new Set<string>();
        const uniqueIncoming: any[] = [];
        for (const q of mcqQuestions) {
          const key = (q.question || "").trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            uniqueIncoming.push(q);
          }
        }

        const toAdd = uniqueIncoming.filter((q: any) => {
          const key = (q.question || "").trim().toLowerCase();
          return !existingSet.has(key);
        });

        test.mcqQuestions = (test.mcqQuestions || []).concat(toAdd);
        test.lastRegeneratedBy = userId;
        test.lastRegeneratedAt = new Date();
        await test.save();

        const appended = toAdd.length;
        const duplicates = uniqueIncoming.length - appended;
        return NextResponse.json({ success: true, message: `Appended ${appended} questions. ${duplicates} duplicates skipped.`, appended, duplicates, total: test.mcqQuestions.length });
      } else {
        // Replace: dedupe provided questions by question text
        const seen = new Set<string>();
        const unique: any[] = [];
        for (const q of mcqQuestions) {
          const key = (q.question || "").trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(q);
          }
        }
        test.mcqQuestions = unique;
        test.duration = 60;
        test.totalMarks = 60;
        test.passingPercentage = 60;
        test.lastRegeneratedBy = userId;
        test.lastRegeneratedAt = new Date();
        await test.save();
        return NextResponse.json({ success: true, message: `Saved ${unique.length} unique questions.`, appended: unique.length, duplicates: 0, total: test.mcqQuestions.length });
      }
    }

    return NextResponse.json({ success: true, message: "Questions saved", testId: test._id });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Note: permanent deletion via API has been removed; use editor 'Remove' and then Save to update bank.
