import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Skill from '@/models/skillModel';

connect();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    if (!skillId) return NextResponse.json({ error: 'skillId required' }, { status: 400 });

    const skill = await Skill.findById(skillId).lean() as any;
    if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });

    // All skills are now free - paywall removed
    const allQuestions = (skill.mcqQuestions || []).map((q:any) => ({ _id: q._id, question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation || null }));

    const questions = allQuestions;
    const truncated = false;
    const totalQuestions = allQuestions.length;

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