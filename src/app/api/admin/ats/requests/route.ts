import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import getUserFromRequest from "@/lib/getUserFromRequest";

export const dynamic = 'force-dynamic';

connect();

export async function GET(request: NextRequest) {
  try {
    const admin = await getUserFromRequest(request as any);
    if (!admin || !admin.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const users = await User.find({ 'atsChecker.requested': true }).select('email fullName atsChecker');
    return NextResponse.json({ success: true, requests: users });
  } catch (error) {
    console.error('Failed to fetch ATS requests', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
