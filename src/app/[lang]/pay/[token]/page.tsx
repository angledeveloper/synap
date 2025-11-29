"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from 'swr';
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import BillingForm from "@/components/checkout/BillingForm";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import { codeToId } from "@/lib/utils";
import { ReportData } from "@/types/checkout";

const fetchCheckoutData = async (lang: string) => {
    const languageId = codeToId[lang as keyof typeof codeToId] || 1;

    const res = await fetch(`https://dashboard.synapseaglobal.com/api/checkout/${languageId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) throw new Error('Failed to fetch checkout data');
    return res.json();
};

const fetchTokenData = async (token: string) => {
    const res = await fetch(`https://dashboard.synapseaglobal.com/api/custom-payment/${token}`);
    if (!res.ok) throw new Error('Failed to fetch token data');
    return res.json();
};

export default function CustomPaymentPage() {
    const params = useParams<{ lang: string; token: string }>();
    const [successData, setSuccessData] = useState<any>(null);

    const { data: tokenResponse, error: tokenError, isLoading: tokenLoading } = useSWR(
        params.token ? ['custom-payment', params.token] : null,
        () => fetchTokenData(params.token)
    );

    const { data: checkoutApi, error: checkoutApiError } = useSWR(
        params.lang ? ['checkout-api', params.lang] : null,
        () => fetchCheckoutData(params.lang)
    );

    const { checkout_page, billing_information, bill_info_order_summary, order_confirmation } = checkoutApi || {};

    if (tokenLoading || !checkoutApi) {
        return (
            <div className="min-h-screen bg-white pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
                    </div>
                </div>
            </div>
        );
    }

    if (tokenError || !tokenResponse?.status) {
        return (
            <div className="min-h-screen bg-white pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or expired payment link</h1>
                        <p className="text-gray-600">The link you followed is invalid or has expired.</p>
                    </div>
                </div>
            </div>
        );
    }

    const tokenData = tokenResponse.data;

    // Helper to generate a unique numeric ID from a string (token)
    const stringToNumber = (str: string) => {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    };

    // Construct ReportData for header
    const reportData: ReportData = {
        id: stringToNumber(params.token), // Unique ID derived from token
        title: tokenData.report_title,
        subtitle: "",
        report_id: "", // Placeholder
        format: "", // Placeholder
        industry: "", // Placeholder
        pages: 0,
        last_updated: new Date().toISOString(),
        image: "", // Placeholder
        report_reference_title: tokenData.report_title
    };

    const safeParseFloat = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseFloat(String(val).replace(/,/g, ''));
    };

    // Construct CustomPricing for BillingForm
    const customPricing = {
        amount: safeParseFloat(tokenData.amount),
        currency: tokenData.currency,
        licenseType: tokenData.license_type,
        igst: safeParseFloat(tokenData.igst),
        cgst: safeParseFloat(tokenData.cgst),
        sgst: safeParseFloat(tokenData.sgst),
        total: safeParseFloat(tokenData.amount) + safeParseFloat(tokenData.igst) + safeParseFloat(tokenData.cgst) + safeParseFloat(tokenData.sgst)
    };

    const handleOrderSuccess = (orderData: any) => {
        setSuccessData(orderData);
    };

    const handleCloseSuccess = () => {
        setSuccessData(null);
        // Maybe redirect or reload?
    };

    return (
        <div className="min-h-screen bg-white pt-20">
            <div className="w-full max-w-[1352px] mx-auto px-4 sm:px-6 py-0">

                {/* Checkout Header */}
                <div className="w-full mt-6">
                    <CheckoutHeader report={reportData} />
                </div>

                {/* Main Content Area */}
                <div className="w-full mt-8">
                    <div className="bg-[#F4F4F4] w-full pb-8 border-t border-black">
                        {successData ? (
                            <div className="pt-8">
                                <OrderConfirmation
                                    orderId={successData?.orderId || ''}
                                    transactionId={successData?.transactionId || ''}
                                    paymentMethod={successData?.paymentMethod || 'PayPal'}
                                    purchaseDate={successData?.purchaseDate || ''}
                                    reportTitle={successData?.reportTitle || ''}
                                    licenseType={successData?.licenseType || ''}
                                    originalPrice={Number(successData?.originalPrice || 0)}
                                    discountAmount={Number(successData?.discountAmount || 0)}
                                    subtotal={Number(successData?.subtotal || 0)}
                                    customerEmail={successData?.customerEmail || ''}
                                    onDownloadInvoice={() => { }}
                                    onCallAnalyst={() => { }}
                                    onClose={handleCloseSuccess}
                                    orderConfirmation={order_confirmation}
                                    invoiceFile={successData?.invoiceFile}
                                    invoiceId={successData?.invoiceId}
                                />
                            </div>
                        ) : (
                            <BillingForm
                                selectedLicense={{
                                    id: customPricing.licenseType.toLowerCase().includes('team') ? 'team' : customPricing.licenseType.toLowerCase().includes('enterprise') ? 'enterprise' : 'single',
                                    title: customPricing.licenseType,
                                    description: "",
                                    price: String(customPricing.amount),
                                    actualPrice: String(customPricing.amount),
                                    currencySymbol: customPricing.currency === 'USD' ? '$' : customPricing.currency === 'EUR' ? '€' : '₹',
                                    discount: 0,
                                    features: [],
                                    disclaimer: "",
                                    icon: "",
                                    discountPercent: "0",
                                    buyButtonText: "",
                                    buyButtonIcon: "",
                                    highlight: false,
                                    disclaimerHeading: "",
                                    mostPopularText: ""
                                }}
                                reportData={reportData}
                                onContinue={() => { }}
                                onBack={() => { }}
                                billingInformation={billing_information}
                                billInfoOrderSummary={bill_info_order_summary}
                                licenseOptions={[]} // Not needed for custom flow
                                checkoutPage={checkout_page}
                                onOrderSuccess={handleOrderSuccess}
                                oneTimePurchaseText={bill_info_order_summary?.one_time_purchase}
                                offerCodePlaceholder={bill_info_order_summary?.have_offer_placeholder}
                                languageId={Number(codeToId[params.lang as keyof typeof codeToId] || 1)}
                                customPricing={customPricing}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
