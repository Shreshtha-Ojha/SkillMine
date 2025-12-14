import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import { SkillAttempt } from '@/models/skillModel';
import getUserFromRequest from '@/lib/getUserFromRequest';

connect();

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { attemptId, questionIndex, choice } = await request.json();
    if (!attemptId) return NextResponse.json({ error: 'attemptId required' }, { status: 400 });
    if (typeof questionIndex !== 'number') return NextResponse.json({ error: 'questionIndex required' }, { status: 400 });
    if (typeof choice !== 'number') return NextResponse.json({ error: 'choice required' }, { status: 400 });

    const attempt = await SkillAttempt.findById(attemptId).lean() as any;
    if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    if (!attempt.userId || String(attempt.userId) !== String(user._id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (attempt.submittedAt) return NextResponse.json({ error: 'Attempt already submitted' }, { status: 400 });

    const q = (attempt.mcqSnapshot || [])[questionIndex];
    if (!q) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    const isCorrect = q.correctAnswer === choice;
    return NextResponse.json({ success: true, isCorrect });
  } catch (e:any) {
    console.error('Failed check answer', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
