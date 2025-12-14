import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import getUserFromRequest from "@/lib/getUserFromRequest";
import { SkillAttempt } from "@/models/skillModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) return NextResponse.json({ attempts: 0 });
    const count = await SkillAttempt.countDocuments({ userId: user._id });
    return NextResponse.json({ attempts: count });
  } catch (err) {
    return NextResponse.json({ attempts: 0 });
  }
}
