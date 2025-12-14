import { connect } from "@/dbConfig/dbConfig";
import { RoadmapTest, TestAttempt } from "@/models/roadmapTestModel";
import Certification from "@/models/certificationModel";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { getDataFromToken } from "@/helpers/getToken";
// Gemini-based evaluation removed — MCQ-only flow uses direct scoring

connect();

// Generate unique certificate ID
function generateCertificateId(): string {
  const prefix = "QP";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Short-answer evaluation via Gemini removed; MCQ-only tests do not require LLM evaluation.

// POST: Submit test and get results
export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId, roadmapId, attemptId, mcqAnswers } = await request.json();

    if (!testId || !roadmapId) {
      return NextResponse.json(
        { error: "testId and roadmapId are required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has full details for certificate
    if (!user.fullName) {
      return NextResponse.json(
        { error: "Please update your full name in profile before taking the test" },
        { status: 400 }
      );
    }

    // Fetch the attempt draft
    if (!attemptId) return NextResponse.json({ error: "attemptId is required" }, { status: 400 });

    const attemptDraft = await TestAttempt.findById(attemptId);
    if (!attemptDraft) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // Allow admins to act on behalf of users; otherwise ensure owner matches
    const requestingUser = await User.findById(userId);
    // check ADMINS env list
    const adminEmails = (process.env.ADMINS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    // try to detect admin from DB user flag or env or token payload
    let isAdminRequester = requestingUser?.isAdmin === true || adminEmails.includes((requestingUser?.email || "").toLowerCase());

    // also try token payload (in case DB flag isn't set). Use non-verifying decode like middleware
    try {
      const token = request.cookies.get("token")?.value;
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            const tokEmail = (payload.email || payload?.user?.email || "").toLowerCase();
            if (payload.isAdmin === true || adminEmails.includes(tokEmail)) {
              isAdminRequester = true;
            }
            console.log('Submit token payload:', { tokEmail, isAdminFromPayload: payload.isAdmin });
          } catch (e) {
            console.log('Failed to parse token payload for submit route');
          }
        } else {
          console.log('Submit token not JWT-like');
        }
      }
    } catch (e) {
      // ignore token decode errors
    }

    // Owner check: allow if requester is owner OR admin OR ALLOW_SUBMIT_ANYONE env flag is set
    const allowAnyone = (process.env.ALLOW_SUBMIT_ANYONE || "").toLowerCase() === "true";
    if (attemptDraft.userId !== userId && !isAdminRequester && !allowAnyone) {
      console.error('Submit forbidden:', { attemptOwner: attemptDraft.userId, requester: userId, isAdminRequester, adminEmails, allowAnyone });
      return NextResponse.json({ error: "Attempt belongs to another user. Admin privileges required to submit on behalf." }, { status: 403 });
    }
    if (attemptDraft.userId !== userId && allowAnyone) {
      console.log('ALLOW_SUBMIT_ANYONE active: allowing submission from non-owner', { attemptOwner: attemptDraft.userId, requester: userId });
    }

    if (attemptDraft.submittedAt) return NextResponse.json({ error: "This attempt has already been submitted" }, { status: 403 });

    // Get the test
    const test = await RoadmapTest.findById(testId);
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Calculate MCQ score using the attempt's mcqSnapshot
    const snapshot = attemptDraft.mcqSnapshot || [];
    if (!Array.isArray(snapshot) || snapshot.length === 0) {
      return NextResponse.json({ error: "No questions snapshot found for this attempt" }, { status: 400 });
    }

    // Validate mcqAnswers shape: must be array with same length as snapshot
    if (!Array.isArray(mcqAnswers) || mcqAnswers.length !== snapshot.length) {
      return NextResponse.json({ error: "mcqAnswers must be an array matching the number of questions" }, { status: 400 });
    }

    for (let i = 0; i < mcqAnswers.length; i++) {
      const a = mcqAnswers[i];
      if (a === null || a === undefined) continue; // unanswered allowed
      if (!Number.isInteger(a) || a < 0 || a > 3) {
        return NextResponse.json({ error: `Invalid answer at index ${i}` }, { status: 400 });
      }
    }

    let mcqScore = 0;
    const mcqResults = snapshot.map((q: any, idx: number) => {
      const userAnswer = mcqAnswers?.[idx];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) mcqScore += 1;
      return {
        questionIndex: idx,
        userAnswer,
        // Do not expose correctAnswer via the saved attempt object below; include in results since submission finished
        correctAnswer: q.correctAnswer,
        isCorrect,
        marks: isCorrect ? 1 : 0,
      };
    });

    // MCQ-only scoring
    const totalScore = mcqScore; // out of 60
    const percentage = Math.round((totalScore / 60) * 100);
    const passed = percentage >= (test.passingPercentage || 60);

    // Finalize the attempt draft with results using atomic update to avoid VersionError
    // Only update if it hasn't been submitted already (avoid overwriting existing submission)
    const updatedAttempt = await TestAttempt.findOneAndUpdate(
      { _id: attemptDraft._id, submittedAt: { $exists: false } },
      {
        $set: {
          mcqAnswers: mcqAnswers || [],
          mcqScore,
          totalScore,
          percentage,
          passed,
          submittedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedAttempt) {
      return NextResponse.json({ error: "This attempt has already been submitted" }, { status: 403 });
    }

    const attempt = updatedAttempt;

    // Issue certificate if passed
    let certification = null;
    if (passed) {
      // Check if certificate already exists
      const existingCert = await Certification.findOne({ userId, roadmapId });
      
      if (!existingCert) {
        certification = await Certification.create({
          userId,
          roadmapId,
          roadmapTitle: test.roadmapTitle,
          userName: user.fullName,
          userEmail: user.email,
          testAttemptId: attempt._id,
          score: totalScore,
          percentage,
          mcqScore,
          certificateId: generateCertificateId(),
        });
      } else {
        certification = existingCert;
      }
    }

    // Sanitize attempt before returning to client: remove mcqSnapshot to avoid leaking correct answers
    const attemptObj: any = attempt.toObject ? attempt.toObject() : { ...attempt };
    if (attemptObj.mcqSnapshot) {
      // replace snapshot with redacted version (no correctAnswer)
      attemptObj.mcqSnapshot = attemptObj.mcqSnapshot.map((q: any) => ({ question: q.question, options: q.options, marks: q.marks }));
    }



    return NextResponse.json({
      success: true,
      result: {
        mcqScore,
        totalScore,
        percentage,
        passed,
        mcqResults,
      },
      attempt: attemptObj,
      certification,
      message: passed
        ? "Congratulations! You passed the test and earned your certificate!"
        : "Unfortunately, you did not pass. You need at least 60% to earn the certificate.",
    });
  } catch (error: any) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get attempt details
export async function GET(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get("attemptId");
    const roadmapId = searchParams.get("roadmapId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let attempt;
    if (attemptId) {
      attempt = await TestAttempt.findById(attemptId);
    } else if (roadmapId) {
      attempt = await TestAttempt.findOne({ userId, roadmapId, submittedAt: { $exists: true } });
    }

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Get certification if exists
    const certification = await Certification.findOne({
      userId,
      roadmapId: attempt.roadmapId,
    });

    // Determine if requester is admin
    const requestingUser = await User.findById(userId);
    const adminEmails = process.env.ADMINS ? process.env.ADMINS.split(",").map((e) => e.trim().toLowerCase()) : [];
    const userEmail = requestingUser?.email?.trim().toLowerCase() || "";
    const isAdmin = adminEmails.includes(userEmail) || requestingUser?.isAdmin === true;

    const attemptObj: any = attempt.toObject ? attempt.toObject() : { ...attempt };
    if (!isAdmin) {
      // Redact correct answers from snapshot to prevent pre/post inspection
      if (attemptObj.mcqSnapshot) {
        attemptObj.mcqSnapshot = attemptObj.mcqSnapshot.map((q: any) => ({ question: q.question, options: q.options, marks: q.marks }));
      }
    }

    return NextResponse.json({
      attempt: attemptObj,
      certification,
    });
  } catch (error: any) {
    console.error("Error getting attempt:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
