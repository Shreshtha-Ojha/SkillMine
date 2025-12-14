import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import { Skill, SkillAttempt } from '@/models/skillModel';
import getUserFromRequest from '@/lib/getUserFromRequest';

connect();

function shuffle(arr:any[]) { return arr.sort(() => Math.random()-0.5); }

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    const { attemptId } = await request.json();
    if (!attemptId) return NextResponse.json({ error: 'attemptId required' }, { status: 400 });

    const prev = await SkillAttempt.findById(attemptId).lean() as any;
    if (!prev) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    if (!user || String(user._id) !== String(prev.userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const skillIds = (prev.skills || []).map((s:any) => s.skillId).filter(Boolean);
    if (!skillIds.length) return NextResponse.json({ error: 'No skills found in previous attempt' }, { status: 400 });

    const skillDocs = await Skill.find({ _id: { $in: skillIds } }).lean();
    if (!skillDocs || skillDocs.length === 0) return NextResponse.json({ error: 'Skills not found' }, { status: 404 });

    const totalQuestions = prev.mcqSnapshot?.length || 15;
    const k = skillDocs.length;
    const qPer = Math.floor(totalQuestions / k);
    let remainder = totalQuestions - qPer * k;

    const snapshot: any[] = [];
    for (const s of skillDocs) {
      const pool = (s.mcqQuestions || []).slice();
      const pick = qPer + (remainder > 0 ? 1 : 0);
      remainder = Math.max(0, remainder - 1);
      const chosen = shuffle(pool).slice(0, pick);
      for (const q of chosen) snapshot.push({ ...q, skillId: s._id, skillTitle: s.title });
    }

    if (snapshot.length === 0) return NextResponse.json({ error: 'No questions available in selected skills' }, { status: 400 });

    shuffle(snapshot);

    const attempt = await SkillAttempt.create({ userId: user._id, testName: prev.testName || 'Skill Test', skills: prev.skills, mcqSnapshot: snapshot, timeLimitMinutes: prev.timeLimitMinutes || 60, perQuestionTimerEnabled: !!prev.perQuestionTimerEnabled, perQuestionTimeMinutes: prev.perQuestionTimeMinutes || 0, oneTimeVisit: !!prev.oneTimeVisit });

    return NextResponse.json({ success: true, attemptId: attempt._id });
  } catch (e:any) {
    console.error('Reattempt failed', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
