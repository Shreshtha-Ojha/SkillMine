import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import getUserFromRequest from '@/lib/getUserFromRequest';
import { getPricing } from '@/helpers/getPricing';

connect();

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) return NextResponse.json({ error: 'Please login to make a purchase' }, { status: 401 });

    // Get dynamic pricing
    const pricing = await getPricing();
    if (!pricing.premium) {
      return NextResponse.json({ error: 'Pricing is not configured. Please contact admin.' }, { status: 500 });
    }
    const amount = pricing.premium;

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.DOMAIN || "https://www.prepsutra.tech")?.replace(/\/$/, "");
    const redirectUrl = `${baseUrl}/payment/verify?product=premium`;
    const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    const webhookUrl = isLocalhost ? undefined : `${baseUrl}/api/payment/webhook`;

    const bodyParams: Record<string, string> = {
      amount: String(amount),
      purpose: `PREMIUM_${user._id}`,
      buyer_name: user.fullName || user.username || 'Customer',
      email: user.email,
      redirect_url: redirectUrl,
      send_email: 'false',
      send_sms: 'false',
      allow_repeated_payments: 'false',
    };

    if (webhookUrl) bodyParams.webhook = webhookUrl;

    const res = await fetch('https://www.instamojo.com/api/1.1/payment-requests/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Api-Key': process.env.INSTAMOJO_API_KEY!,
        'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN!,
      },
      body: new URLSearchParams(bodyParams),
    });

    const data = await res.json().catch(async () => ({ message: await res.text().catch(()=>"") }));
    if (!res.ok || !data.success) {
      return NextResponse.json({ error: data?.message || 'Failed to create payment' }, { status: res.status || 500 });
    }

    return NextResponse.json({ success: true, paymentUrl: data.payment_request.longurl, paymentRequestId: data.payment_request.id });
  } catch (err:any) {
    console.error('Error creating practice payment', err);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}