import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import getUserFromRequest from "@/lib/getUserFromRequest";

connect();

export async function POST(request: NextRequest) {
  try {
    const admin = await getUserFromRequest(request as any);
    if (!admin || !admin.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.atsChecker = user.atsChecker || { used: 0, allowedByAdmin: false, requested: false };
    user.atsChecker.allowedByAdmin = true;
    user.atsChecker.requested = false;
    await user.save();

    return NextResponse.json({ success: true, message: 'User allowed a retry', user: { email: user.email, fullName: user.fullName, atsChecker: user.atsChecker } });
  } catch (error) {
    console.error('Failed to approve ATS request', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
