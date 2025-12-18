import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

connect();

async function verifyAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user || !user.isAdmin) return null;
    return user;
  } catch (err) {
    return null;
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 401 });

    const { id } = params;
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.purchases = user.purchases || {};
    user.purchases.premium = { purchased: false } as any;
    await user.save();

    return NextResponse.json({ success: true, message: 'Premium revoked' }, { status: 200 });
  } catch (error: any) {
    console.error('Error revoking premium:', error);
    return NextResponse.json({ error: 'Failed to revoke premium' }, { status: 500 });
  }
}