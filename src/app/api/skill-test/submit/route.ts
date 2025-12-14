import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import { SkillAttempt } from '@/models/skillModel';
// Skill tests do not issue certificates; certification is reserved for roadmap certification tests.
import { getDataFromToken } from '@/helpers/getToken';

connect();


export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request); // may be null for anonymous attempts
    const { attemptId, mcqAnswers } = await request.json();
    if (!attemptId) return NextResponse.json({ error: 'attemptId required' }, { status: 400 });

    const attempt = await SkillAttempt.findById(attemptId);
    if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    if (attempt.submittedAt) return NextResponse.json({ error: 'Already submitted' }, { status: 403 });

    const snapshot = attempt.mcqSnapshot || [];
    if (!Array.isArray(mcqAnswers) || mcqAnswers.length !== snapshot.length) return NextResponse.json({ error: 'Answers length mismatch' }, { status: 400 });

    let mcqScore = 0;
    const results = snapshot.map((q:any, idx:number) => {
      const raw = mcqAnswers[idx];
      const ua = raw === null || raw === undefined ? null : Number(raw);
      const correct = Number(q.correctAnswer);
      const isCorrect = ua !== null && ua === correct;
      if (isCorrect) mcqScore += 1;
      return { questionIndex: idx, userAnswer: ua, correctAnswer: correct, isCorrect, skillTitle: q.skillTitle };
    });

    const totalScore = mcqScore;
    const totalQuestions = snapshot.length;
    const percentage = Math.round((totalScore / totalQuestions) * 100);
    const attempted = mcqAnswers.filter(a => a !== null && a !== undefined).length;
    const accuracyAttempted = attempted === 0 ? 0 : Math.round((mcqScore / attempted) * 100);
    const passed = percentage >= 60;

    // per-skill aggregates
    const skillMap: Record<string, { attempted: number; correct: number; wrong: number }> = {};
    results.forEach((r: any) => {
      const st = r.skillTitle || 'General';
      if (!skillMap[st]) skillMap[st] = { attempted: 0, correct: 0, wrong: 0 };
      if (r.userAnswer !== null && r.userAnswer !== undefined) {
        skillMap[st].attempted += 1;
        if (r.isCorrect) skillMap[st].correct += 1; else skillMap[st].wrong += 1;
      }
    });

    const skillStats = Object.keys(skillMap).map(k => ({ skill: k, ...skillMap[k], accuracy: skillMap[k].attempted ? Math.round((skillMap[k].correct / skillMap[k].attempted) * 100) : 0 }));

    // suggestions
    const leastAttempted = [...skillStats].sort((a,b)=>a.attempted - b.attempted).slice(0,3);
    const leastCorrect = [...skillStats].sort((a,b)=>a.accuracy - b.accuracy).slice(0,3);
    const mostWrong = [...skillStats].sort((a,b)=>b.wrong - a.wrong).slice(0,3);

    const updated = await SkillAttempt.findOneAndUpdate({ _id: attemptId, submittedAt: { $exists: false } }, { $set: { mcqAnswers, mcqScore: totalScore, totalScore, percentage, passed, submittedAt: new Date(), userId: userId || undefined } }, { new: true });
    if (!updated) return NextResponse.json({ error: 'Already submitted' }, { status: 403 });

    // Skill tests do not issue certificates. Just return the attempt result.

    const r = updated.toObject ? updated.toObject() : updated;
    if (r.mcqSnapshot) r.mcqSnapshot = r.mcqSnapshot.map((q:any)=>({ question: q.question, options: q.options, marks: q.marks, skillTitle: q.skillTitle }));

    return NextResponse.json({ success: true, result: { mcqScore: totalScore, totalScore, percentage, passed, results, attempted, accuracyAttempted, skillStats, suggestions: { leastAttempted, leastCorrect, mostWrong } }, attempt: r });
  } catch (e:any) {
    console.error('Skill submit failed', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
