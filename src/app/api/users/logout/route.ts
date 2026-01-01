import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs"
import {NextResponse,NextRequest} from 'next/server'
import jwt from "jsonwebtoken";

connect();

export async function GET(request:NextRequest) {
    try {
        const response = NextResponse.json({
            message:"Logout succesfully",
            success: true
        })   
        
        response.cookies.set("token","",{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(0),
            path: "/",
        })

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : "An error occurred";
        return NextResponse.json({error: message},{status: 500})
    } 
}