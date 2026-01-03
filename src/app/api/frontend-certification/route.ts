import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Skill from "@/models/skillModel";
import { getDataFromToken } from "@/helpers/getToken";
import jwt from "jsonwebtoken";

connect();

// Helper to get userId from request
function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const userId = getDataFromToken(request);
    if (userId) return userId;
  } catch (e) {}

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const decoded: jwt.JwtPayload = jwt.verify(token, process.env.TOKEN_SECRET!) as jwt.JwtPayload;
      return decoded.id;
    } catch (e) {}
  }

  return null;
}

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// GET: Check eligibility and get questions
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({
        error: "Not authenticated",
        canTakeTest: false
      }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has already taken the frontend certification
    const hasAttempted = user.frontendCertAttempt?.completed === true;

    // Check if user has full profile details
    const requiredFields = ['fullName', 'college', 'contactNumber'];
    const missingFields = requiredFields.filter(field => !user[field as keyof typeof user]);
    const hasFullDetails = missingFields.length === 0;

    if (hasAttempted) {
      return NextResponse.json({
        canTakeTest: false,
        hasAttempted: true,
        attempt: user.frontendCertAttempt,
        hasFullDetails,
        missingDetails: missingFields.length > 0 ? `Missing: ${missingFields.join(', ')}` : null
      });
    }

    // Fetch Frontend Development skill questions
    const skill = await Skill.findOne({ key: 'frontend-development' });
    if (!skill || !skill.mcqQuestions || skill.mcqQuestions.length === 0) {
      return NextResponse.json({ error: "Frontend Development skill not found or has no questions" }, { status: 404 });
    }

    // Randomly select 20 questions from the pool
    const allQuestions = skill.mcqQuestions;
    const shuffled = shuffleArray(allQuestions);
    const selectedQuestions = shuffled.slice(0, 20);

    // Return questions without correct answers for test-taking
    const questionsForUser = selectedQuestions.map((q, idx: number) => {
      const question = q as { _id?: { toString: () => string }; question: string; options: string[] };
      return {
        id: question._id?.toString() || `fq${idx}`,
        question: question.question,
        options: question.options,
        marks: 1
      };
    });

    return NextResponse.json({
      canTakeTest: true,
      hasAttempted: false,
      hasFullDetails,
      missingDetails: missingFields.length > 0 ? `Missing: ${missingFields.join(', ')}` : null,
      questions: questionsForUser,
      totalMarks: 20,
      passingMarks: 12,
      duration: 15 // 15 minutes
    });
  } catch (error) {
    console.error("Error in frontend certification GET:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Submit test answers
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already attempted
    if (user.frontendCertAttempt?.completed) {
      return NextResponse.json({
        error: "You have already taken the Frontend Development certification test",
        attempt: user.frontendCertAttempt
      }, { status: 400 });
    }

    const body = await request.json();
    const { answers, questionIds } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: "Invalid answers format" }, { status: 400 });
    }

    // Fetch the skill to get correct answers
    const skill = await Skill.findOne({ key: 'frontend-development' });
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Create a map of question ID to correct answer
    const questionMap = new Map();
    for (const q of skill.mcqQuestions) {
      questionMap.set(q._id?.toString(), q);
    }

    // Calculate score
    let score = 0;
    const results: {
      questionId: string;
      question: string;
      userAnswer: number | undefined;
      correctAnswer: number;
      isCorrect: boolean;
      marks: number;
    }[] = [];

    for (const qId of Object.keys(answers)) {
      const q = questionMap.get(qId);
      if (!q) continue;

      const userAnswer = answers[qId];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) {
        score += 1;
      }
      results.push({
        questionId: qId,
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        marks: isCorrect ? 1 : 0
      });
    }

    const totalMarks = 20;
    const percentage = Math.round((score / totalMarks) * 100);
    const passed = percentage >= 60;

    // Generate certificate ID if passed
    const certificateId = passed ? `FRONTEND-${userId.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}` : null;

    // Save attempt to user
    user.frontendCertAttempt = {
      completed: true,
      score,
      totalMarks,
      percentage,
      passed,
      certificateId,
      completedAt: new Date(),
      answers: results
    };

    await user.save();

    return NextResponse.json({
      success: true,
      score,
      totalMarks,
      percentage,
      passed,
      certificateId,
      results,
      message: passed
        ? `Congratulations! You passed the Frontend Development Certification with ${percentage}%!`
        : `You scored ${percentage}%. You need 60% to pass.`
    });
  } catch (error) {
    console.error("Error in frontend certification POST:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
