import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import { getPricing } from "@/helpers/getPricing";

connect();

import getUserFromRequest from '@/lib/getUserFromRequest';

// (we now use shared getUserFromRequest)
async function debugGetUser(request: NextRequest) {
  const user = await getUserFromRequest(request as unknown as Request);
  if (!user) {
    // Helpful debug info in dev — do not log tokens, just presence
    const cookiePresent = !!request.cookies.get('token');
    const authHeader = request.headers.get('authorization');
    console.warn(`Payment create-request: unauthenticated request. cookiePresent=${cookiePresent}, hasAuthHeader=${!!authHeader}`);
  }
  return user;
}

// POST - Create a payment request
export async function POST(request: NextRequest) {
  try {
    const user = await debugGetUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Please login to make a purchase" },
        { status: 401 }
      );
    }

    // Check if already purchased premium
    if (user.purchases?.premium?.purchased) {
      console.warn(`User ${user._id} attempted to create premium payment but already purchased`);
      return NextResponse.json(
        { error: "You have already purchased Premium access", code: "ALREADY_PURCHASED" },
        { status: 400 }
      );
    }

    // Determine redirect URL based on environment
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.DOMAIN || "https://skillminelearn.vercel.app")?.replace(/\/$/, "");
    const redirectUrl = `${baseUrl}/payment/verify?product=premium`;
    
    // Webhook only works with public URLs (not localhost)
    const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    const webhookUrl = isLocalhost ? undefined : `${baseUrl}/api/payment/webhook`;

    // Get dynamic pricing
    const pricing = await getPricing();

    // Build request body
    if (pricing.premium == null) {
      console.error("Pricing for premium is not set");
      return NextResponse.json(
        { error: "Pricing for premium is not available. Please try again later." },
        { status: 500 }
      );
    }
    const bodyParams: Record<string, string> = {
      amount: pricing.premium.toString(), // Dynamic pricing from admin panel
      purpose: `PREMIUM_${user._id}`,
      buyer_name: user.fullName || user.username || "Customer",
      email: user.email,
      redirect_url: redirectUrl,
      send_email: "false",
      send_sms: "false",
      allow_repeated_payments: "false",
    }; 

    // Sanitize phone number; only include if valid (avoid provider 400 on invalid formats)
    try {
      const { sanitizeIndianPhone } = await import('@/lib/phoneUtils');
      const phone = sanitizeIndianPhone(user.contactNumber || null);
      if (phone) {
        bodyParams.phone = phone;
      } else {
        console.warn(`Payment create-request: omitting invalid phone for user ${user._id}`);
      }
    } catch (e) {
      // non-fatal - continue without phone
      console.warn('Payment create-request: phone sanitizer failed', String((e as any)?.message || e));
    }

    // Only add webhook if not localhost
    if (webhookUrl) {
      bodyParams.webhook = webhookUrl;
    }

    // Helper: fetch with timeout + retries
    const fetchWithTimeoutAndRetry = async (
      url: string,
      opts: any,
      timeoutMs = Number(process.env.PAYMENT_TIMEOUT_MS || 10000),
      retries = Number(process.env.PAYMENT_RETRIES || 2)
    ) => {
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
          // backoff before retry
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        }
      }
      throw new Error('Failed to reach Instamojo');
    };

    // Create payment request using API Key + Auth Token (with timeout and retries)
    let response;
    try {
      response = await fetchWithTimeoutAndRetry("https://www.instamojo.com/api/1.1/payment-requests/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Api-Key": process.env.INSTAMOJO_API_KEY!,
          "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN!,
        },
        body: new URLSearchParams(bodyParams),
      });
    } catch (err: any) {
      console.error("Instamojo request failed after retries:", err?.message || err);
      const isAbort = String(err?.name || '').toLowerCase().includes('abort') || String(err?.message || '').toLowerCase().includes('timed out');
      return NextResponse.json({ error: isAbort ? 'Payment provider timed out. Please try again.' : 'Failed to contact payment provider. Please try again.' }, { status: isAbort ? 504 : 502 });
    }

    // Parse response body safely
    let data: any;
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text().catch(() => '');
      data = { message: text || 'Invalid response from payment provider' };
    }

    if (!response.ok || !data.success) {
      console.error("Instamojo API error:", response.status, data);
      const message = data?.message || data?.error || (typeof data === 'string' ? data : JSON.stringify(data).slice(0, 500));
      return NextResponse.json({ error: String(message) }, { status: response.status || 500 });
    }

    // Return the payment URL
    return NextResponse.json({
      success: true,
      paymentUrl: data.payment_request.longurl,
      paymentRequestId: data.payment_request.id,
    });

  } catch (error) {
    console.error("Error creating payment request:", error);
    return NextResponse.json(
      { error: "Failed to create payment request" },
      { status: 500 }
    );
  }
}
