import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/ccavenue';
import qs from 'querystring';

export const runtime = "nodejs";

// Env vars provided by user later
const { CCAVENUE_MERCHANT_ID, CCAVENUE_ACCESS_CODE, CCAVENUE_WORKING_KEY } = process.env;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            orderId,
            currency,
            amount,
            billing_name,
            billing_address,
            billing_city,
            billing_state,
            billing_zip,
            billing_country,
            billing_tel,
            billing_email
        } = body;

        if (!CCAVENUE_MERCHANT_ID || !CCAVENUE_ACCESS_CODE || !CCAVENUE_WORKING_KEY) {
            return NextResponse.json({
                error: "Missing CCAvenue credentials",
                // remove debug in production
                debug: {
                    merchant: !!CCAVENUE_MERCHANT_ID,
                    access: !!CCAVENUE_ACCESS_CODE,
                    key: !!CCAVENUE_WORKING_KEY
                }
            }, { status: 500 });
        }

        // Redirect URLs (Callback from CCAvenue)
        // Adjust domain based on req.url or environment
        const origin = req.nextUrl.origin;
        const redirect_url = `${origin}/api/payments/ccavenue/handle`;
        const cancel_url = `${origin}/api/payments/ccavenue/handle`;

        const paymentData = {
            merchant_id: CCAVENUE_MERCHANT_ID,
            order_id: orderId,
            currency: currency,
            amount: amount,
            redirect_url: redirect_url,
            cancel_url: cancel_url,
            language: 'EN',
            billing_name,
            billing_address,
            billing_city,
            billing_state,
            billing_zip,
            billing_country,
            billing_tel,
            billing_email,
            merchant_param1: body.return_url, // URL to redirect back to
            // Add other optional fields if needed: delivery_*, merchant_param1, etc.
        };

        // Convert to query string
        const stringData = qs.stringify(paymentData);

        // Encrypt
        const encRequest = encrypt(stringData, CCAVENUE_WORKING_KEY);

        return NextResponse.json({
            encRequest,
            access_code: CCAVENUE_ACCESS_CODE,
            // Using Production Environment
            action: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
        });

    } catch (error: any) {
        console.error("CCAvenue Initiate Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
