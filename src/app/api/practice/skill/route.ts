import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Skill from '@/models/skillModel';
import getUserFromRequest from '@/lib/getUserFromRequest';
import { getPricing } from '@/helpers/getPricing';

connect();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    if (!skillId) return NextResponse.json({ error: 'skillId required' }, { status: 400 });

    const skill = await Skill.findById(skillId).lean() as any;
    if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });

    // Check if skill is free (html/css)
    const title = (skill.title || '').toLowerCase();
    const free = ['html','css'].some(f => title.includes(f));

    // Fetch user (may be null for unauthenticated requests)
    const user = await getUserFromRequest(request as any);

    if (!free) {
      // require user to have site-wide Premium
      const canAccess = !!(user && user.purchases?.premium?.purchased);
      if (!canAccess) {
        return NextResponse.json({ error: 'Premium required', premium: true }, { status: 403 });
      }
    }

    const allQuestions = (skill.mcqQuestions || []).map((q:any) => ({ _id: q._id, question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation || null }));

    // If not free, only users with Skill Test Premium get ALL questions. Others get a limited sample (e.g., 20)
    const hasPremium = !!user?.purchases?.premium?.purchased;
    let questions = allQuestions;
    let truncated = false;
    const totalQuestions = allQuestions.length;

    if (!free && !hasPremium) {
      const limit = 20;
      if (allQuestions.length > limit) {
        questions = allQuestions.slice(0, limit);
        truncated = true;
      }
    }

    return NextResponse.json({ success: true, skill: { _id: skill._id, title: skill.title }, questions, truncated, totalQuestions });
  } catch (err:any) {
    console.error('Failed fetch practice skill', err);
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId, answers } = body; // answers: [{ questionId, answerIndex }]
    if (!skillId) return NextResponse.json({ error: 'skillId required' }, { status: 400 });
    if (!Array.isArray(answers)) return NextResponse.json({ error: 'answers required' }, { status: 400 });

    const skill = await Skill.findById(skillId).lean() as any;
    if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });

    // Create map for correct answers and explanations
    const map = new Map<string, any>();
    for (const q of (skill.mcqQuestions || [])) {
      map.set(String(q._id), { correctAnswer: q.correctAnswer, explanation: q.explanation });
    }

    let correctCount = 0;
    const details: any[] = [];
    for (const a of answers) {
      const info = map.get(String(a.questionId));
      if (!info) continue;
      const correct = Number(a.answerIndex) === Number(info.correctAnswer);
      if (correct) correctCount += 1;
      details.push({ questionId: a.questionId, correct, explanation: info.explanation || null });
    }

    const total = (answers || []).length;
    const score = { totalAttempted: total, correct: correctCount, percentage: total ? Math.round((correctCount / total) * 100) : 0 };
    return NextResponse.json({ success: true, score, details });
  } catch (err:any) {
    console.error('Failed submit practice skill', err);
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}