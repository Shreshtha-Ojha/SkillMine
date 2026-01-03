import User from '@/models/userModel';
import nodemailer from 'nodemailer';
import bcryptjs from "bcryptjs";

interface SendEmailParams {
    email: string;
    emailType: "VERIFY" | "RESET";
    userId: string;
}

export const sendEmail = async ({ email, emailType, userId }: SendEmailParams) => {
    try {
        // Hash the userId as a token
        const hashedToken = (await bcryptjs.hash(userId.toString(), 10)).replace(/[^a-zA-Z0-9]/g, '');

        // Update the user with appropriate token and expiry
        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId, {
                verifyToken: hashedToken,
                verifyTokenExpiry: Date.now() + 3600000, // 1 hour expiry
            });
        }

        // Create a transport instance for sending emails
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });


// Get domain from environment variable with fallback (prefer NEXTAUTH_URL for consistency)
const domain = (process.env.NEXTAUTH_URL || process.env.DOMAIN || process.env.NEXT_PUBLIC_BASE_URL || "https://skillminelearn.vercel.app")?.replace(/\/$/, "");

const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: email, 
    subject: emailType === "VERIFY" ? "Verify Your Email with SkillMine" : "Reset Your Password on SkillMine", // Email subject
    html: `
        <div style="background-color: #E1D4C1; color: #222; padding: 20px; font-family: Georgia, 'Times New Roman', serif;">
            <div style="max-width: 600px; margin: auto; background-color: #F6F0EB; border-radius: 10px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06);">
                <div style="padding: 24px; text-align: center; background-color: #7E102C; color: #E1D4C1;">
                    <h1 style="font-size: 28px; margin: 0;">SkillMine</h1>
                    <p style="font-size: 14px; margin: 6px 0 0; opacity: 0.9;">Curated learning for thoughtful engineers.</p>
                </div>
                <div style="padding: 24px; text-align: left; color: #222;">
                    <h2 style="color: #7E102C; font-size: 20px; margin-bottom: 10px;">
                        ${emailType === "VERIFY" ? "Verify Your Email" : "Reset Your Password"}
                    </h2>
                    <p style="font-size: 15px; color: #333; margin-bottom: 18px; line-height: 1.6;">
                        We're glad you're here. Click the button below to ${emailType === 'VERIFY' ? 'verify your email' : 'reset your password'} and continue exploring SkillMine.
                    </p>
                    <div style="text-align: center; margin: 18px 0;">
                        <a href="${domain}/auth/${emailType === 'VERIFY' ? 'verifyemail' : 'resetpassword'}?token=${hashedToken}"
                           style="display: inline-block; text-decoration: none; color: #E1D4C1; background: #7E102C; 
                                  padding: 12px 22px; font-size: 16px; border-radius: 6px; font-weight: bold;">
                            ${emailType === 'VERIFY' ? 'Verify Now' : 'Reset Password'}
                        </a>
                    </div>
                    <p style="color: #666; font-size: 13px; margin-top: 10px;">
                        This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
                <div style="padding: 18px; text-align: center; background-color: #EDE4DF; color: #58423F; font-size: 13px;">
                    <p style="margin: 0;">Made with care by the SkillMine Team</p>
                    <p style="margin: 4px 0 0; color: #777;">Explore knowledge, shape the future.</p>
                </div>
            </div>
        </div>
    `, 
};


        // Send the email
        const mailResponse = await transporter.sendMail(mailOptions);
        return mailResponse;
    } catch (error: any) {
        console.error("❌ Email sending failed:", error);
        throw new Error(error.message);
    }
};
