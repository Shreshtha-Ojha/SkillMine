import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { TestAttempt } from "@/models/roadmapTestModel";
import Roadmap from "@/models/roadmapModel";
import { getDataFromToken } from "@/helpers/getToken";
import nodemailer from "nodemailer";

connect();

export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { attemptId, roadmapId } = await request.json();

    if (!roadmapId && !attemptId) return NextResponse.json({ error: "roadmapId or attemptId required" }, { status: 400 });

    // find user and attempt
    const user = await User.findById(userId).select("email fullName");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let attempt = null;
    if (attemptId) attempt = await TestAttempt.findById(attemptId);
    if (!attempt && roadmapId) attempt = await TestAttempt.findOne({ userId, roadmapId, submittedAt: { $exists: true } });
    if (!attempt) return NextResponse.json({ error: "Submitted attempt not found" }, { status: 404 });

    const roadmap = await Roadmap.findById(attempt.roadmapId || roadmapId);

    // Admin recipients
    const adminEmails = (process.env.ADMINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const to = adminEmails.length ? adminEmails.join(",") : process.env.EMAIL_USER;
    if (!to) return NextResponse.json({ error: "No admin email configured" }, { status: 500 });

    // Send a concise email to admins
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const domain = (process.env.DOMAIN || process.env.NEXT_PUBLIC_BASE_URL || "https://www.skillmine.tech").replace(/\/$/, "");
    const adminLink = `${domain}/admin/admin-panel/tests`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `[Retry Request] ${user.email} requests retry for roadmap ${roadmap?.title || attempt.roadmapId}`,
      html: `<p>User <strong>${user.fullName || user.email}</strong> (${user.email}) has requested a retry for roadmap <strong>${roadmap?.roadmapTitle || roadmap?.title || attempt.roadmapId}</strong>.</p>
             <p>Attempt ID: ${attempt._id}</p>
             <p><a href="${adminLink}">Open Admin Test Management</a> to allow retry.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Retry request sent to admins" });
  } catch (error) {
    console.error("Error requesting retry:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
