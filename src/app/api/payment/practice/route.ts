import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import { getPricing } from "@/helpers/getPricing";
import getUserFromRequest from '@/lib/getUserFromRequest';

connect();

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const cookieToken = request.cookies.get("token")?.value;
    const authHeader = request.headers.get("authorization");
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = cookieToken || headerToken;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ purchased: false, message: "Not authenticated" }, { status: 200 });
    const user = await User.findById(userId).select("purchases");
    if (!user) return NextResponse.json({ purchased: false, message: "User not found" }, { status: 200 });
    const purchased = user.purchases?.premium?.purchased || false;
    return NextResponse.json({ purchased, purchasedAt: user.purchases?.premium?.purchasedAt || null });
  } catch (err:any) {
    console.error('Error checking practice purchase', err);
    return NextResponse.json({ error: 'Failed to check purchase' }, { status: 500 });
  }
}

// POST - record successful payment
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const body = await request.json();
    const { paymentId, status, amount } = body;
    if (status !== 'success') return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });

    const pricing = await getPricing();

    const user = await User.findByIdAndUpdate(userId, {
      $set: {
        'purchases.premium': {
          purchased: true,
          purchasedAt: new Date(),
          paymentId: paymentId || `PREM_${Date.now()}`,
          amount: amount || pricing.premium,
        }
      }
    }, { new: true });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, purchased: true });
  } catch (err:any) {
    console.error('Error recording practice purchase', err);
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
  }
}
