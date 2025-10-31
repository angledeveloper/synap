import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import CurrencySelector from "@/components/checkout/CurrencySelector";
import type { LicenseOption, ReportData } from "@/app/[lang]/reports/[id]/checkout/page";
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
}

export default function BillingForm({ selectedLicense, reportData, onContinue, onBack, billingInformation, billInfoOrderSummary, licenseOptions, checkoutPage, onOrderSuccess }: BillingFormProps) {
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

  const [selectedOrderLicenseId, setSelectedOrderLicenseId] = useState(selectedLicense?.id || "single");
  const [selectedOrderCurrency, setSelectedOrderCurrency] = useState("USD");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [activeStep, setActiveStep] = useState<"billing" | "payment">("billing");

  // 1. State for offer code and its logic
  const [showOfferField, setShowOfferField] = useState(false);
  const [offerCode, setOfferCode] = useState("");
  const [appliedOfferCode, setAppliedOfferCode] = useState("");
  const [dynamicDiscount, setDynamicDiscount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [couponTotalStr, setCouponTotalStr] = useState<string>("");

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
    
    console.log('Debug - checkoutPage data:', checkoutPage);
    console.log('Debug - selectedOrderLicenseId:', selectedOrderLicenseId);
    console.log('Debug - selectedOrderCurrency:', selectedOrderCurrency);
    
    if (selectedOrderLicenseId === 'single') {
      // Use the correct API field names from checkout_page
      const priceField = `single_license_offer_price_in_${currencySuffix}`;
      const actualPriceField = `single_license_actual_price_in_${currencySuffix}`;
      
      console.log('Debug - priceField:', priceField);
      console.log('Debug - actualPriceField:', actualPriceField);
      console.log('Debug - priceField value:', checkoutPage?.[priceField]);
      console.log('Debug - actualPriceField value:', checkoutPage?.[actualPriceField]);
      
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
    
    console.log('Debug - Final values:', { offerPrice, actualPrice, discountPercent, licenseTitle });
    
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

  // Compute CGST/SGST amounts from API rate fields when available
  const getRate = (rateStr?: string): number => {
    if (!rateStr) return 0;
    const n = parseFloat(String(rateStr).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n / 100;
  };

  let cgstRate = 0;
  let sgstRate = 0;
  if (isINR) {
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

  const cgst = isINR ? +(subtotal * cgstRate).toFixed(2) : 0;
  const sgst = isINR ? +(subtotal * sgstRate).toFixed(2) : 0;
  const total = subtotal + cgst + sgst;

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
    if(isFormComplete()) {
      setActiveStep("payment");
    }
  };

  // Check if all required fields are filled
  const isFormComplete = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.country &&
      formData.phoneNumber &&
      formData.address &&
      formData.state &&
      formData.city &&
      formData.postalCode
    );
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  // --- SUBMISSION logic: POST to /customer-orders. Use proper keys/casing ---
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault && e.preventDefault();
    // Compose payload as required
    const payload = {
      language_id: 1, // change to dynamic if needed
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      residence: formData.country,
      phone: `${formData.phoneCode}${formData.phoneNumber}`,
      first_line_add: formData.address,
      state_province: formData.state,
      city: formData.city,
      postal_zipcode: formData.postalCode,
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
      ...(appliedOfferCode ? {offer_code: appliedOfferCode} : {})
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
      console.log('Order response:', data);
    } catch (err) {
      console.error('Failed to submit order', err);
      setDiscountError('Failed to submit order. Please try again!');
    }
  };

  let cgstDiff = '', sgstDiff = '', igstDiff = '';
  if (selectedOrderCurrency === 'INR') {
    // Both offerPriceStr and *_with_* fields are strings (e.g. "₹15,881.40", "₹17,310.73"). Remove non-numeric chars, and subtract.
    const parse = (v:string) => parseFloat(String(v).replace(/[^0-9.\-]/g,'')) || 0;
    const offer = parse(offerPriceStr);
    if (cgstStr) cgstDiff = (parse(cgstStr) - offer).toFixed(2);
    if (sgstStr) sgstDiff = (parse(sgstStr) - offer).toFixed(2);
    if (igstStr) igstDiff = (parse(igstStr) - offer).toFixed(2);
  }

  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalScriptTag, setPaypalScriptTag] = useState<HTMLScriptElement|null>(null);
  const [paypalStatus, setPaypalStatus] = useState("");

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
      setPaypalStatus("");
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay', height: 40 },
        createOrder: async function(data: any, actions: any) {
          // POST to backend to create order
          setPaypalStatus('Contacting payment server...');
          try {
            const res = await fetch('/api/payments/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reportId: reportData?.id || '',
                licenseType: selectedOrderLicenseId,
                currency: selectedOrderCurrency,
                amount: (couponTotalNumeric > 0 ? couponTotalNumeric : finalTotal).toFixed(2),
              })
            });
            if (!res.ok) {
              const err = await res.json();
              setPaypalStatus('Failed to create PayPal order: ' + (err.error || res.status));
              throw new Error(err.error || 'Order creation failed');
            }
            const result = await res.json();
            setPaypalStatus('PayPal order created, awaiting payment...');
            return result.orderID;
          } catch (e:any) {
            setPaypalStatus('PayPal order failed: ' + (e.message || e.toString()));
    }
        },
        onApprove: async function(data: any, actions: any) {
          setPaypalStatus('Capturing payment...');
          try {
            const captureRes = await actions.order.capture();
            if (!captureRes.id || captureRes.status !== 'COMPLETED') {
              setPaypalStatus('Capture failed: Payment not completed, please try again.');
              return;
            }
            setPaypalStatus('Verifying payment...');
            // POST to backend to verify order
            const res = await fetch('/api/payments/verify-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderID: captureRes.id,
                reportId: reportData?.id || '',
                licenseType: selectedOrderLicenseId,
                amount: (couponTotalNumeric > 0 ? couponTotalNumeric : finalTotal).toFixed(2),
                currency: selectedOrderCurrency
              })
            });
            const result = await res.json();
            if (!res.ok || !result.valid) {
              setPaypalStatus('Payment error: ' + (result.error || 'Verification failed'));
              return;
            }
            setPaypalStatus('Order successful! Thank you.');
            // Save to external server (already implemented below)
            // Generate randoms required by external API contract
            const randomTxId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
            const payload = {
              user_id: 6,
              language_id: 1,
              order_id: captureRes.id,
              transaction_id: randomTxId,
              payment_method: 'PayPal',
              purchase_date: new Date().toISOString().split('T')[0],
              report_title: reportData?.title || '',
              invoice_file: ''
            };
            try {
              await fetch('https://dashboard.synapseaglobal.com/api/customer-orders/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
            } catch (e) {
              setPaypalStatus('Order completed, but error saving to backend.');
            }
            // Notify parent to render Order Confirmation step
            const orderDataForConfirmation = {
              orderId: captureRes.id,
              transactionId: payload.transaction_id,
              paymentMethod: 'PayPal',
              purchaseDate: payload.purchase_date,
              reportTitle: reportData?.title || '',
              licenseType: selectedLicense?.title || selectedOrderLicenseId,
              originalPrice: calculatedActualPrice,
              discountAmount: dynamicDiscount || discountAmount,
              subtotal: subtotal,
              customerEmail: formData.email || ''
            };
            onOrderSuccess && onOrderSuccess(orderDataForConfirmation);
          } catch (e:any) {
            setPaypalStatus('Verification failed: ' + (e.message || e.toString()));
          }
        },
        onError: function(err: any) {
          setPaypalStatus('Error with PayPal payment: ' + err);
        }
      }).render('#paypal-button-container');
    }
  }, [selectedPaymentMethod, paypalLoaded, finalTotal, selectedOrderCurrency, reportData, selectedOrderLicenseId, onOrderSuccess, selectedLicense, formData.email, calculatedActualPrice, discountAmount, subtotal, couponTotalNumeric]);

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-[#555353] hover:text-gray-700 transition-colors"
        style={{ 
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '16px',
          fontWeight: '400'
        }}
      >
        ← Back to License Selection
      </button>

      <div   className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left Column - Billing Details */}
        <div className="bg-white border border-[#B5B5B5] rounded-[20px] p-6 w-full lg:w-[762px] h-auto">
          <h2 className="text-[24px] text-gray-900 mb-6 billing-heading" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: '700', marginBottom:'41px' }}>
            1. {billingInformation?.bill_details_heading || billingInformation?.bill_info_heading || 'Your Billing Details'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="firstName" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.first_name_text || 'First Name'}*
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black w-full md:w-[353px] h-[50px]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.last_name_text || 'Last Name'}*
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black w-full md:w-[353px] h-[50px]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <Label htmlFor="email" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                {billingInformation?.email_text || 'Email Address'}*
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black w-full h-[50px]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                required
              />
            </div>

             {/* Country and Phone Number */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
               <div>
                 <Label htmlFor="country" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px'}}>
                   {billingInformation?.residence_text || 'Country of Residence'}*
                 </Label>
                 <select 
                   value={formData.country} 
                   onChange={(e) => handleInputChange("country", e.target.value)}
                   className="mt-1 border border-[#DBDBDB] rounded-[10px] bg-white w-full md:w-[353px] h-[50px] px-3 text-black appearance-none cursor-pointer focus:border-black focus:outline-none"
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
                <Label className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.phone || 'Phone Number'}*       
                </Label>
                <div className="relative w-full md:w-[353px] h-[50px]">
                  <Input
                    type="tel"
                    className="w-full h-full border border-[#DBDBDB] bg-white rounded-r-[10px] px-4 pl-[70px] text-black text-base placeholder-[#888888] focus:border-black"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    required
                  />
                  <select 
                    value={formData.phoneCode} 
                    onChange={(e) => handleInputChange("phoneCode", e.target.value)}
                    className="absolute m-2 left-0 top-0 border border-[#DBDBDB] rounded-[7px] bg-[#E8E8E8] text-[#767676] w-[61px] h-[30px] px-2 text-base z-10 shadow-none outline-1 focus:ring-0 focus:border-[#232323] appearance-none cursor-pointer"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="address" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.first_line_add || 'Street Address'}*
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white w-full md:w-[353px] h-[50px] text-black"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.state_province || 'State / Province'}*
                </Label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white w-full md:w-[353px] h-[50px] text-black"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  required
                >
                  <option value="" disabled style={{ color: '#888888' }}>Please select a state/province</option>
                  {states.map((s: any) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* City and Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="city" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.city || 'City'}*
                </Label>
                 <Input
                   value={formData.city} 
                   onChange={(e) => handleInputChange("city", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white w-full md:w-[353px] h-[50px] text-black"
                   style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                   required
                 />
              </div>
              <div>
                <Label htmlFor="postalCode" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.postal_zipcode || 'ZIP Code'}*
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white w-full md:w-[353px] h-[50px] text-black"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  required
                />
              </div>
            </div>

            {/* Company Details Checkbox */}
            <div className="flex items-center space-x-2 mb-6">
              <input
                type="checkbox"
                id="addCompanyDetails"
                checked={formData.addCompanyDetails}
                onChange={(e) => handleInputChange("addCompanyDetails", e.target.checked)}
                className="w-4 h-4 text-blue-600 border-1 border-black  rounded focus:ring-blue-500"
              />
              <Label htmlFor="addCompanyDetails" className="text-black font-normal" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                {billingInformation?.add_company_details || 'Add Company Details'}
              </Label>
            </div>

            {/* Company Details Fields - Only show when checkbox is checked */}
            {formData.addCompanyDetails && (
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="companyName" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                    {billingInformation?.company_name || 'Company Name'}
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black w-full md:w-[353px] h-[50px]"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="gstin" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                    {billingInformation?.GSTIN || 'GSTIN'}
                  </Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => handleInputChange("gstin", e.target.value)}
                    className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black w-full md:w-[353px] h-[50px]"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  />
                </div>
              </div>
            )}

            {/* Continue Button */}
            <Button
              type="submit"
              className="mt-6 bg-transparent border-1 border-black text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-md"
              style={{ 
                fontFamily: 'Space Mono, monospace',
                fontWeight: 'bold',
                width: '215px',
                height: '57px'
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
        </div>

        {/* Right Column - Order Summary */}
        <div 
          className="bg-white rounded-[20px] p-7 mt-12 lg:mt-0 lg:ml-12 w-full lg:w-[440px] h-auto"
          style={{
            border: '1px solid transparent',
            background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box'
          }}
        >
          <h2 className="text-[24px] text-gray-900 mb-[31px] billing-heading" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: '700' }}>
            {billInfoOrderSummary?.order_summary_heading || 'Order Summary'}
          </h2>

          {/* License and Currency Selectors */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <label className="block mb-1 text-xs text-gray-700 font-medium">{billInfoOrderSummary?.license_dropdown_text || 'Choose License'}</label>
               <select 
                value={selectedOrderLicenseId}
                onChange={e => setSelectedOrderLicenseId(e.target.value)}
                 className="w-[118px] h-[38px] border border-black rounded-none px-3 text-black appearance-none cursor-pointer"
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
              <label className="block mb-1 text-xs text-gray-700 font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {billingInformation?.currency_options_text || 'Currency'}
              </label>
              <select 
                value={selectedOrderCurrency} 
                onChange={e => setSelectedOrderCurrency(e.target.value)}
                className="w-[93px] h-[38px] border border-black rounded-none px-3 text-black appearance-none cursor-pointer"
                style={{ 
                  fontFamily: 'Space Grotesk, sans-serif',
                  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                  backgroundPosition: 'right 8px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '14px'
                }}
              >
                <option value="USD">USD $</option>
                <option value="INR">INR ₹</option>
                <option value="EUR">EUR €</option>
              </select>
            </div>
          </div>

          {/* Order Breakdown */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{licenseTitle}</div>
                <div className="text-sm text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>(One time purchase)</div>
              </div>
              <div className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {actualPriceStr}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{billInfoOrderSummary?.discount_percentage_text || 'Discount'}</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">{discountStr}</span>
              </div>
              <div className="font-medium text-green-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                -{discountAmount.toLocaleString()}
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
              <div className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {billInfoOrderSummary?.subtotal_text || 'Subtotal'}
              </div>
              <div className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {offerPriceStr}
              </div>
            </div>
            {isINR ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {billInfoOrderSummary?.CGST || 'CGST'}
                  </div>
                  <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  ₹{cgstDiff}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {billInfoOrderSummary?.SGST || 'SGST'}
                  </div>
                  <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  ₹{sgstDiff}
                  </div>
                </div>
                {/* IGST (use API string) */}
                {
                  (() => {
                    let igstStr = '';
                    if (selectedOrderLicenseId === 'single') {
                      igstStr = igstStr = checkoutPage?.single_license_offer_price_in_INR_with_IGST || '';
                    } else if (selectedOrderLicenseId === 'team') {
                      igstStr = igstStr = checkoutPage?.team_license_offer_price_in_INR_with_IGST || '';
                    } else if (selectedOrderLicenseId === 'enterprise') {
                      igstStr = igstStr = checkoutPage?.enterprise_license_offer_price_in_INR_with_IGST || '';
                    }
                    return igstStr ? (
                      <div className="flex justify-between items-center">
                        <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{billInfoOrderSummary?.IGST || 'IGST'}</div>
                        <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>₹{igstDiff}</div>
                      </div>
                    ) : null;
                  })()
                }
              </>
            ) : (
            <div className="flex justify-between items-center">
              <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {billInfoOrderSummary?.tax_text || 'Tax'}
              </div>
              <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {billInfoOrderSummary?.not_applicable_text || 'Not Applicable'}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3">
              <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {billInfoOrderSummary?.total_text || 'Total'}
              </div>
              <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {couponTotalStr || totalStr}
              </div>
            </div>
          </div>

          {/* Offer Code Link/Button */}
          <div className="mb-2">
            {showOfferField ? null : (
              <button type="button" className="text-blue-600 underline text-sm hover:text-blue-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                onClick={() => setShowOfferField(true)}>
                {billInfoOrderSummary?.have_offer_text || 'Have an offer code?'}
            </button>
            )}
            {showOfferField && (
              <div className="flex gap-2 mb-2">
                <Input
                  className="flex-1 border-[#DBDBDB] rounded-[8px] text-black"
                  value={offerCode}
                  placeholder="Enter offer code"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  onChange={(e) => setOfferCode(e.target.value)}
                />
                <Button
                  type="button"
                  className="bg-blue-600 text-white px-4"
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
            {discountError && <div className="text-red-500 text-xs mb-3">{discountError}</div>}
            {appliedOfferCode && dynamicDiscount > 0 && (
              <div className="text-green-700 text-xs mb-3">Applied: {appliedOfferCode} (-{dynamicDiscount})</div>
            )}
          </div>

          
        </div>
      </div>

       {/* Payment Method Section - Only show when form is complete */}
       {isFormComplete() && (
         <div className="bg-white border border-[#B5B5B5] rounded-[20px] p-6 mt-8 w-full lg:w-[762px] h-auto">
           <h2 className="text-[24px] text-gray-900 mb-6" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: '700' }}>
             2. {billingInformation?.payment_method_text || 'Payment Method'}
           </h2>
           
           <div className="space-y-4">
             {/* CCAvenue Payment Option */}
             <div 
               className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                 selectedPaymentMethod === "ccavenue" 
                   ? "border-blue-500 bg-blue-50" 
                   : "border-gray-200 hover:border-gray-300"
               }`}
               onClick={() => handlePaymentMethodChange("ccavenue")}
             >
               <div className="flex items-center space-x-3">
                 <input
                   type="radio"
                   name="paymentMethod"
                   value="ccavenue"
                   checked={selectedPaymentMethod === "ccavenue"}
                   onChange={() => handlePaymentMethodChange("ccavenue")}
                   className="w-4 h-4 text-blue-600"
                 />
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                     <span className="text-white font-bold text-sm">CC</span>
                   </div>
                   <div>
                     <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                       CCAvenue
                     </h3>
                     <p className="text-sm text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                       Credit/Debit Cards, Net Banking, UPI, Wallets
                     </p>
                   </div>
                 </div>
               </div>
             </div>

             {/* PayPal Payment Option */}
             <div 
               className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                 selectedPaymentMethod === "paypal" 
                   ? "border-blue-500 bg-blue-50" 
                   : "border-gray-200 hover:border-gray-300"
               }`}
               onClick={() => handlePaymentMethodChange("paypal")}
             >
               <div className="flex items-center space-x-3">
                 <input
                   type="radio"
                   name="paymentMethod"
                   value="paypal"
                   checked={selectedPaymentMethod === "paypal"}
                   onChange={() => handlePaymentMethodChange("paypal")}
                   className="w-4 h-4 text-blue-600"
                 />
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                     <span className="text-white font-bold text-sm">PP</span>
                   </div>
                   <div>
                     <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                       PayPal
                     </h3>
                     <p className="text-sm text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                       Pay with your PayPal account
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Payment Button */}
           {selectedPaymentMethod === 'paypal' && (
             <div className="py-8">
               <div id="paypal-button-container"></div>
               {paypalStatus && <div className="mt-4 text-blue-700 text-base">{paypalStatus}</div>}
             </div>
           )}
           
         </div>
       )}
    </div>
  );
}
