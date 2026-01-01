import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from 'next/server';
import { getDataFromToken } from "@/helpers/getToken";

connect();

export const dynamic = 'force-dynamic'; // Tell Next.js this is a dynamic route

export async function GET(request: NextRequest) {
    try {
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required", success: false },
                { status: 401 }
            );
        }
        const user = await User.findById(userId).select("-password").lean();
        if (!user) {
            return NextResponse.json(
                { error: "Invalid Token", success: false },
                { status: 400 }
            );
        }
        
        // Dynamic admin check using env variable
        const adminEmails = process.env.ADMINS ? process.env.ADMINS.split(",").map(e => e.trim().toLowerCase()) : [];
        const userEmail = (user as any).email?.trim().toLowerCase() || "";
        const isAdmin = adminEmails.includes(userEmail) || (user as any).isAdmin === true;
        
        return NextResponse.json(
            { message: "User Found", user: { ...user, isAdmin } },
            { status: 200 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Authentication required";
        return NextResponse.json(
            { error: message, success: false },
            { status: 401 }
        );
    }
}
