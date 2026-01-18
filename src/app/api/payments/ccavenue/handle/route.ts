import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/ccavenue';
import qs from 'querystring';

export const runtime = "nodejs";

const { CCAVENUE_WORKING_KEY } = process.env;

export async function POST(req: NextRequest) {
    try {
        // CCAvenue sends data as Form Data (application/x-www-form-urlencoded)
        const formData = await req.formData();
        const encResp = formData.get('encResp') as string;

        if (!encResp || !CCAVENUE_WORKING_KEY) {
            return NextResponse.redirect(`${req.nextUrl.origin}/checkout?error=Payment response invalid`);
        }

        // Decrypt
        const decrypted = decrypt(encResp, CCAVENUE_WORKING_KEY as string);
        const data = qs.parse(decrypted);

        // Order Status
        // Success, Failure, Aborted, Invalid
        const orderStatus = data.order_status;
        const orderId = data.order_id as string;
        const trackingId = data.tracking_id as string; // CCAvenue ref

        const returnUrl = data.merchant_param1 as string || `${req.nextUrl.origin}/checkout`;

        // You might want to update your DB here with the status
        // await updateOrderStatus(orderId, orderStatus, trackingId, data);

        if (orderStatus === 'Success') {
            // Redirect to success page
            return NextResponse.redirect(`${returnUrl}?orderId=${orderId}&status=success&transactionId=${trackingId}`);
        } else {
            // Redirect to failure/checkout page
            return NextResponse.redirect(`${returnUrl}?error=Payment_${orderStatus}`);
        }

    } catch (error: any) {
        console.error("CCAvenue Handle Error:", error);
        return NextResponse.redirect(`${req.nextUrl.origin}/checkout?error=Server Error`);
    }
}
