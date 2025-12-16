import jwt from "jsonwebtoken";
import User from "@/models/userModel";

export default async function getUserFromRequest(req: Request) {
  try {
    // Try Authorization header first (Bearer token) then fall back to cookie
    const authHeader = req.headers?.get?.('authorization');
    let token: string | undefined;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }

    if (!token) {
      const cookieHeader = req.headers?.get?.('cookie') || '';
      const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
      token = match?.[1];
    }

    if (!token) {
      console.warn('getUserFromRequest: no auth token found in Authorization header or cookies');
      return null;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(decodeURIComponent(token), process.env.TOKEN_SECRET!) as { id: string };
    } catch (err) {
      console.warn('getUserFromRequest: token verification failed', String(err?.message || err));
      return null;
    }

    if (!decoded?.id) return null;
    const user = await User.findById(decoded.id);
    return user;
  } catch (err) {
    console.error('getUserFromRequest unexpected error', err);
    return null;
  }
}
