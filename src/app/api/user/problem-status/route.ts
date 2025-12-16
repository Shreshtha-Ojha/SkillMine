import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import getUserFromRequest from '@/lib/getUserFromRequest';

connect();

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req as unknown as Request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const problemLink = String(body?.problemLink || '').trim();
    const action = String(body?.action || '').trim(); // 'toggleSolved' | 'toggleReview'

    if (!problemLink || !action) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    // Ensure arrays exist
    user.solvedProblems = user.solvedProblems || [];
    user.reviewProblems = user.reviewProblems || [];

    if (action === 'toggleSolved') {
      const idx = user.solvedProblems.indexOf(problemLink);
      const nowSet = idx === -1;
      if (nowSet) user.solvedProblems.push(problemLink);
      else user.solvedProblems.splice(idx, 1);
      // Keep review list consistent: if solved, remove from review
      if (nowSet) user.reviewProblems = (user.reviewProblems || []).filter((p: string) => p !== problemLink);

      await user.save();
      return NextResponse.json({ success: true, solved: nowSet, solvedProblems: user.solvedProblems, reviewProblems: user.reviewProblems });
    }

    if (action === 'toggleReview') {
      const idx = user.reviewProblems.indexOf(problemLink);
      const nowSet = idx === -1;
      if (nowSet) user.reviewProblems.push(problemLink);
      else user.reviewProblems.splice(idx, 1);
      // If marked for review, don't change solved; keep independent

      await user.save();
      return NextResponse.json({ success: true, review: nowSet, reviewProblems: user.reviewProblems, solvedProblems: user.solvedProblems });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('problem-status error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
