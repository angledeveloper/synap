import { NextRequest, NextResponse } from 'next/server';

export const runtime = "nodejs";

const { PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_BASE_URL } = process.env;

export async function POST(req: NextRequest) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    return NextResponse.json({
      error: "Missing PayPal environment variables",
      debug: {
        PAYPAL_CLIENT_ID: !!PAYPAL_CLIENT_ID,
        PAYPAL_SECRET: !!PAYPAL_SECRET,
        PAYPAL_BASE_URL,
      }
    }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { reportId, licenseType, currency, amount } = body;
    if (!reportId || !licenseType || !currency || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const baseURL = process.env.PAYPAL_BASE_URL || (process.env.NODE_ENV === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com');
    // 1. Get Auth token
    const basic = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const tokenRes = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return NextResponse.json({ error: 'Failed to auth PayPal', debug: text }, { status: 500 });
    }
    const { access_token } = await tokenRes.json();
    // 2. Create Order
    const orderRes = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: `${reportId}_${licenseType}`,
            amount: {
              currency_code: currency,
              value: parseFloat(amount).toFixed(2),
            },
          }
        ],
      }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      return NextResponse.json({ error: 'Failed to create order', debug: orderData }, { status: 500 });
    }
    return NextResponse.json({ orderID: orderData.id });
  } catch (e: any) {
    return NextResponse.json({ error: 'PayPal error', debug: e.message }, { status: 500 });
  }
}
