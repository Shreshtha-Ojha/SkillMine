import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Skill from '@/models/skillModel';
import getUserFromRequest from '@/lib/getUserFromRequest';
import JSON5 from 'json5';

export const dynamic = 'force-dynamic';

connect();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    if (!skillId) return NextResponse.json({ error: 'skillId required' }, { status: 400 });
    const skill = await Skill.findById(skillId).lean() as any;
    if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    return NextResponse.json({ success: true, questions: skill.mcqQuestions || [] });
  } catch (e:any) {
    console.error('Failed get skill questions', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user || !user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { skillId, mcqQuestions, append } = body;
    if (!skillId) return NextResponse.json({ error: 'skillId required' }, { status: 400 });
    const skill = await Skill.findById(skillId);
    if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });

    // Validate incoming questions
    const questions = Array.isArray(mcqQuestions) ? mcqQuestions : [];
    const valid: any[] = [];
    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length < 4) continue;
      const ca = Number(q.correctAnswer);
      if (!Number.isInteger(ca) || ca < 0 || ca > 3) continue;
      valid.push({ question: q.question, options: q.options.slice(0,4), correctAnswer: ca, marks: q.marks || 1, explanation: q.explanation || undefined });
    }

    if (append) {
      const existingSet = new Set((skill.mcqQuestions || []).map((qq:any) => qq.question.trim().toLowerCase()));
      const toAdd = valid.filter(q => !existingSet.has(q.question.trim().toLowerCase()));
      skill.mcqQuestions = [...(skill.mcqQuestions || []), ...toAdd];
    } else {
      skill.mcqQuestions = valid;
    }
    await skill.save();
    return NextResponse.json({ success: true, message: 'Saved', count: (skill.mcqQuestions||[]).length });
  } catch (e:any) {
    console.error('Failed save skill questions', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
