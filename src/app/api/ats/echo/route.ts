import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      return NextResponse.json({ received: body });
    }
    const text = await req.text().catch(() => '');
    return NextResponse.json({ receivedRaw: text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'echo failed' }, { status: 500 });
  }
}
