"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguageStore } from "@/store";
import { codeToId } from "@/lib/utils";
import { useReportDetail } from "@/hooks/useReportDetail";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import LicenseGrid from "@/components/checkout/LicenseGrid";
import BillingForm, { BillingFormProps } from "@/components/checkout/BillingForm";
import PaymentModal from "@/components/checkout/PaymentModal";
import SuccessModal from "@/components/checkout/SuccessModal";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import Disclaimer from "@/components/checkout/Disclaimer";
import StepIndicator from "@/components/checkout/StepIndicator";
import CurrencySelector from "@/components/checkout/CurrencySelector";
import SupportFooter from "@/components/checkout/SupportFooter";
import { initiatePayment } from "@/utils/api/apiPlaceholders";
import useSWR from 'swr';

export interface ReportData {
  id: number;
  title: string;
  subtitle: string;
  report_id: string;
  format: string;
  industry: string;
  pages: number;
  last_updated: string;
  image: string;
}

export interface LicenseOption {
  id: string;
  title: string;
  description: string;
  price: number | string;
  discount?: number;
  features: string[];
  highlight?: boolean;
  icon?: string;
  discountPercent?: string | number;
  buyButtonText?: string;
  buyButtonIcon?: string;
  disclaimer?: string;
  actualPrice?: string | number;
  currencySymbol?: string;
  // plus any others from the API actually used in LicenseCard, LicenseGrid
}

type SuccessData = any;

const fetchCheckoutData = async () => {
  const res = await fetch('https://dashboard.synapseaglobal.com/api/checkout');
  if (!res.ok) throw new Error('Failed to fetch checkout data');
  return res.json();
};

export default function CheckoutPage() {
  // ------- ALL HOOKS AT TOP, BEFORE ANY IF/RETURN -----
  const params = useParams<{ lang: string; id: string }>();
  const router = useRouter();
  const { language } = useLanguageStore();
  const reportId = useMemo(() => Number(params?.id), [params?.id]);
  const languageId = codeToId[language as keyof typeof codeToId] || 1;
  const { data, isLoading: reportLoading, error } = useReportDetail({
    reportId: params?.id as string,
    categoryId: "1",
    languageId: languageId.toString(),
  });
  const report = data?.data?.report;
  const reportData = report ? {
    id: report.id,
    title: report.title,
    subtitle: "", // ReportDetail doesn't have subtitle field
    report_id: report.report_id,
    format: report.format,
    industry: "Technology & Software",
    pages: parseInt(report.number_of_pages) || 0,
    last_updated: new Date(report.modify_at).toLocaleDateString(),
    image: report.image
  } : null;

  // LIVE CHECKOUT API DATA
  const { data: checkoutApi, error: checkoutApiError } = useSWR('checkout-api', fetchCheckoutData);
  const { checkout_page, payment_common_layout, billing_information, bill_info_order_summary, order_confirmation } = checkoutApi || {};

  // All other state hooks:
  const [selectedLicense, setSelectedLicense] = useState<LicenseOption | null>(null);
  const [showBilling, setShowBilling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Add state for selectedCurrency and pass to CurrencySelector
  const [selectedCurrency, setSelectedCurrency] = useState("");

  useEffect(() => {
    if (checkout_page?.currency_dropdown) {
      const list = checkout_page.currency_dropdown.split(',').map((opt: string) => opt.trim());
      setSelectedCurrency(list?.[0] || "");
    }
  }, [checkout_page]);

  // License option assembly from API - MEMOIZED to update when currency changes
  const licenseOptions = useMemo(() => {
    if (!checkout_page || !selectedCurrency) return [];
    const priceLabels: Record<string, { suffix: string; symbol: string }> = {
      USD: { suffix: 'USD', symbol: '$' },
      INR: { suffix: 'INR', symbol: '₹' },
      EUR: { suffix: 'EUR', symbol: '€' },
      // Support for test data
      '5': { suffix: 'USD', symbol: '$' },
      '6': { suffix: 'INR', symbol: '₹' },
      '7': { suffix: 'EUR', symbol: '€' }
    };
    const label = priceLabels[selectedCurrency] || priceLabels['USD'];
    const mapLicensePrices = (type: string) => {
      let price = checkout_page[`${type}_license_offer_price_in_${label.suffix}`];
      let actualPrice = checkout_page[`${type}_license_actual_price_in_${label.suffix}`];
      // fallback to USD if missing
      if (!price) price = checkout_page[`${type}_license_offer_price_in_USD`];
      if (!actualPrice) actualPrice = checkout_page[`${type}_license_actual_price_in_USD`];
      return {
        id: type,
        title: checkout_page[`${type}_license_heading`],
        description: checkout_page[`${type}_license_description`],
        price: price || '',
        actualPrice: actualPrice || '',
        currencySymbol: label.symbol,
        discount: parseFloat((checkout_page[`${type}_license_discount_percent`]|| '').replace(/[^0-9.]/g, '') || '0'),
        features: checkout_page[`${type}_license_points`] || [],
        disclaimer: checkout_page[`${type}_license_disclaimer`],
        icon: checkout_page[`${type}_license_icon_image`],
        discountPercent: checkout_page[`${type}_license_discount_percent`],
        buyButtonText: checkout_page.buy_license_button,
        buyButtonIcon: checkout_page.buy_license_button_icon_image,
        highlight: type === 'team',
      };
    };
    return [mapLicensePrices('single'), mapLicensePrices('team'), mapLicensePrices('enterprise')];
  }, [selectedCurrency, checkout_page]);

  // --- after this begin conditional returns ONLY ---
  if (!checkoutApi) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading checkout...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (reportLoading) {
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

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
            <p className="text-gray-600 mb-4">The report you're looking for doesn't exist or is not available.</p>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleBuyClick = (license: LicenseOption) => {
    setSelectedLicense(license);
    setShowBilling(true);
  };

  const handleBillingContinue = () => {
    setShowBilling(false);
    setShowPayment(true);
  };

  const handleBillingBack = () => {
    setShowBilling(false);
    setSelectedLicense(null);
  };

  const handleConfirmPayment = async () => {
    if (!selectedLicense || !reportData) return;
    setIsLoading(true);
    try {
      const res = await initiatePayment(selectedLicense.id, reportData.id);
      setSuccessData(res);
      setShowPayment(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessData(null);
    setSelectedLicense(null);
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleOrderSuccess = (orderData: any) => {
    setSuccessData(orderData);
    setShowBilling(false);
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="mb-6 text-[#555353] hover:text-gray-700 transition-colors"
          style={{ 
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '16px',
            fontWeight: '400'
          }}
        >
          ← Back
        </button>

        {/* Page Header */}
        <div className="text-center pt-4 relative z-10">
          <h1 className="text-[40px] font-normal mb-6 text-black leading-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {checkout_page.page_title}
          </h1>
          <p className="text-[#484848] underline text-base font-normal pt-4 " style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {checkout_page.selected_report_text}
          </p>
        </div>

        {/* Checkout Header */}
        <div className="flex justify-center">
          <CheckoutHeader report={reportData} />
        </div>

        {/* Step Indicator - above the grid */}
        <div className="mt-8 flex justify-center">
          <StepIndicator 
            currentStep={successData ? 3 : showBilling ? 2 : 1}
              choosePlanHeading={checkout_page?.choose_plan_heading ? `${checkout_page.choose_plan_heading}` : '1. Choose Your Pln'}
            billingHeading={`${billing_information?.bill_info_heading || billing_information?.bill_info_heading || 'Your Billing Details'}`}
            confirmationHeading={order_confirmation?.order_confirmation_heading ? `${order_confirmation.order_confirmation_heading}` : '3. Order Confirmation'}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex justify-center">
          <div className="w-full">
            <div className="bg-[#F4F4F4] w-338 px-6 pb-8 border-t-1 border-black">
              {successData ? (
                /* Order Confirmation - Step 3 */
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
                    onDownloadInvoice={() => {
                      console.log('Download invoice');
                      // Implement invoice download logic
                    }}
                    onCallAnalyst={() => {
                      console.log('Call analyst');
                      // Implement analyst contact logic
                    }}
                    onClose={handleCloseSuccess}
                    orderConfirmation={order_confirmation}
                  />
                </div>
              ) : !showBilling ? (
                /* License Grid - Step 1 */
                <>
                  {/* Currency Selector - inside the grid */}
                  <div className="flex justify-center mt-10.5 mb-12">
                    <CurrencySelector 
                      currencyOptionsText={checkout_page.currency_options_text}
                      currencyDropdown={checkout_page.currency_dropdown}
                      value={selectedCurrency}
                      onChange={setSelectedCurrency}
                    />
                  </div>
                  
                  {/* License Cards */}
                  <LicenseGrid
                    licenses={licenseOptions}
                    onBuy={handleBuyClick}
                    whatYouGetHeading={checkout_page.what_you_get_heading}
                  />

                  {/* Disclaimer */}
                  <div className="mt-8 text-center font-normal" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <Disclaimer disclaimer={checkout_page.common_license_discription} />
                  </div>
                </>
               ) : selectedLicense ? (
                 /* Billing Form - Step 2 */
                 <BillingForm
                   selectedLicense={selectedLicense}
                   reportData={reportData}
                   onContinue={handleBillingContinue}
                   onBack={handleBillingBack}
                   billingInformation={billing_information}
                   billInfoOrderSummary={bill_info_order_summary}
                   licenseOptions={licenseOptions}
                   checkoutPage={checkout_page}
                   onOrderSuccess={handleOrderSuccess}
                 />
               ) : null}
            </div>
          </div>
        </div>

      </div>

      {/* Support Footer - full width, attached to global footer */}
      <SupportFooter />

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onConfirm={handleConfirmPayment}
        isLoading={isLoading}
        license={selectedLicense}
        report={reportData}
      />
    </div>
  );
}


