import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/dbConfig/dbConfig';
import PricingSettings from '@/models/pricingSettingsModel';
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

    const all = await PricingSettings.find({}).lean();
    return NextResponse.json({ success: true, count: all.length, data: all }, { status: 200 });
  } catch (error) {
    console.error('Debug pricing endpoint error:', error);
    return NextResponse.json({ error: 'Failed to retrieve pricing docs' }, { status: 500 });
  }
}