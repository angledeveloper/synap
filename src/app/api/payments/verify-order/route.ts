import { NextRequest, NextResponse } from 'next/server';


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
    const { orderID, reportId, licenseType, amount, currency } = body;
    if (!orderID || !reportId || !licenseType || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
  
    const baseURL = process.env.PAYPAL_BASE_URL || (process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com');

    // 1. Get Bearer token
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
    // 2. Fetch order details
    const orderRes = await fetch(`${baseURL}/v2/checkout/orders/${orderID}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${access_token}` },
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch order', debug: orderData }, { status: 500 });
    }
    // Check completion & amount
    const isComplete = orderData.status === 'COMPLETED';
    const pu = orderData.purchase_units && orderData.purchase_units[0];
    const paidAmount = pu?.amount?.value;
    const paidCurrency = pu?.amount?.currency_code;
    if (!isComplete || paidAmount !== `${parseFloat(amount).toFixed(2)}` || paidCurrency !== currency) {
      return NextResponse.json({
        error: 'Order is not completed or amount/currency mismatch',
        isComplete,
        paidAmount,
        paidCurrency,
        debug: orderData
      }, { status: 400 });
    }
    // Mock log/store for demo
    console.log('ORDER VERIFICATION:', {
      orderID,
      reportId,
      licenseType,
      amount,
      currency,
      payer: orderData.payer,
      time: orderData.update_time || Date.now(),
    });
    return NextResponse.json({ valid: true, orderID, payer: orderData.payer });
  } catch (e: any) {
    return NextResponse.json({ error: 'PayPal error', debug: e.message }, { status: 500 });
  }
}
