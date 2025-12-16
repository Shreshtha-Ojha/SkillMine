import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import { getPricing } from "@/helpers/getPricing";

connect();

// Helper to get user ID from request
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const cookieToken = request.cookies.get("token")?.value;
    const authHeader = request.headers.get("authorization");
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    
    const token = cookieToken || headerToken;
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
}

// POST - Create payment request for mock interviews subscription
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already subscribed
    if (user.purchases?.mockInterviews?.purchased) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Get dynamic pricing
    const pricing = await getPricing();

    // Create Instamojo payment request
    const redirectUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/payment/verify-mock-interviews`;

    // Use fetch with timeout + retries for robustness
    async function fetchWithTimeoutAndRetry(url: string, opts: any, timeoutMs = Number(process.env.PAYMENT_TIMEOUT_MS || 10000), retries = Number(process.env.PAYMENT_RETRIES || 2)) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(url, { ...opts, signal: controller.signal });
          clearTimeout(timer);
          return res;
        } catch (err: any) {
          clearTimeout(timer);
          const isLast = attempt === retries;
          console.warn(`Instamojo request attempt ${attempt + 1} failed`, err?.message || err);
          if (isLast) throw err;
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        }
      }
      throw new Error('Failed to reach Instamojo');
    }

    let response;
    try {
      response = await fetchWithTimeoutAndRetry("https://www.instamojo.com/api/1.1/payment-requests/", {
        method: "POST",
        headers: {
          "X-Api-Key": process.env.INSTAMOJO_API_KEY!,
          "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: (() => {
          const params: Record<string,string> = {
            purpose: `MOCK_INTERVIEWS_${userId}`,
            amount: String(pricing.mockInterviews),
            buyer_name: user.username || user.fullName || "User",
            email: user.email,
            redirect_url: redirectUrl,
            allow_repeated_payments: "false",
          };
          try {
            // include sanitized phone only when valid
            const { sanitizeIndianPhone } = require('@/lib/phoneUtils');
            const phone = sanitizeIndianPhone(user.contactNumber || null);
            if (phone) params.phone = phone; else console.warn(`Mock-interviews create: omitting invalid phone for user ${userId}`);
          } catch (e) {
            console.warn('Mock-interviews create: phone sanitizer failed', String(e?.message || e));
          }
          return new URLSearchParams(params);
        })(),
      });
    } catch (err:any) {
      console.error("Instamojo request failed:", err?.message || err);
      const isAbort = String(err?.name || '').toLowerCase().includes('abort') || String(err?.message || '').toLowerCase().includes('timed out');
      return NextResponse.json({ error: isAbort ? 'Payment provider timed out. Please try again.' : 'Failed to contact payment provider. Please try again.' }, { status: isAbort ? 504 : 502 });
    }

    let data: any;
    try { data = await response.json(); } catch (e) { const t = await response.text().catch(()=> ''); data = { message: t || 'Invalid response' }; }
    if (!response.ok || !data.success) {
      console.error("Instamojo error:", response.status, data);
      const errorMessage = data?.message || data?.error || (typeof data === 'string' ? data : JSON.stringify(data).slice(0,500));
      return NextResponse.json({ error: String(errorMessage) }, { status: response.status || 500 });
    }

    return NextResponse.json({
      success: true,
      paymentUrl: data.payment_request.longurl,
      paymentRequestId: data.payment_request.id,
    });
  } catch (error: any) {
    console.error("Error creating payment request:", error);
    return NextResponse.json(
      { error: "Failed to create payment request" },
      { status: 500 }
    );
  }
}
