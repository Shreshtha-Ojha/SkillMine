import {connect} from "@/dbConfig/dbConfig";
import { sendEmail } from "@/helpers/mailer";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs"
import {NextResponse,NextRequest} from 'next/server'
import { allowRequest } from "@/lib/server/rateLimiter";

connect();

export async function POST(request:NextRequest){
    try {
        // Rate limiting: 5 signups per IP per minute
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                   request.headers.get("x-real-ip") ||
                   "unknown";
        if (!allowRequest(`signup:${ip}`, 5, 60_000)) {
            return NextResponse.json(
                { error: "Too many signup attempts. Please try again later." },
                { status: 429 }
            );
        }

        const reqBody = await request.json();
        const {username,email,password} = reqBody;

        // Input validation
        if(!email || !password || !username){
            return NextResponse.json({error: "Please provide all required fields (username, email, password)"},{status:400});
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return NextResponse.json({error: "Please provide a valid email address"},{status:400});
        }

        // Password strength validation
        if(password.length < 8){
            return NextResponse.json({error: "Password must be at least 8 characters long"},{status:400});
        }
        // Check for password complexity
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if(!hasUppercase || !hasLowercase || !hasNumber){
            return NextResponse.json({error: "Password must contain at least one uppercase letter, one lowercase letter, and one number"},{status:400});
        }

        // Username validation - alphanumeric and underscore only, 3-30 chars
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        if(!usernameRegex.test(username)){
            return NextResponse.json({error: "Username must be 3-30 characters and contain only letters, numbers, and underscores"},{status:400});
        }

        // Check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return NextResponse.json({error: "An account with this email already exists. Please login instead."},{status:400});
        }

        // Check if username is taken
        const existingUsername = await User.findOne({username});
        if(existingUsername){
            return NextResponse.json({error: "This username is already taken. Please choose another one."},{status:400});
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedpassword = await bcryptjs.hash(password,salt);

        // Admin check using env variable
        const adminEmails = process.env.ADMINS ? process.env.ADMINS.split(",") : [];
        const isAdmin = adminEmails.includes(email);
        const newUser = new User({
            username,
            email,
            password: hashedpassword,
            isAdmin,
        })

        const savedUser = await newUser.save();

        try {
            await sendEmail({email,emailType: "VERIFY",userId: savedUser._id});
            return NextResponse.json({
                message:"Account created successfully! Please check your email to verify your account.",
                success:true,
                savedUser
            });
        } catch (emailError: any) {
            console.error("❌ Failed to send verification email:", emailError);
            // User is created but email failed - inform them to resend verification
            return NextResponse.json({
                message: "Account created successfully, but we couldn't send the verification email. Please use 'Resend Verification' to try again.",
                success: true,
                emailFailed: true,
                savedUser
            });
        }

    } catch (error) {
        console.error("❌ Signup error:", error);

        // Handle specific MongoDB errors
        if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
            return NextResponse.json({error: "An account with this email or username already exists"},{status: 400});
        }

        // Handle network/connection errors
        if (error instanceof Error && (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError')) {
            return NextResponse.json({error: "Database connection failed. Please try again later."},{status: 503});
        }

        return NextResponse.json({error: "An unexpected error occurred during registration. Please try again."},{status: 500})
    }
}