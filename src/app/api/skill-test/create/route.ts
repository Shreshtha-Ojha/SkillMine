import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import { Skill, SkillAttempt } from '@/models/skillModel';
import getUserFromRequest from '@/lib/getUserFromRequest';

connect();

function shuffle(arr:any[]) { return arr.sort(() => Math.random()-0.5); }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testName, skills: selectedSkills, totalQuestions, timeLimitMinutes, perQuestionTimerEnabled, perQuestionTimeMinutes, oneTimeVisit } = body;
    if (!Array.isArray(selectedSkills) || selectedSkills.length === 0) return NextResponse.json({ error: 'Select at least one skill' }, { status: 400 });
    if (!totalQuestions || ![15,20,30,40,50,60].includes(Number(totalQuestions))) return NextResponse.json({ error: 'Invalid totalQuestions' }, { status: 400 });

    // Fetch skill documents
    const skillDocs = await Skill.find({ _id: { $in: selectedSkills }}).lean();
    if (!skillDocs || skillDocs.length === 0) return NextResponse.json({ error: 'No skills found' }, { status: 404 });

    // Distribute questions evenly
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

    // Mix questions so they are not grouped by skill (still evenly distributed)
    shuffle(snapshot);

    // Create attempt record (user optional)
    const user = await getUserFromRequest(request as any);
    // All users now have unlimited attempts - no premium check needed
    const minutes = Number(timeLimitMinutes) || 60;
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1000) return NextResponse.json({ error: 'timeLimitMinutes must be an integer between 1 and 1000' }, { status: 400 });
    const perQEnabled = !!perQuestionTimerEnabled;
    const perQMinutes = Number(perQuestionTimeMinutes) || 0;
    if (perQEnabled && (!Number.isInteger(perQMinutes) || perQMinutes < 1 || perQMinutes > 1000)) return NextResponse.json({ error: 'perQuestionTimeMinutes must be integer between 1 and 1000' }, { status: 400 });
    const singleVisit = !!oneTimeVisit;

    const attempt = await SkillAttempt.create({ userId: user?._id, testName: testName || 'Skill Test', skills: skillDocs.map(s => ({ skillId: s._id, skillTitle: s.title })), mcqSnapshot: snapshot, timeLimitMinutes: minutes, perQuestionTimerEnabled: perQEnabled, perQuestionTimeMinutes: perQMinutes, oneTimeVisit: singleVisit });

    // Sanitize snapshot before returning (remove correctAnswer)
    const returnSnapshot = snapshot.map((q:any) => ({ question: q.question, options: q.options, marks: q.marks }));

    return NextResponse.json({ success: true, attemptId: attempt._id, mcqSnapshot: returnSnapshot, totalQuestions: snapshot.length });
  } catch (e:any) {
    console.error('Failed create skill attempt', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
