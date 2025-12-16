import { NextResponse } from "next/server";
import InterviewExperience from "@/models/interviewExperienceModel";
import { connect } from "@/dbConfig/dbConfig";
import getUserFromRequest from "@/lib/getUserFromRequest";

export async function POST(req: Request) {
  await connect();
  try {
    const { expId } = await req.json();
    if (!expId) return NextResponse.json({ error: "Missing expId" }, { status: 400 });
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = user._id.toString();
    const exp = await InterviewExperience.findById(expId);
    if (!exp) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }
    // Support both legacy `likes` and new `upvotes` field. Prefer `upvotes` and keep `likes` in sync for compatibility.
    if (!exp.upvotes || !Array.isArray(exp.upvotes)) exp.upvotes = (exp.likes && Array.isArray(exp.likes)) ? exp.likes.slice() : [];
    const hasUpvoted = exp.upvotes.includes(userId);
    if (hasUpvoted) {
      exp.upvotes = exp.upvotes.filter((id: string) => id !== userId);
    } else {
      exp.upvotes.push(userId);
    }
    // Keep legacy likes in sync to avoid breaking older clients
    exp.likes = exp.upvotes.slice();
    await exp.save();

    return NextResponse.json({
      success: true,
      // backward compatible keys
      liked: !hasUpvoted,
      likesCount: exp.upvotes.length,
      // new keys for upvote semantics
      upvoted: !hasUpvoted,
      upvotesCount: exp.upvotes.length,
    });
  } catch (err) {
    console.error("exp-like error", err);
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}
