import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get("token")?.value;
    if (!cookie) return NextResponse.json({ purchased: false }, { status: 200 });
    const decoded = jwt.verify(cookie, process.env.TOKEN_SECRET!) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ purchased: false }, { status: 200 });
    return NextResponse.json({ purchased: !!user.purchases?.premium?.purchased, purchases: user.purchases || {} });
  } catch (err) {
    return NextResponse.json({ purchased: false }, { status: 200 });
  }
}
