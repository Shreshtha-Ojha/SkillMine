import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Skill from '@/models/skillModel';
import getUserFromRequest from '@/lib/getUserFromRequest';

export const dynamic = 'force-dynamic';

connect();

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user || !user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description } = await request.json();
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

    // generate slug key from title and ensure uniqueness
    const slugify = (t: string) => t.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let keyBase = slugify(title) || `skill-${Date.now().toString(36)}`;
    let key = keyBase;
    let counter = 1;
    while (await Skill.findOne({ key })) {
      key = `${keyBase}-${counter}`;
      counter += 1;
    }

    const s = await Skill.create({ key, title, description, mcqQuestions: [] });
    return NextResponse.json({ success: true, skill: s });
  } catch (e:any) {
    console.error('Failed create skill', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user || !user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { skillId } = await request.json();
    if (!skillId) return NextResponse.json({ error: 'skillId required' }, { status: 400 });

    const skill = await Skill.findById(skillId);
    if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });

    await Skill.deleteOne({ _id: skillId });
    return NextResponse.json({ success: true, message: 'Skill deleted' });
  } catch (e:any) {
    console.error('Failed delete skill', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
