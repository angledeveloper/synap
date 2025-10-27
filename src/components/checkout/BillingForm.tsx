import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import CurrencySelector from "@/components/checkout/CurrencySelector";
import type { LicenseOption, ReportData } from "@/app/[lang]/reports/[id]/checkout/page";

export interface BillingFormProps {
  selectedLicense: LicenseOption;
  reportData: ReportData;
  onContinue: () => void;
  onBack: () => void;
  billingInformation?: any; // Accept labels from API
  billInfoOrderSummary?: any;
  licenseOptions: LicenseOption[];
  checkoutPage?: any; // Add checkout_page data for pricing
}

export default function BillingForm({ selectedLicense, reportData, onContinue, onBack, billingInformation, billInfoOrderSummary, licenseOptions, checkoutPage }: BillingFormProps) {
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
    // Calculate original price: offerPrice = originalPrice * (1 - discountPercent/100)
    calculatedActualPrice = offerPrice / (1 - discountPercent / 100);
  }
  
  const discountAmount = calculatedActualPrice > 0 ? (calculatedActualPrice - offerPrice) : 0;
  const subtotal = offerPrice;
  const isINR = selectedOrderCurrency === 'INR';
  const cgst = isINR ? +(subtotal * 0.09).toFixed(2) : 0; // 9% CGST
  const igst = isINR ? +(subtotal * 0.09).toFixed(2) : 0; // 9% IGST
  const total = subtotal + cgst + igst;
  
  console.log('Debug - Final calculations:', { 
    offerPrice, 
    actualPrice, 
    calculatedActualPrice, 
    discountAmount, 
    subtotal, 
    total 
  });

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

  const handlePayment = () => {
    if (selectedPaymentMethod === "ccavenue") {
      // Handle CCAvenue payment
      console.log("Processing CCAvenue payment...");
      // Here you would integrate with CCAvenue API
    } else if (selectedPaymentMethod === "paypal") {
      // Handle PayPal payment
      console.log("Processing PayPal payment...");
      // Here you would integrate with PayPal API
    }
  };

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
        <div className="bg-white border border-[#B5B5B5] rounded-[20px] p-6" style={{ width: '762px', height: '896px' }}>
          <h2 className="text-[24px] text-gray-900 mb-6 billing-heading" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: '700', marginBottom:'41px' }}>
            1. {billingInformation?.bill_details_heading || billingInformation?.bill_info_heading || 'Your Billing Details'}:
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="firstName" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.first_name_text || 'First Name'}*
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', width: '353px', height: '50px'}}
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
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', width: '353px', height: '50px' }}
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
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black"
                style={{ fontFamily: 'Space Grotesk, sans-serif', width: '722px', height: '50px' }}
                required
              />
            </div>

             {/* Country and Phone Number */}
             <div className="grid grid-cols-2 gap-4 mb-6">
               <div>
                 <Label htmlFor="country" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px'}}>
                   {billingInformation?.residence_text || 'Country of Residence'}*
                 </Label>
                 <select 
                   value={formData.country} 
                   onChange={(e) => handleInputChange("country", e.target.value)}
                   className="mt-1 border border-[#DBDBDB] rounded-[10px] bg-white w-[353px] h-[50px] px-3 text-black appearance-none cursor-pointer focus:border-black focus:outline-none"
                   style={{ 
                     fontFamily: 'Space Grotesk, sans-serif',
                     backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                     backgroundPosition: 'right 12px center',
                     backgroundRepeat: 'no-repeat',
                     backgroundSize: '16px'
                   }}
                 >
                   <option value="" disabled style={{ color: '#888888' }}>Please select an option</option>
                   <option value="United States">United States</option>
                   <option value="Canada">Canada</option>
                   <option value="United Kingdom">United Kingdom</option>
                   <option value="Germany">Germany</option>
                   <option value="France">France</option>
                   <option value="India">India</option>
                   <option value="Australia">Australia</option>
                 </select>
              </div>

              <div>
                <Label className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.phone || 'Phone Number'}*       
                </Label>
                <div className="relative w-[353px] h-[50px]">
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
                    <option value="+1">+1</option>
                    <option value="+91">+91</option>
                    <option value="+44">+44</option>
                    <option value="+49">+49</option>
                    <option value="+33">+33</option>
                    <option value="+61">+61</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address and State/Province */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="address" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.first_line_add || 'Street Address'}*
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white w-[353px] h-[50px] text-black"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.state_province || 'State / Province'}*
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white w-[353px] h-[50px] text-black"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  required
                />
              </div>
            </div>

            {/* City and Postal Code */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="city" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.city || 'City'}*
                </Label>
                 <select 
                   value={formData.city} 
                   onChange={(e) => handleInputChange("city", e.target.value)}
                   className="mt-1 border border-[#DBDBDB] rounded-[10px] bg-white w-[353px] h-[50px] px-3 text-black appearance-none cursor-pointer focus:border-black focus:outline-none"
                   style={{ 
                     fontFamily: 'Space Grotesk, sans-serif',
                     backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                     backgroundPosition: 'right 12px center',
                     backgroundRepeat: 'no-repeat',
                     backgroundSize: '16px'
                   }}
                 >
                   <option value="" disabled style={{ color: '#888888' }}>Please select an option</option>
                   <option value="New York">New York</option>
                   <option value="Los Angeles">Los Angeles</option>
                   <option value="Chicago">Chicago</option>
                   <option value="Houston">Houston</option>
                   <option value="Phoenix">Phoenix</option>
                   <option value="Philadelphia">Philadelphia</option>
                 </select>
              </div>
              <div>
                <Label htmlFor="postalCode" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  {billingInformation?.postal_zipcode || 'ZIP Code'}*
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                   className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white w-[353px] h-[50px] text-black"
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
              <div className="flex flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="companyName" className="font-medium text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                    {billingInformation?.company_name || 'Company Name'}
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', width: '353px', height: '50px' }}
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
                    className="mt-1 border-[#DBDBDB] rounded-[10px] bg-white text-black"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', width: '353px', height: '50px' }}
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
          className="bg-white rounded-[20px] p-7 mt-12 lg:mt-0 lg:ml-12"
          style={{
            border: '1px solid transparent',
            background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box',
            width: '440px',
            height: '576px'
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
                ${calculatedActualPrice.toLocaleString()}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{billInfoOrderSummary?.discount_percentage_text || 'Discount'}</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">{discountPercent}% off</span>
              </div>
              <div className="font-medium text-green-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                -${discountAmount.toLocaleString()}
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
              <div className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {billInfoOrderSummary?.subtotal_text || 'Subtotal'}
              </div>
              <div className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                ${subtotal.toLocaleString()}
              </div>
            </div>
            {isINR ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {billInfoOrderSummary?.SGST || 'SGST'}
                  </div>
                  <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ₹{cgst.toLocaleString()}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {billInfoOrderSummary?.IGST || 'IGST'}
                  </div>
                  <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ₹{igst.toLocaleString()}
                  </div>
                </div>
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
                {isINR ? `₹${total.toLocaleString()}` : `$${total.toLocaleString()}`}
              </div>
            </div>
          </div>

          {/* Offer Code Link */}
          <div className="mb-8">
            <button className="text-blue-600 underline text-sm hover:text-blue-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {billInfoOrderSummary?.have_offer_text || 'Have an offer code?'}
            </button>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            className="bg-transparent border-1 border-black text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-md"
            style={{ 
              fontFamily: 'Space Mono, monospace',
              fontWeight: 'bold',
              width: '100%',
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
        </div>
      </div>

       {/* Payment Method Section - Only show when form is complete */}
       {isFormComplete() && (
         <div className="bg-white border border-[#B5B5B5] rounded-[20px] p-6 mt-8" style={{ width: '762px', height: '400px' }}>
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
           {selectedPaymentMethod && (
             <div className="mt-6">
               <Button
                 onClick={handlePayment}
                 className="w-full bg-gradient-to-r from-blue-600 to-green-400 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-all"
                 style={{ fontFamily: 'Space Grotesk, sans-serif' }}
               >
                 {selectedPaymentMethod === "ccavenue" ? "Pay with CCAvenue" : "Pay with PayPal"}
               </Button>
             </div>
           )}
         </div>
       )}
    </div>
  );
}
