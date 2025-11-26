import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import Image from "next/image";
import CurrencySelector from "@/components/checkout/CurrencySelector";
import type { LicenseOption, ReportData } from "@/types/checkout";
import countries from '@/utils/countries.json';
import phoneCodes from '@/utils/phoneCodes.json';
import states from '@/utils/states.json';

declare global {
  interface Window {
    paypal?: any;
  }
}

export interface BillingFormProps {
  selectedLicense: LicenseOption;
  reportData: ReportData;
  onContinue: () => void;
  onBack: () => void;
  billingInformation?: any; // Accept labels from API
  billInfoOrderSummary?: any;
  licenseOptions: LicenseOption[];
  checkoutPage?: any; // Add checkout_page data for pricing
  onOrderSuccess?: (orderData: any) => void; // NEW: notify parent to show confirmation
  oneTimePurchaseText?: string;
  offerCodePlaceholder?: string;
  languageId?: number;
}

export default function BillingForm({ selectedLicense, reportData, onContinue, onBack, billingInformation, billInfoOrderSummary, licenseOptions, checkoutPage, onOrderSuccess, oneTimePurchaseText, offerCodePlaceholder, languageId: propLanguageId }: BillingFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phoneCode: "",
    phoneNumber: "",
    address: "",
    state: "",
    city: "",
    postalCode: "",
    addCompanyDetails: false,
    companyName: "",
    gstin: ""
  });

  // Check if the selected country is India
  const isIndiaSelected = formData.country?.toLowerCase() === 'india';

  const [selectedOrderLicenseId, setSelectedOrderLicenseId] = useState(selectedLicense?.id || "single");
  const [selectedOrderCurrency, setSelectedOrderCurrency] = useState("USD");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("ccavenue");
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [showOfferField, setShowOfferField] = useState(false);
  const [offerCode, setOfferCode] = useState("");
  const [appliedOfferCode, setAppliedOfferCode] = useState("");
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  // --- Derived State for Pricing ---
  const [discountError, setDiscountError] = useState("");
  const [couponTotalStr, setCouponTotalStr] = useState("");
  const [dynamicDiscount, setDynamicDiscount] = useState(0);

  // Ref to store internal order ID for PayPal transactions
  const paypalInternalOrderId = React.useRef<string>("");
  // Refs to store user_id and language_id from the initial order creation
  const userId = React.useRef<number | null>(null);
  const languageId = React.useRef<number | null>(null);

  const generateInternalOrderId = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    return `SYN-ORD-${yyyy}${mm}${dd}-${random}`;
  };
  const [activeStep, setActiveStep] = useState<"billing" | "payment">("billing");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // reset coupon when license/currency changes
  useEffect(() => {
    setAppliedOfferCode("");
    setDynamicDiscount(0);
    setDiscountError("");
    setCouponTotalStr("");
  }, [selectedOrderLicenseId, selectedOrderCurrency]);

  // helper for offer discount logic (simulate a discount for example's sake)
  function getOfferDiscount(code: string, subtotal: number) {
    const val = code.trim().toUpperCase();
    // simulate: only one demo code
    if (val === "WELCOME10") return 10; // e.g. 10 off for example
    if (!val) return 0;
    return 0; // could be extended for more codes or server validation
  }

  // Get pricing data from API based on selected license and currency
  const getLicensePricing = () => {
    const currencySuffix = selectedOrderCurrency === 'INR' ? 'INR' :
      selectedOrderCurrency === 'EUR' ? 'EUR' : 'USD';

    let offerPrice = 0;
    let actualPrice = 0;
    let discountPercent = 0;
    let licenseTitle = '';



    if (selectedOrderLicenseId === 'single') {
      // Use the correct API field names from checkout_page
      const priceField = `single_license_offer_price_in_${currencySuffix}`;
      const actualPriceField = `single_license_actual_price_in_${currencySuffix}`;



      offerPrice = parseFloat((checkoutPage?.[priceField] || checkoutPage?.single_license_offer_price_in_USD || '$0').replace(/[^0-9.]/g, ''));
      actualPrice = parseFloat((checkoutPage?.[actualPriceField] || checkoutPage?.single_license_actual_price_in_USD || '$0').replace(/[^0-9.]/g, ''));
      discountPercent = parseFloat((checkoutPage?.single_license_discount_percent || '0%').replace(/[^0-9.]/g, ''));
      licenseTitle = checkoutPage?.single_license_heading || 'Single License';
    } else if (selectedOrderLicenseId === 'team') {
      const priceField = `team_license_offer_price_in_${currencySuffix}`;
      const actualPriceField = `team_license_actual_price_in_${currencySuffix}`;

      offerPrice = parseFloat((checkoutPage?.[priceField] || checkoutPage?.team_license_offer_price_in_USD || '$0').replace(/[^0-9.]/g, ''));
      actualPrice = parseFloat((checkoutPage?.[actualPriceField] || checkoutPage?.team_license_actual_price_in_USD || '$0').replace(/[^0-9.]/g, ''));
      discountPercent = parseFloat((checkoutPage?.team_license_discount_percent || '0%').replace(/[^0-9.]/g, ''));
      licenseTitle = checkoutPage?.team_license_heading || 'Team License';
    } else if (selectedOrderLicenseId === 'enterprise') {
      const priceField = `enterprise_license_offer_price_in_${currencySuffix}`;
      const actualPriceField = `enterprise_license_actual_price_in_${currencySuffix}`;

      offerPrice = parseFloat((checkoutPage?.[priceField] || checkoutPage?.enterprise_license_offer_price_in_USD || '$0').replace(/[^0-9.]/g, ''));
      actualPrice = parseFloat((checkoutPage?.[actualPriceField] || checkoutPage?.enterprise_license_actual_price_in_USD || '$0').replace(/[^0-9.]/g, ''));
      discountPercent = parseFloat((checkoutPage?.enterprise_license_discount_percent || '0%').replace(/[^0-9.]/g, ''));
      licenseTitle = checkoutPage?.enterprise_license_heading || 'Enterprise License';
    }



    return { offerPrice, actualPrice, discountPercent, licenseTitle };
  };

  const { offerPrice, actualPrice, discountPercent, licenseTitle } = getLicensePricing();

  // Calculate actual price if it's null/0 from API but we have offer price and discount
  let calculatedActualPrice = actualPrice;
  if (actualPrice === 0 && offerPrice > 0 && discountPercent > 0) {
    calculatedActualPrice = offerPrice / (1 - discountPercent / 100);
  }

  const discountAmount = calculatedActualPrice > 0 ? (calculatedActualPrice - offerPrice) : 0;
  const subtotal = offerPrice;
  const isINR = selectedOrderCurrency === 'INR';

  // Check if the selected state is Maharashtra (case-insensitive)
  const isMaharashtra = formData.state?.toLowerCase() === 'maharashtra';

  // Compute tax rates based on state
  const getRate = (rateStr?: string): number => {
    if (!rateStr) return 0;
    const n = parseFloat(String(rateStr).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n / 100;
  };

  // Initialize tax rates
  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;

  if (isINR) {
    // For Maharashtra, use IGST (18%)
    if (isMaharashtra) {
      igstRate = 0.18; // 18% IGST for Maharashtra
    } else {
      // For other states, use CGST+SGST (9% each)
      if (selectedOrderLicenseId === 'single') {
        cgstRate = getRate(checkoutPage?.single_license_offer_price_in_INR_CGST_rate);
        sgstRate = getRate(checkoutPage?.single_license_offer_price_in_INR_SGST_rate);
      } else if (selectedOrderLicenseId === 'team') {
        cgstRate = getRate(checkoutPage?.team_license_offer_price_in_INR_CGST_rate);
        sgstRate = getRate(checkoutPage?.team_license_offer_price_in_INR_SGST_rate);
      } else if (selectedOrderLicenseId === 'enterprise') {
        cgstRate = getRate(checkoutPage?.enterprise_license_offer_price_in_INR_CGST_rate);
        sgstRate = getRate(checkoutPage?.enterprise_license_offer_price_in_INR_SGST_rate);
      }

      // Fallback to 9% each if API missing
      if (cgstRate === 0 && sgstRate === 0) {
        cgstRate = 0.09;
        sgstRate = 0.09;
      }
    }
  }

  // Calculate tax amounts
  const cgst = isINR && !isMaharashtra ? +(subtotal * cgstRate).toFixed(2) : 0;
  const sgst = isINR && !isMaharashtra ? +(subtotal * sgstRate).toFixed(2) : 0;
  const igst = isINR && isMaharashtra ? +(subtotal * igstRate).toFixed(2) : 0;
  const total = subtotal + cgst + sgst + igst;

  // 2. Update order breakdown to use discount responsive to offer code
  const finalDiscountAmount = dynamicDiscount > 0 ? dynamicDiscount : discountAmount;
  const finalTotal = Math.max(0, (subtotal - finalDiscountAmount) + cgst + sgst);

  // Helper to pick right API string by license/currency
  const getSummaryStrings = () => {
    const type = selectedOrderLicenseId;
    const cur = selectedOrderCurrency;
    // Map license type to key prefix
    let prefix = '';
    if (type === 'single') prefix = 'single_license';
    else if (type === 'team') prefix = 'team_license';
    else if (type === 'enterprise') prefix = 'enterprise_license';

    let apiObj = checkoutPage;
    const suffix = cur === 'INR' ? 'INR' : cur === 'EUR' ? 'EUR' : 'USD';
    // Offer price (post-discount, pre-tax):
    const offerPriceKey = `${prefix}_offer_price_in_${suffix}`;
    const offerPriceStr = apiObj?.[offerPriceKey] || '';
    // Actual price (pre-discount):
    const actualPriceKey = `${prefix}_actual_price_in_${suffix}`;
    const actualPriceStr = apiObj?.[actualPriceKey] || '';
    // Discount percent
    const discountStr = apiObj?.[`${prefix}_discount_percent`] || '';
    // Tax lines (INR only)
    const cgstStr = apiObj?.[`${prefix}_offer_price_in_INR_with_CGST`] || '';
    const sgstStr = apiObj?.[`${prefix}_offer_price_in_INR_with_SGST`] || '';
    const igstStr = apiObj?.[`${prefix}_offer_price_in_INR_with_IGST`] || '';
    // Total (post-tax):
    const totalKey = (cur === 'INR') ? `${prefix}_offer_price_in_INR_total` : offerPriceKey;
    const totalStr = apiObj?.[totalKey] || offerPriceStr;
    return { offerPriceStr, actualPriceStr, discountStr, cgstStr, sgstStr, igstStr, totalStr };
  };

  const { offerPriceStr, actualPriceStr, discountStr, cgstStr, sgstStr, igstStr, totalStr } = getSummaryStrings();
  // Helpers to parse currency strings like $80.00, ₹8,375.17, €69.26
  const parseMoney = (v: string): number => {
    if (!v) return 0;
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  };
  // Base total numeric derived from API display string
  const baseTotalNumeric = parseMoney(totalStr);
  const couponTotalNumeric = parseMoney(couponTotalStr);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormComplete()) {
      setFormSubmitted(true);
      setActiveStep("payment");
      // Scroll to payment section
      setTimeout(() => {
        const paymentSection = document.getElementById('payment-section');
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Check if all required fields are filled
  const isFormComplete = () => {
    // Basic required fields for all users
    const baseFields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.country,
      formData.phoneNumber
    ];

    // Check if all base fields are filled
    const baseFieldsValid = baseFields.every(field => Boolean(field));

    // If not all base fields are filled, no need to check address fields
    if (!baseFieldsValid) return false;

    // If country is not India, we don't need to check address fields
    if (!isIndiaSelected) return true;

    // For Indian users, check all address fields
    const addressFields = [
      formData.address,
      formData.state,
      formData.city,
      formData.postalCode
    ];

    return addressFields.every(field => Boolean(field));
  };

  const handlePaymentMethodChange = (method: string) => {
    if (selectedPaymentMethod === method) {
      setSelectedPaymentMethod("");
    } else {
      setSelectedPaymentMethod(method);
    }
  };

  // --- SUBMISSION logic: POST to /customer-orders. Use proper keys/casing ---
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault && e.preventDefault();
    // Compose payload as required
    const payload: any = {
      language_id: 1, // change to dynamic if needed
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      residence: formData.country,
      phone: `${formData.phoneCode}${formData.phoneNumber}`,
      // Only include address fields if country is India
      ...(isIndiaSelected && {
        first_line_add: formData.address,
        state_province: formData.state,
        city: formData.city,
        postal_zipcode: formData.postalCode
      }),
      add_company_details: formData.addCompanyDetails ? "Yes" : "No",
      ...(formData.addCompanyDetails ? {
        company_name: formData.companyName,
        GSTIN: formData.gstin,
      } : {}),
      license_type: licenseTitle,
      discount: String(finalDiscountAmount),
      subtotal: String(subtotal),
      cgst: String(cgst),
      sgst: String(sgst),
      igst: "0", // Add correct logic if you want IGST value (from API, if needed)
      total: String(finalTotal),
      ...(appliedOfferCode ? { offer_code: appliedOfferCode } : {})
    };
    try {
      const res = await fetch('https://dashboard.synapseaglobal.com/api/customer-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error('Failed to submit order: ' + errText);
      }
      const data = await res.json();
      // Pass fields to parent/order-confirmation component as needed
      // e.g. props.onOrderComplete(data) or setOrderData context
      // For now, just log:

    } catch (err) {
      console.error('Failed to submit order', err);
      setDiscountError('Failed to submit order. Please try again!');
    }
  };

  let cgstDiff = '', sgstDiff = '', igstDiff = '';
  if (selectedOrderCurrency === 'INR') {
    // Both offerPriceStr and *_with_* fields are strings (e.g. "₹15,881.40", "₹17,310.73"). Remove non-numeric chars, and subtract.
    const parse = (v: string) => parseFloat(String(v).replace(/[^0-9.\-]/g, '')) || 0;
    const offer = parse(offerPriceStr);
    if (cgstStr) cgstDiff = (parse(cgstStr) - offer).toFixed(2);
    if (sgstStr) sgstDiff = (parse(sgstStr) - offer).toFixed(2);
    if (igstStr) igstDiff = (parse(igstStr) - offer).toFixed(2);
  }

  const [paypalScriptTag, setPaypalScriptTag] = useState<HTMLScriptElement | null>(null);

  // Dynamically load PayPal JS SDK if PayPal is selected
  useEffect(() => {
    // Remove ALL PayPal script tags before loading new (avoids currency mismatch bugs)
    Array.from(document.querySelectorAll('script[src^="https://www.paypal.com/sdk/js"]')).forEach(script => {
      script.remove();
    });
    setPaypalLoaded(false); // always reset
    setPaypalScriptTag(null);
    // Clear PayPal button DOM
    const el = document.getElementById('paypal-button-container');
    if (el) el.innerHTML = '';
    if (selectedPaymentMethod === 'paypal') {
      // Insert new SDK for this currency
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${selectedOrderCurrency}`;
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
        setPaypalScriptTag(script);
      };
      document.body.appendChild(script);
    }
    // No dependency on paypalLoaded here -- order matters (re-inject script on every switch)
  }, [selectedPaymentMethod, selectedOrderCurrency]);

  // Render PayPal Buttons when selected and sdk loaded
  useEffect(() => {
    if (
      selectedPaymentMethod === 'paypal' &&
      paypalLoaded &&
      window.paypal &&
      finalTotal > 0
    ) {
      // Check if button already exists to prevent duplicates
      const container = document.getElementById('paypal-button-container');
      if (container && container.children.length > 0) {
        return; // Button already rendered
      }

      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay', height: 40 },
        createOrder: async function (data: any, actions: any) {
          // 1. Create order on external server first to get user_id and language_id
          try {
            const customerOrderPayload = {
              language_id: propLanguageId || 1, // Use prop or default
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              residence: formData.country,
              phone: `${formData.phoneCode}${formData.phoneNumber}`,
              ...(isIndiaSelected && {
                first_line_add: formData.address,
                state_province: formData.state,
                city: formData.city,
                postal_zipcode: formData.postalCode
              }),
              add_company_details: formData.addCompanyDetails ? "Yes" : "No",
              ...(formData.addCompanyDetails ? {
                company_name: formData.companyName,
                GSTIN: formData.gstin,
              } : {}),
              license_type: licenseTitle,
              discount: String(finalDiscountAmount),
              subtotal: String(subtotal),
              cgst: String(cgst),
              sgst: String(sgst),
              igst: "0",
              total: String(finalTotal),
              ...(appliedOfferCode ? { offer_code: appliedOfferCode } : {})
            };

            const customerOrderRes = await fetch('https://dashboard.synapseaglobal.com/api/customer-orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(customerOrderPayload)
            });

            if (!customerOrderRes.ok) {
              throw new Error('Failed to create customer order');
            }

            const customerOrderData = await customerOrderRes.json();
            if (customerOrderData.success) {
              userId.current = customerOrderData.user_id;
              languageId.current = customerOrderData.language_id;
            } else {
              throw new Error(customerOrderData.message || 'Failed to create customer order');
            }

            // 2. Generate internal order ID
            const internalId = generateInternalOrderId();
            paypalInternalOrderId.current = internalId;

            // 3. Create PayPal order via internal API
            const res = await fetch('/api/payments/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reportId: reportData?.id || '',
                licenseType: selectedOrderLicenseId,
                currency: selectedOrderCurrency,
                amount: (couponTotalNumeric > 0 ? couponTotalNumeric : finalTotal).toFixed(2),
                internalOrderId: internalId
              })
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Order creation failed');
            }
            const result = await res.json();
            return result.orderID;
          } catch (e: any) {
            console.error('Order creation error:', e);
            throw e; // Stop PayPal flow
          }
        },
        onApprove: async function (data: any, actions: any) {

          try {
            const captureRes = await actions.order.capture();
            if (!captureRes.id || captureRes.status !== 'COMPLETED') {

              return;
            }

            // POST to backend to verify order
            const res = await fetch('/api/payments/verify-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderID: captureRes.id,
                reportId: reportData?.id || '',
                licenseType: selectedOrderLicenseId,
                amount: (couponTotalNumeric > 0 ? couponTotalNumeric : finalTotal).toFixed(2),
                currency: selectedOrderCurrency,
                internalOrderId: paypalInternalOrderId.current
              })
            });
            const result = await res.json();
            if (!res.ok || !result.valid) {

              return;
            }

            // Save to external server using dynamic IDs
            const payload = {
              user_id: userId.current,
              language_id: languageId.current,
              order_id: paypalInternalOrderId.current,
              transaction_id: captureRes.id,
              payment_method: 'PayPal',
              purchase_date: new Date().toISOString().split('T')[0],
              report_title: reportData?.report_reference_title || reportData?.title || '',
              currency: selectedOrderCurrency,
              payment_status: captureRes.status
            };

            let invoiceFile = '';
            try {
              const updateRes = await fetch('https://dashboard.synapseaglobal.com/api/customer-orders/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              const updateData = await updateRes.json();
              if (updateData.invoice_file) {
                invoiceFile = updateData.invoice_file;
              }
            } catch (e) {
              console.error('Failed to update order:', e);
            }
            // Notify parent to render Order Confirmation step
            const orderDataForConfirmation = {
              orderId: paypalInternalOrderId.current, // Use internal ID for display
              transactionId: captureRes.id,
              paymentMethod: 'PayPal',
              purchaseDate: payload.purchase_date,
              reportTitle: reportData?.title || '',
              licenseType: selectedLicense?.title || selectedOrderLicenseId,
              originalPrice: calculatedActualPrice,
              discountAmount: dynamicDiscount || discountAmount,
              subtotal: subtotal,
              customerEmail: formData.email || '',
              invoiceFile: invoiceFile // Pass invoice file to confirmation
            };
            onOrderSuccess && onOrderSuccess(orderDataForConfirmation);
          } catch (e: any) {
            console.error('Payment approval error:', e);
          }
        },
        onError: function (err: any) {

        }
      }).render('#paypal-button-container');
    }
  }, [selectedPaymentMethod, paypalLoaded, finalTotal, selectedOrderCurrency, reportData, selectedOrderLicenseId, onOrderSuccess, selectedLicense, formData.email, calculatedActualPrice, discountAmount, subtotal, couponTotalNumeric]);



  // Force currency to INR if India is selected
  useEffect(() => {
    if (isIndiaSelected && selectedOrderCurrency !== 'INR') {
      setSelectedOrderCurrency('INR');
    }
  }, [isIndiaSelected, selectedOrderCurrency]);

  // Get country code from country name
  const getCountryCode = (countryName: string) => {
    const country = countries.find(c => c.name.common === countryName);
    return country ? country.cca2 : '';
  };

  // Get states for the selected country
  const getFilteredStates = () => {
    if (!formData.country) return [];
    const countryCode = getCountryCode(formData.country);
    return states.filter(state => state.country_iso2 === countryCode);
  };

  // Handle country change to update states
  const handleCountryChange = (countryName: string) => {
    setFormData(prev => ({
      ...prev,
      country: countryName,
      state: '' // Reset state when country changes
    }));
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-[#555353] hover:text-gray-700 transition-colors text-sm sm:text-base"
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(14px, 4vw, 16px)',
          fontWeight: '400'
        }}
      >
        ← Back to License Selection
      </button>

      <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-8">
        {/* Left Column Wrapper */}
        <div className="w-full lg:w-[752px] lg:ml-10 flex flex-col gap-6 sm:gap-8">
          {/* Billing Details Card */}
          <div className={`bg-white border border-[#B5B5B5] rounded-[20px] p-4 sm:p-6 w-full ${!formSubmitted ? 'lg:min-h-[856px]' : ''} h-auto transition-all duration-300`}>
            <h2 className="text-xl sm:text-2xl lg:text-[24px] text-gray-900 mb-4 sm:mb-6 billing-heading" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: '700', marginBottom: 'clamp(24px, 4vw, 41px)' }}>
              1. {billingInformation?.bill_details_heading || billingInformation?.bill_info_heading || 'Your Billing Details'}
            </h2>

            {formSubmitted ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {formData.firstName} {formData.lastName}
                    </h3>
                    <div className="text-gray-600 text-sm space-y-0.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      <p>{formData.email}</p>
                      <p>{formData.phoneCode} {formData.phoneNumber}</p>
                      <p>{formData.address ? `${formData.address}, ` : ''}{formData.city ? `${formData.city}, ` : ''}{formData.country}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline underline-offset-4 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <Label htmlFor="firstName" className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                      {billingInformation?.first_name_text || 'First Name'}*
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black w-full h-10 sm:h-12"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                      {billingInformation?.last_name_text || 'Last Name'}*
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black w-full h-10 sm:h-12"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4 sm:mb-6">
                  <Label htmlFor="email" className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                    {billingInformation?.email_text || 'Email Address'}*
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black w-full h-10 sm:h-12"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    required
                  />
                </div>

                {/* Country and Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <Label htmlFor="country" className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                      {billingInformation?.residence_text || 'Country of Residence'}*
                    </Label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="mt-1 border border-[#DBDBDB] rounded-[10px] bg-white w-full h-10 sm:h-12 px-3 text-black appearance-none cursor-pointer focus:border-black focus:outline-none"
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                        backgroundPosition: 'right 12px center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="" disabled style={{ color: '#888888' }}>Please select a country</option>
                      {countries.map((c: any) => (
                        <option key={c.name.common || c.name} value={c.name.common || c.name}>{c.name.common || c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                      {billingInformation?.phone || 'Phone Number'}*
                    </Label>
                    <div className="relative w-full h-10 sm:h-12">
                      <Input
                        type="tel"
                        className="w-full h-full border border-[#DBDBDB] bg-white rounded-r-[10px] px-4 pl-[60px] sm:pl-[70px] text-black text-sm sm:text-base placeholder-[#888888] focus:border-black"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        required
                      />
                      <select
                        value={formData.phoneCode}
                        onChange={(e) => handleInputChange("phoneCode", e.target.value)}
                        className="absolute m-1 sm:m-2 left-0 top-0 border border-[#DBDBDB] rounded-[7px] bg-[#E8E8E8] text-[#767676] w-[55px] sm:w-[61px] h-8 sm:h-[30px] px-2 text-sm sm:text-base z-10 shadow-none outline-1 focus:ring-0 focus:border-[#232323] appearance-none cursor-pointer"
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                          backgroundPosition: 'right 4px center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '12px'
                        }}
                      >
                        <option value="" disabled style={{ color: '#888888' }}>Code</option>
                        {phoneCodes.map((p: any) => (
                          <option key={p.dial_code + p.name} value={p.dial_code}>{p.dial_code} ({p.name})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address and State/Province */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <Label htmlFor="address" className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                      {billingInformation?.first_line_add || 'Street Address'}*
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="border border-[#DBDBDB] rounded-[10px] bg-white w-full h-10 sm:h-12 text-black focus:border-black focus:ring-0"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      required={isIndiaSelected}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                      {billingInformation?.state_province || 'State / Province'}*
                    </Label>
                    <div className="relative">
                      <select
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        disabled={!formData.country}
                        className={`w-full h-10 sm:h-12 border border-[#DBDBDB] rounded-[10px] bg-white text-black appearance-none focus:border-black focus:ring-0 focus:outline-none pl-3 pr-8 ${!formData.country ? 'opacity-70' : ''}`}
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        required={isIndiaSelected}
                      >
                        <option value="" disabled>Select State/Province</option>
                        {getFilteredStates().map((s: any) => (
                          <option key={`${s.country_iso2}-${s.state_code}`} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* City and Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <Label htmlFor="city" className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                      {billingInformation?.city || 'City'}{isIndiaSelected ? '*' : ''}
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white w-full h-10 sm:h-12 text-black"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      required={isIndiaSelected}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode" className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                      {billingInformation?.postal_zipcode || 'ZIP Code'}{isIndiaSelected ? '*' : ''}
                    </Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white w-full h-10 sm:h-12 text-black"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      required={isIndiaSelected}
                    />
                  </div>
                </div>

                {/* Company Details Checkbox */}
                <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                  <input
                    type="checkbox"
                    id="addCompanyDetails"
                    checked={formData.addCompanyDetails}
                    onChange={(e) => handleInputChange("addCompanyDetails", e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-1 border-black  rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="addCompanyDetails" className="text-black font-normal text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                    {billingInformation?.add_company_details || 'Add Company Details'}
                  </Label>
                </div>

                {/* Company Details Fields - Only show when checkbox is checked */}
                {formData.addCompanyDetails && (
                  <div className="flex flex-col md:flex-row gap-4 mb-4 sm:mb-6">
                    <div className="flex-1">
                      <Label htmlFor="companyName" className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                        {billingInformation?.company_name || 'Company Name'}
                      </Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black w-full h-10 sm:h-12"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="gstin" className="font-medium text-gray-500 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: '12px' }}>
                        {billingInformation?.GSTIN || 'GSTIN'}
                      </Label>
                      <Input
                        id="gstin"
                        value={formData.gstin}
                        onChange={(e) => handleInputChange("gstin", e.target.value)}
                        className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black w-full h-10 sm:h-12"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      />
                    </div>
                  </div>
                )}

                {/* Continue Button */}
                <Button
                  type="submit"
                  className="mt-4 sm:mt-6 bg-transparent border-1 border-black text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-md"
                  style={{
                    fontFamily: 'Space Mono, monospace',
                    fontWeight: 'bold',
                    width: 'clamp(160px, 40vw, 215px)',
                    height: 'clamp(45px, 10vw, 57px)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{billingInformation?.continue_btn_text || 'Continue to Payment'}</span>
                    {billingInformation?.continue_btn_icon && (
                      <Image
                        src={`/${billingInformation.continue_btn_icon}`}
                        alt="Arrow"
                        width={32.19}
                        height={12.67}
                        className="text-gray-700"
                      />
                    )}
                  </div>
                </Button>
              </form>
            )}
          </div>

          {/* Payment Method Section */}
          <div id="payment-section" className={`transition-all duration-500 ease-in-out ${!formSubmitted ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="bg-white border border-[#B5B5B5] rounded-[20px] p-4 sm:p-6 w-full h-auto">
              <h2 className={`text-lg sm:text-xl lg:text-[24px] text-gray-900 ${formSubmitted ? 'mb-4 sm:mb-6' : 'mb-0'} transition-all`} style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: '700' }}>
                2. {billingInformation?.payment_method_text || 'Payment Method'}
              </h2>

              {formSubmitted && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  <p className="text-gray-500 text-sm mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Instant pay:</p>
                  <div className="space-y-4">
                    {/* CCAvenue Payment Option (Card) */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => handlePaymentMethodChange("ccavenue")}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Card</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Payment Logos */}
                          <div className="flex gap-1">
                            <Image src="/ccavenue.svg" alt="CCAvenue" width={80} height={20} className="h-5 w-auto object-contain" />
                          </div>
                          {selectedPaymentMethod === "ccavenue" ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                      </div>

                      {selectedPaymentMethod === "ccavenue" && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50 animate-in slide-in-from-top-2">
                          <div className="mt-2">
                            {isINR ? (
                              <button
                                type="submit"
                                onClick={handlePayment}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md w-full text-base font-medium hover:bg-blue-700 transition-colors"
                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                              >
                                {billingInformation?.proceed_to_pay_text || 'Submit payment'}
                              </button>
                            ) : (
                              <button
                                type="submit"
                                onClick={handlePayment}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md w-full text-base font-medium hover:bg-blue-700 transition-colors"
                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                disabled={!(selectedPaymentMethod && selectedOrderLicenseId && selectedOrderCurrency)}
                              >
                                {billingInformation?.proceed_to_pay_text || 'Submit payment'}
                              </button>
                            )}
                            <div className="mt-3 flex items-center gap-2 text-gray-500 text-xs">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                              <span>Encrypted and secure payments</span>
                            </div>
                            <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                              By checking out you agree with our <a href="#" className="underline text-gray-700">Terms of Service</a> and confirm that you have read our <a href="#" className="underline text-gray-700">Privacy Policy</a>. You can cancel recurring payments at any time.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PayPal Payment Option */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => handlePaymentMethodChange("paypal")}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>PayPal</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Image src="/PayPal.svg" alt="PayPal" width={80} height={24} className="h-6 w-auto object-contain" />
                          {selectedPaymentMethod === "paypal" ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                      </div>

                      {selectedPaymentMethod === "paypal" && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50 animate-in slide-in-from-top-2">
                          <div className="py-4">
                            <div id="paypal-button-container"></div>

                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div
          className="hidden lg:block bg-white rounded-[20px] p-4 sm:p-6 lg:p-7 mt-6 sm:mt-8 lg:mt-0 lg:ml-12 w-full lg:w-[440px] h-auto"
          style={{
            border: '1px solid transparent',
            background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box'
          }}
        >
          <h2 className="text-lg sm:text-xl lg:text-[24px] text-gray-900 mb-4 sm:mb-6 lg:mb-[31px] billing-heading" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: '700' }}>
            {billInfoOrderSummary?.order_summary_heading || 'Order Summary'}
          </h2>

          {/* License and Currency Selectors */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex-1">
              <select
                value={selectedOrderLicenseId}
                onChange={e => setSelectedOrderLicenseId(e.target.value)}
                className="w-full sm:w-[118px] h-9 sm:h-[38px] border border-black rounded-none px-3 text-black appearance-none cursor-pointer text-sm sm:text-base"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                  backgroundPosition: 'right 8px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '14px'
                }}
              >
                <option value="single">{checkoutPage?.single_license_heading || 'Single License'}</option>
                <option value="team">{checkoutPage?.team_license_heading || 'Team License'}</option>
                <option value="enterprise">{checkoutPage?.enterprise_license_heading || 'Enterprise License'}</option>
              </select>
            </div>
            <div className="w-full sm:w-24">
              <div className="relative">
                <select
                  value={selectedOrderCurrency}
                  onChange={e => setSelectedOrderCurrency(e.target.value)}
                  disabled={isIndiaSelected}
                  className={`w-full sm:w-[93px] h-9 sm:h-[38px] border ${isIndiaSelected ? 'border-gray-300 bg-gray-100' : 'border-black'} rounded-none px-3 text-black appearance-none ${isIndiaSelected ? 'cursor-not-allowed' : 'cursor-pointer'} text-sm sm:text-base`}
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    backgroundImage: isIndiaSelected ? 'none' : 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                    backgroundPosition: 'right 8px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '14px',
                    opacity: isIndiaSelected ? 0.7 : 1
                  }}
                >
                  <option value="USD">USD $</option>
                  <option value="INR">INR ₹</option>
                  <option value="EUR">EUR €</option>
                </select>
                {isIndiaSelected && (
                  <div
                    className="absolute inset-0 bg-transparent cursor-not-allowed"
                    title="INR is required for India"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Order Breakdown */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{licenseTitle}</div>
                <div className="text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>(One time purchase)</div>
              </div>
              <div className="font-medium text-gray-900 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {actualPriceStr}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{billInfoOrderSummary?.discount_percentage_text || 'Discount'}</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">{discountStr}</span>
              </div>
              <div className="font-medium text-green-600 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                -{discountAmount.toLocaleString()}
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 sm:pt-3">
              <div className="font-medium text-gray-900 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {billInfoOrderSummary?.subtotal_text || 'Subtotal'}
              </div>
              <div className="font-medium text-gray-900 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {offerPriceStr}
              </div>
            </div>
            {isINR && isMaharashtra ? (
              // Show only IGST for Maharashtra
              <div className="flex justify-between items-center">
                <div className="text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {billInfoOrderSummary?.IGST || 'IGST (18%)'}
                </div>
                <div className="text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  ₹{igstDiff || '0.00'}
                </div>
              </div>
            ) : isINR ? (
              // Show CGST+SGST for other Indian states
              <>
                <div className="flex justify-between items-center">
                  <div className="text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {billInfoOrderSummary?.CGST || 'CGST (9%)'}
                  </div>
                  <div className="text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ₹{cgstDiff || '0.00'}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {billInfoOrderSummary?.SGST || 'SGST (9%)'}
                  </div>
                  <div className="text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ₹{sgstDiff || '0.00'}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <div className="text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {billInfoOrderSummary?.tax_text || 'Tax'}
                </div>
                <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {billInfoOrderSummary?.not_applicable_text || 'Not Applicable'}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3">
              <div className="text-base sm:text-lg font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {billInfoOrderSummary?.total_text || 'To'}
              </div>
              <div className="text-base sm:text-lg font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {couponTotalStr || totalStr}
              </div>
            </div>
          </div>

          {/* Offer Code Link/Button */}
          <div className="mb-2">
            {showOfferField ? null : (
              <button type="button" className="text-blue-600 underline text-xs sm:text-sm hover:text-blue-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                onClick={() => setShowOfferField(true)}>
                {billInfoOrderSummary?.have_offer_text || 'Have an offer code?'}
              </button>
            )}
            {showOfferField && (
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <Input
                  className="flex-1 border-[#DBDBDB] rounded-[8px] text-black text-sm sm:text-base"
                  value={offerCode}
                  placeholder="Enter offer code"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  onChange={(e) => setOfferCode(e.target.value)}
                />
                <Button
                  type="button"
                  className="bg-blue-600 text-white px-3 sm:px-4 text-sm sm:text-base"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  onClick={() => {
                    const code = (offerCode || '').trim().toUpperCase();
                    if (!code) {
                      setDiscountError('Enter a valid code');
                      return;
                    }
                    // Build API key from selection
                    const prefix = selectedOrderLicenseId === 'single' ? 'single_license' : selectedOrderLicenseId === 'team' ? 'team_license' : 'enterprise_license';
                    const suffix = selectedOrderCurrency === 'INR' ? 'INR' : selectedOrderCurrency === 'EUR' ? 'EUR' : 'USD';
                    const key = `${prefix}_offer_price_in_${suffix}_with_coupan${code}_total`;
                    const str = checkoutPage?.[key] as string | undefined;
                    if (str) {
                      setAppliedOfferCode(code);
                      setCouponTotalStr(str);
                      const discount = Math.max(0, baseTotalNumeric - parseMoney(str));
                      setDynamicDiscount(discount);
                      setDiscountError("");
                    } else {
                      setAppliedOfferCode("");
                      setCouponTotalStr("");
                      setDynamicDiscount(0);
                      setDiscountError('Invalid or unsupported code');
                    }
                  }}
                >Apply</Button>
              </div>
            )}
            {discountError && <div className="text-red-500 text-xs sm:text-sm mb-3">{discountError}</div>}
            {appliedOfferCode && dynamicDiscount > 0 && (
              <div className="text-green-700 text-xs sm:text-sm mb-3">Applied: {appliedOfferCode} (-{dynamicDiscount})</div>
            )}
          </div>



        </div>
        {/* Mobile Order Summary Bottom Sheet */}
        <div className="lg:hidden">
          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[100]">
            <div className="flex items-center justify-between" onClick={() => setIsOrderSummaryOpen(true)}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Total</span>
                  <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{couponTotalStr || totalStr}</span>
                </div>
                <button className="text-blue-600 text-sm font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {billInfoOrderSummary?.have_offer_text || 'Have an offer code?'}
                </button>
              </div>
              <ChevronUp className="w-6 h-6 text-gray-500" />
            </div>
          </div>

          {/* Bottom Sheet Overlay */}
          {isOrderSummaryOpen && (
            <div className="fixed inset-0 z-[101]">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={() => setIsOrderSummaryOpen(false)}
              />

              {/* Sheet Content */}
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {billInfoOrderSummary?.order_summary_heading || 'ORDER SUMMARY'}
                  </h2>
                  <button onClick={() => setIsOrderSummaryOpen(false)}>
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* License and Currency Selectors */}
                <div className="flex flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <select
                      value={selectedOrderLicenseId}
                      onChange={e => setSelectedOrderLicenseId(e.target.value)}
                      className="w-full h-[38px] border border-black rounded-none px-3 text-black appearance-none cursor-pointer text-base"
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                        backgroundPosition: 'right 8px center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '14px'
                      }}
                    >
                      <option value="single">{checkoutPage?.single_license_heading || 'Single License'}</option>
                      <option value="team">{checkoutPage?.team_license_heading || 'Team License'}</option>
                      <option value="enterprise">{checkoutPage?.enterprise_license_heading || 'Enterprise License'}</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <div className="relative">
                      <select
                        value={selectedOrderCurrency}
                        onChange={e => setSelectedOrderCurrency(e.target.value)}
                        disabled={isIndiaSelected}
                        className={`w-full h-[38px] border ${isIndiaSelected ? 'border-gray-300 bg-gray-100' : 'border-black'} rounded-none px-3 text-black appearance-none ${isIndiaSelected ? 'cursor-not-allowed' : 'cursor-pointer'} text-base`}
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          backgroundImage: isIndiaSelected ? 'none' : 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                          backgroundPosition: 'right 8px center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '14px',
                          opacity: isIndiaSelected ? 0.7 : 1
                        }}
                      >
                        <option value="USD">USD $</option>
                        <option value="INR">INR ₹</option>
                        <option value="EUR">EUR €</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Order Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{licenseTitle}</div>
                      <div className="text-sm text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{oneTimePurchaseText || '(One time purchase)'}</div>
                    </div>
                    <div className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {actualPriceStr}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{billInfoOrderSummary?.discount_percentage_text || 'Discount'}</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">{discountStr}</span>
                    </div>
                    <div className="font-medium text-gray-900 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      -{discountAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <div className="font-medium text-gray-900 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {billInfoOrderSummary?.subtotal_text || 'Subtotal'}
                    </div>
                    <div className="font-medium text-gray-900 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {offerPriceStr}
                    </div>
                  </div>
                  {isINR && isMaharashtra ? (
                    <div className="flex justify-between items-center">
                      <div className="text-gray-700 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {billInfoOrderSummary?.IGST || 'IGST (18%)'}
                      </div>
                      <div className="text-gray-700 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        ₹{igstDiff || '0.00'}
                      </div>
                    </div>
                  ) : isINR ? (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-700 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {billInfoOrderSummary?.CGST || 'CGST (9%)'}
                        </div>
                        <div className="text-gray-700 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          ₹{cgstDiff || '0.00'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-700 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {billInfoOrderSummary?.SGST || 'SGST (9%)'}
                        </div>
                        <div className="text-gray-700 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          ₹{sgstDiff || '0.00'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="text-gray-700 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {billInfoOrderSummary?.tax_text || 'Tax'}
                      </div>
                      <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {billInfoOrderSummary?.not_applicable_text || '0%'}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3">
                    <div className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {billInfoOrderSummary?.total_text || 'Total'}
                    </div>
                    <div className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {couponTotalStr || totalStr}
                    </div>
                  </div>
                </div>

                {/* Offer Code */}
                <div className="mb-2">
                  <div className="flex flex-col gap-2 mb-2">
                    <p className="text-blue-600 text-sm font-medium mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {billInfoOrderSummary?.have_offer_text || 'Have an offer code?'}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        className="flex-1 border-[#DBDBDB] rounded-[8px] text-black text-base"
                        value={offerCode}
                        placeholder={offerCodePlaceholder || "Enter offer code"}
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        onChange={(e) => setOfferCode(e.target.value)}
                      />
                      <Button
                        type="button"
                        className="bg-blue-600 text-white px-4 text-base"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        onClick={() => {
                          const code = (offerCode || '').trim().toUpperCase();
                          if (!code) {
                            setDiscountError('Enter a valid code');
                            return;
                          }
                          const prefix = selectedOrderLicenseId === 'single' ? 'single_license' : selectedOrderLicenseId === 'team' ? 'team_license' : 'enterprise_license';
                          const suffix = selectedOrderCurrency === 'INR' ? 'INR' : selectedOrderCurrency === 'EUR' ? 'EUR' : 'USD';
                          const key = `${prefix}_offer_price_in_${suffix}_with_coupan${code}_total`;
                          const str = checkoutPage?.[key] as string | undefined;
                          if (str) {
                            setAppliedOfferCode(code);
                            setCouponTotalStr(str);
                            const discount = Math.max(0, baseTotalNumeric - parseMoney(str));
                            setDynamicDiscount(discount);
                            setDiscountError("");
                          } else {
                            setAppliedOfferCode("");
                            setCouponTotalStr("");
                            setDynamicDiscount(0);
                            setDiscountError('Invalid or unsupported code');
                          }
                        }}
                      >Apply</Button>
                    </div>
                  </div>
                  {discountError && <div className="text-red-500 text-sm mb-3">{discountError}</div>}
                  {appliedOfferCode && dynamicDiscount > 0 && (
                    <div className="text-green-700 text-sm mb-3">Applied: {appliedOfferCode} (-{dynamicDiscount})</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
