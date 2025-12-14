import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import getUserFromRequest from '@/lib/getUserFromRequest';
import User from '@/models/userModel';

connect();

export async function PUT(req: Request) {
  try {
    const admin = await getUserFromRequest(req);
    if (!admin || !admin.isAdmin) return NextResponse.json({ error: 'admin required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { userId, allow } = body;
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

    user.atsChecker = user.atsChecker || {};
    user.atsChecker.allowedByAdmin = !!allow;
    if (allow) {
      user.atsChecker.requested = false;
    }
    await user.save();

    return NextResponse.json({ success: true, user: { id: user._id, atsChecker: user.atsChecker } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
