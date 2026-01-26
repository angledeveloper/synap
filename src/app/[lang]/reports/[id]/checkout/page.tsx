"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useLanguageStore, useHomePageStore } from "@/store";
import { codeToId, extractIdFromSlug } from "@/lib/utils";
import { useReportDetail } from "@/hooks/useReportDetail";
import { useTranslations } from "@/hooks/useTranslations";
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
import { ReportData, LicenseOption } from "@/types/checkout";

type SuccessData = any;

const fetchCheckoutData = async (lang: string) => {
  const languageId = codeToId[lang as keyof typeof codeToId]; // Default to English (1) if language not found

  const res = await fetch(`https://dashboard.synapseaglobal.com/api/checkout/${languageId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch checkout data');
  return res.json();
};

export default function CheckoutPage() {
  // ------- ALL HOOKS AT TOP, BEFORE ANY IF/RETURN -----
  const params = useParams<{ lang: string; id: string }>();
  const router = useRouter();
  const { language } = useLanguageStore();
  const { HomePage } = useHomePageStore();

  const extractedId = extractIdFromSlug(params?.id as string);
  const reportId = useMemo(() => Number(extractedId), [extractedId]);
  const languageId = codeToId[language as keyof typeof codeToId];

  // Calculate default category ID based on language
  const defaultCategoryId = useMemo(() => {
    if (!HomePage?.report_store_dropdown) return "1";

    // Find categories for current language
    const langCats = HomePage.report_store_dropdown.filter(
      (c: any) => String(c.language_id) === String(languageId)
    );

    // Use the first category ID if found, otherwise keep "1"
    return langCats.length > 0 ? String(langCats[0].category_id) : "1";
  }, [HomePage, languageId]);

  const { data, isLoading: reportLoading, error } = useReportDetail({
    reportId: extractedId,
    categoryId: defaultCategoryId,
    languageId: languageId?.toString() || "1",
  });
  // Date formatter helper
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    if (dateString === 'Invalid Date' || !dateString) return '';
    try {
      const safeDate = dateString.replace(' ', 'T');
      const date = new Date(safeDate);
      if (isNaN(date.getTime())) {
        return dateString.split(' ')[0]; // Fallback to raw string if parsing fails, or part of it
      }
      return date.toLocaleDateString(language || 'en', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const metaFields = data?.data?.report_meta_fields;
  const report = data?.data?.report;

  // Use metaFields keys if available or fallback to hardcoded
  // Also pass metaFields to header

  const reportData = report ? {
    id: report.id,
    title: report.title,
    subtitle: "",
    report_id: report.report_id,
    format: report.format,
    industry: report.category_name || "Technology & Software", // Use category name from report if available
    pages: parseInt(report.number_of_pages) || 0,
    last_updated: formatDate(report.modify_at || report.updated_at),
    publish_date: formatDate(report.created_at),
    image: report.image,
    report_reference_title: data?.report_reference_title,
    base_year: report.base_year,
    forecast_period: report.forecast_period,
    toc: report.toc
  } : null;

  // Get dynamic translations
  const { data: translations } = useTranslations({ language: params.lang, page: 'reportDetail' });
  const t = translations || {
    lastUpdated: "Last Updated",
    baseYear: "Base Year data",
    format: "Format",
    industry: "Industry",
    forecastPeriod: "Forecast Period",
    reportId: "Report ID",
    numberOfPages: "Number of Pages",
    tocIncluded: "TOC included"
  };

  // LIVE CHECKOUT API DATA
  const { data: checkoutApi, error: checkoutApiError } = useSWR(['checkout-api', params.lang], () => fetchCheckoutData(params.lang as string));
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

  // Override Buy Button Text from Report API if available
  const buyButtonLabel = data?.buy_license_button;

  // Handle CCAvenue Payment Return
  const searchParams = useSearchParams();
  useEffect(() => {
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transactionId');
    const error = searchParams.get('error');

    if (status === 'success' && orderId) {
      // Construct success data
      // Note: Ideally we should fetch the full order details from API here, 
      // effectively validating the order again.
      // For now, using query params to show confirmation.
      setSuccessData({
        orderId,
        transactionId: transactionId || 'N/A',
        paymentMethod: 'CCAvenue',
        purchaseDate: new Date().toLocaleDateString(),
        // These details might be missing if we just redirected back, 
        // but for confirmation display purposes we might need them or fetch them.
        // Using logic to try and populate or fail gracefully.
        reportTitle: reportData?.title || 'Report',
        licenseType: selectedLicense?.title || 'License', // This might be null if state lost
        // ...
      });

      // Hide other steps
      setShowBilling(false);
      setShowPayment(false);

      // Clear params to avoid loop/refresh issues
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      alert("Payment Failed: " + error); // Simple alert or toast
    }
  }, [searchParams, reportData, selectedLicense]);

  // License option assembly from API - MEMOIZED to update when currency changes
  const licenseOptions = useMemo(() => {
    if (!checkout_page || !selectedCurrency) return [];
    const priceLabels: Record<string, { suffix: string; symbol: string }> = {
      USD: { suffix: 'USD', symbol: '$' },
      INR: { suffix: 'INR', symbol: '₹' },
      EUR: { suffix: 'EUR', symbol: '€' },
      GBP: { suffix: 'GBP', symbol: '£' },
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
        discount: parseFloat((checkout_page[`${type}_license_discount_percent`] || '').replace(/[^0-9.]/g, '') || '0'),
        features: checkout_page[`${type}_license_points`] || [],
        disclaimer: checkout_page[`${type}_license_disclaimer`],
        icon: checkout_page[`${type}_license_icon_image`],
        discountPercent: checkout_page[`${type}_license_discount_percent`],
        buyButtonText: buyButtonLabel || checkout_page.buy_license_button, // Use override from Report API
        buyButtonIcon: checkout_page.buy_license_button_icon_image,
        highlight: type === 'team',
        disclaimerHeading: checkout_page[`${type}_license_disclaimer_heading`],
        mostPopularText: checkout_page.most_popular_text,
      };
    };
    return [mapLicensePrices('single'), mapLicensePrices('team'), mapLicensePrices('enterprise')];
  }, [selectedCurrency, checkout_page, buyButtonLabel]);

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

  if (reportLoading || !HomePage) {
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
      <div className="w-full max-w-[1352px] mx-auto px-4 sm:px-6 py-0">
        {/* Back Button */}
        <div className="w-full">
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
        </div>

        {/* Page Header - Mobile Responsive */}
        <div className="w-full">
          <div className="text-center pt-4 relative z-10 w-full flex flex-col justify-center pb-3">
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-normal mb-4 lg:mb-6 text-black leading-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {checkout_page.page_title}
            </h1>
            <p className="text-[#484848] underline text-sm sm:text-base font-normal pt-0 pb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {checkout_page.selected_report_text}
            </p>
          </div>
        </div>

        {/* Checkout Header */}
        <div className="w-full mt-6">
          <CheckoutHeader report={reportData} labels={t} metaFields={metaFields} />
        </div>

        {/* Main Content Container */}
        <div className="w-full">
          {/* Step Indicator */}
          <div className="mt-8 w-full">
            <StepIndicator
              currentStep={successData ? 3 : showBilling ? 2 : 1}
              choosePlanHeading={checkout_page?.choose_plan_heading ? `${checkout_page.choose_plan_heading}` : '1. Choose Your Plan'}
              billingHeading={`${billing_information?.bill_info_heading || 'Your Billing Details'}`}
              confirmationHeading={order_confirmation?.order_confirmation_heading ? `${order_confirmation.order_confirmation_heading}` : '3. Order Confirmation'}
            />
          </div>

          {/* Main Content Area */}
          <div className="w-full mt-0">
            <div className="bg-[#F4F4F4] w-full pb-8 border-t border-black">
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
                    invoiceFile={successData?.invoiceFile}
                  />
                </div>
              ) : !showBilling ? (
                /* License Grid - Step 1 */
                <div>
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
                </div>
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
                  oneTimePurchaseText={bill_info_order_summary?.one_time_purchase}
                  offerCodePlaceholder={bill_info_order_summary?.have_offer_placeholder}
                  languageId={Number(languageId || 1)}
                  initialCurrency={selectedCurrency}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Support Footer */}
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] mt-8">
          <SupportFooter payment_common_layout={payment_common_layout} />
        </div>

        <PaymentModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          onConfirm={handleConfirmPayment}
          isLoading={isLoading}
          license={selectedLicense}
          report={reportData}
        />

      </div>
    </div>
  );
}
