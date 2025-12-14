import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getToken";
import nodemailer from "nodemailer";

connect();

export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId).select("email fullName atsChecker");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.atsChecker = user.atsChecker || { used: 0, allowedByAdmin: false, requested: false };
    if (user.atsChecker.requested) return NextResponse.json({ success: true, message: "Request already sent" });

    user.atsChecker.requested = true;
    await user.save();

    // Send email to admins
    const adminEmails = (process.env.ADMINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const to = adminEmails.length ? adminEmails.join(",") : process.env.EMAIL_USER;
    if (!to) return NextResponse.json({ error: "No admin email configured" }, { status: 500 });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const domain = (process.env.DOMAIN || process.env.NEXT_PUBLIC_BASE_URL || "https://www.prepsutra.tech").replace(/\/$/, "");
    const adminLink = `${domain}/admin/admin-panel/ats-requests`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `[ATS Retry Request] ${user.email} requests ATS retry`,
      html: `<p>User <strong>${user.fullName || user.email}</strong> (${user.email}) has requested an ATS retry.</p>
             <p>Current usage: ${user.atsChecker.used || 0}</p>
             <p><a href="${adminLink}">Open ATS Requests</a> to review and allow.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Request sent to admins" });
  } catch (error: any) {
    console.error("Error requesting ATS retry:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

