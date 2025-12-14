import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Skill from '@/models/skillModel';

connect();

export async function GET() {
  try {
    const skills = await Skill.find().select('title key mcqQuestions').lean();
    const data = skills.map(s => ({ _id: s._id, title: s.title, key: s.key, questionCount: (s.mcqQuestions || []).length }));
    return NextResponse.json({ success: true, skills: data });
  } catch (e:any) {
    console.error('Failed fetch skills', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
