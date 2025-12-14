import { NextRequest, NextResponse as NextResp } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import getUserFromRequest from "@/lib/getUserFromRequest";
import { getPricing } from "@/helpers/getPricing";

connect();

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) return NextResp.json({ error: 'Please login to make a purchase' }, { status: 401 });

    // If already purchased, return
    if (user.purchases?.skillTestPremium?.purchased) return NextResp.json({ error: 'Already purchased' }, { status: 400 });

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.DOMAIN || "https://www.prepsutra.tech")?.replace(/\/$/, "");
    const redirectUrl = `${baseUrl}/payment/verify`;
    const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
    const webhookUrl = isLocalhost ? undefined : `${baseUrl}/api/payment/webhook`;

    const pricing = await getPricing();
    // Ensure admin has set skill test price
    const amount = pricing.skillTestPremium ?? null;
    if (!amount) {
      return NextResp.json({ error: 'Skill Test Premium price is not set by admin. Please contact the site administrator.' }, { status: 400 });
    }

    const bodyParams: Record<string, string> = {
      amount: String(amount),
      purpose: `SKILL_TEST_PREMIUM_${user._id}`,
      buyer_name: user.fullName || user.username || 'Customer',
      email: user.email,
      phone: user.contactNumber || '9999999999',
      redirect_url: redirectUrl,
      send_email: 'false',
      send_sms: 'false',
      allow_repeated_payments: 'false'
    };

    if (webhookUrl) bodyParams.webhook = webhookUrl;

    const response = await fetch('https://www.instamojo.com/api/1.1/payment-requests/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Api-Key': process.env.INSTAMOJO_API_KEY!,
        'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN!
      },
      body: new URLSearchParams(bodyParams)
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      console.error('Instamojo API error:', data);
      return NextResp.json({ error: data.message || 'Failed to create payment request' }, { status: 500 });
    }

    return NextResp.json({ success: true, paymentUrl: data.payment_request.longurl, paymentRequestId: data.payment_request.id });
  } catch (err:any) {
    console.error('Skill test payment create failed', err);
    return NextResp.json({ error: 'Failed to create payment request' }, { status: 500 });
  }
}

