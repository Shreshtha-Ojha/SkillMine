import {NextRequest} from 'next/server'
import jwt from "jsonwebtoken";

// Returns user id string if token valid, otherwise null (no throw)
export const getDataFromToken = (request:NextRequest): string | null => {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return null;
        }
        const decodedToken:any = jwt.verify(token,process.env.TOKEN_SECRET!);
        return decodedToken.id;
    } catch (error:any) {
        // Log token errors for debugging but don't throw to avoid 500s
        console.warn("Token validation failed:", error?.message || error);
        return null;
    }
}