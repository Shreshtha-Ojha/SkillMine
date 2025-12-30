import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from 'next/server';
import { getDataFromToken } from "@/helpers/getToken";

connect();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    if (!id) {
        return NextResponse.json(
            { error: "User ID required" },
            { status: 400 }
        );
    }

    // Get authenticated user (if any)
    const authenticatedUserId = getDataFromToken(request);

    // Check if user is requesting their own data
    const isOwnProfile = authenticatedUserId === id;

    const user = await User.findById(id).select("-password").lean();
    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    // If requesting own profile, return full data
    // Otherwise, return only public fields (for certificate display, etc.)
    if (isOwnProfile) {
        return NextResponse.json({ user });
    }

    // Return only public fields for other users
    const publicUser = {
        _id: (user as any)._id,
        username: (user as any).username,
        fullName: (user as any).fullName,
        profilePhoto: (user as any).profilePhoto,
    };

    return NextResponse.json({ user: publicUser });
}
