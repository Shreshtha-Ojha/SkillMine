import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import { SkillAttempt } from '@/models/skillModel';
import { getDataFromToken } from '@/helpers/getToken';

connect();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authenticatedUserId = getDataFromToken(request);
    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('attemptId');
    if (!attemptId) return NextResponse.json({ error: 'attemptId required' }, { status: 400 });

    const attempt = await SkillAttempt.findById(attemptId).lean();
    if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });

    // Verify user owns this attempt
    if ((attempt as any).userId?.toString() !== authenticatedUserId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // redact correct answers unless attempt is submitted, and do not expose skill titles
    const submitted = !!(attempt as any).submittedAt;
    const sanitized = {
      ...attempt,
      mcqSnapshot: ((attempt as any).mcqSnapshot || []).map((q:any) => {
        const base:any = { question: q.question, options: q.options, marks: q.marks };
        if (submitted) base.correctAnswer = q.correctAnswer;
        return base;
      }),
    };
    return NextResponse.json({ success: true, attempt: sanitized });
  } catch (e:any) {
    console.error('Failed fetch attempt:', e?.message);
    return NextResponse.json({ error: 'Failed to fetch attempt' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 400 });
}
