import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 401 });

    const users = await User.find({ 'purchases.premium.purchased': true }).select('-password').lean();

    // Map to minimal payload
    const payload = users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email,
      fullName: u.fullName || null,
      premiumPurchasedAt: u.purchases?.premium?.purchasedAt || null,
      createdAt: u.createdAt,
      isAdmin: u.isAdmin || false,
    }));

    return NextResponse.json({ success: true, count: payload.length, users: payload }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching premium users:', error);
    return NextResponse.json({ error: 'Failed to fetch premium users' }, { status: 500 });
  }
}