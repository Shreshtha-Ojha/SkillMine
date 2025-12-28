import { NextRequest, NextResponse as NextResp } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import getUserFromRequest from "@/lib/getUserFromRequest";
import { getPricing } from "@/helpers/getPricing";

connect();

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) return NextResp.json({ error: 'Please login to make a purchase' }, { status: 401 });

    // If already purchased premium, return
    if (user.purchases?.premium?.purchased) { console.warn(`User ${user._id} attempted to create premium payment but already purchased`); return NextResp.json({ error: 'Already purchased', code: 'ALREADY_PURCHASED' }, { status: 400 }); }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.DOMAIN || "https://www.skillmine.tech")?.replace(/\/$/, "");
    const redirectUrl = `${baseUrl}/payment/verify?product=premium`;
    const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
    const webhookUrl = isLocalhost ? undefined : `${baseUrl}/api/payment/webhook`;

    const pricing = await getPricing();
    // Use global premium price
    const amount = pricing.premium || null;
    if (!amount) {
      return NextResp.json({ error: 'Premium price is not set by admin. Please contact the site administrator.' }, { status: 400 });
    }

    const bodyParams: Record<string, string> = {
      amount: String(amount),
      purpose: `PREMIUM_${user._id}`,
      buyer_name: user.fullName || user.username || 'Customer',
      email: user.email,
      redirect_url: redirectUrl,
      send_email: 'false',
      send_sms: 'false',
      allow_repeated_payments: 'false'
    };

    // Sanitize phone and include only when valid
    try {
      const { sanitizeIndianPhone } = await import('@/lib/phoneUtils');
      const phone = sanitizeIndianPhone(user.contactNumber || null);
      if (phone) bodyParams.phone = phone; else console.warn(`Skill-test create: omitting invalid phone for user ${user._id}`);
    } catch (e: any) {
      console.warn('Skill-test create: phone sanitizer failed', String(e?.message || e));
    }

    if (webhookUrl) bodyParams.webhook = webhookUrl;

    // Use fetch with timeout + retries
    const fetchWithTimeoutAndRetry = async (url: string, opts: any, timeoutMs = Number(process.env.PAYMENT_TIMEOUT_MS || 10000), retries = Number(process.env.PAYMENT_RETRIES || 2)) => {
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
    };

    let response;
    try {
      response = await fetchWithTimeoutAndRetry('https://www.instamojo.com/api/1.1/payment-requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Api-Key': process.env.INSTAMOJO_API_KEY!,
          'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN!
        },
        body: new URLSearchParams(bodyParams)
      });
    } catch (err:any) {
      console.error('Instamojo request failed after retries:', err?.message || err);
      const isAbort = String(err?.name || '').toLowerCase().includes('abort') || String(err?.message || '').toLowerCase().includes('timed out');
      return NextResp.json({ error: isAbort ? 'Payment provider timed out. Please try again.' : 'Failed to contact payment provider. Please try again.' }, { status: isAbort ? 504 : 502 });
    }

    let data: any;
    try { data = await response.json(); } catch (e) { const t = await response.text().catch(() => ''); data = { message: t || 'Invalid response' }; }
    if (!response.ok || !data.success) {
      console.error('Instamojo API error:', response.status, data);
      const msg = data?.message || data?.error || (typeof data === 'string' ? data : JSON.stringify(data).slice(0,500));
      return NextResp.json({ error: String(msg) }, { status: response.status || 500 });
    }

    return NextResp.json({ success: true, paymentUrl: data.payment_request.longurl, paymentRequestId: data.payment_request.id });
  } catch (err:any) {
    console.error('Skill test payment create failed', err);
    return NextResp.json({ error: 'Failed to create payment request' }, { status: 500 });
  }
}

