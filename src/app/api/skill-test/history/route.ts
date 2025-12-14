import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import { SkillAttempt } from '@/models/skillModel';
import { getDataFromToken } from '@/helpers/getToken';

connect();

export async function GET(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const attempts = await SkillAttempt.find({ userId }).sort({ createdAt: -1 }).lean();
    const sanitized = attempts.map(a => ({ _id: a._id, testName: a.testName, startedAt: a.startedAt, submittedAt: a.submittedAt, totalScore: a.totalScore, percentage: a.percentage, passed: a.passed, questionCount: (a.mcqSnapshot||[]).length }));
    return NextResponse.json({ success: true, attempts: sanitized });
  } catch (e:any) {
    console.error('Failed fetch history', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
