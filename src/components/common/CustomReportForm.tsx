"use client";

import React, { useState } from "react";
import { useLanguageStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@iconify/react";

interface CustomReportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomReportForm({ isOpen, onClose }: CustomReportFormProps) {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState({
    fullName: '',
    businessEmail: '',
    phoneNumber: '',
    country: '',
    countryCode: '+91',
    reportRequirements: '',
    industryFocus: '',
    timeline: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Custom Report Form submitted:', formData);
    // Close popup after submission
    onClose();
    // Reset form
    setFormData({
      fullName: '',
      businessEmail: '',
      phoneNumber: '',
      country: '',
      countryCode: '+91',
      reportRequirements: '',
      industryFocus: '',
      timeline: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-md bg-white bg-opacity-10 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Request Custom Report
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon icon="mdi:close" className="text-2xl" />
            </button>
          </div>

          <p 
            className="text-gray-600 mb-6"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Please provide your requirements for a customized report. Our team will get back to you with a tailored solution.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label 
                htmlFor="fullName" 
                className="text-sm font-medium text-gray-700"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Full Name*
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Full Name*"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="mt-1 text-gray-900 placeholder-gray-500"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                required
              />
            </div>

            {/* Business Email */}
            <div>
              <Label 
                htmlFor="businessEmail" 
                className="text-sm font-medium text-gray-700"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Business Email*
              </Label>
              <Input
                id="businessEmail"
                type="email"
                placeholder="Business Email*"
                value={formData.businessEmail}
                onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                className="mt-1 text-gray-900 placeholder-gray-500"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label 
                htmlFor="phoneNumber" 
                className="text-sm font-medium text-gray-700"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Phone Number
              </Label>
              <div className="flex gap-2 mt-1">
                <Select 
                  value={formData.countryCode} 
                  onValueChange={(value) => handleInputChange('countryCode', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+33">+33</SelectItem>
                    <SelectItem value="+49">+49</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="flex-1 text-gray-900 placeholder-gray-500"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <Label 
                htmlFor="country" 
                className="text-sm font-medium text-gray-700"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Country
              </Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="CN">China</SelectItem>
                  <SelectItem value="BR">Brazil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Report Requirements */}
            <div>
              <Label 
                htmlFor="reportRequirements" 
                className="text-sm font-medium text-gray-700"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Report Requirements*
              </Label>
              <textarea
                id="reportRequirements"
                placeholder="Please describe your specific requirements for the custom report..."
                value={formData.reportRequirements}
                onChange={(e) => handleInputChange('reportRequirements', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 resize-none"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                rows={4}
                required
              />
            </div>

            {/* Industry Focus */}
            <div>
              <Label 
                htmlFor="industryFocus" 
                className="text-sm font-medium text-gray-700"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Industry Focus
              </Label>
              <Select 
                value={formData.industryFocus} 
                onValueChange={(value) => handleInputChange('industryFocus', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select industry focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology & Software</SelectItem>
                  <SelectItem value="healthcare">Healthcare & Life Sciences</SelectItem>
                  <SelectItem value="energy">Energy & Power</SelectItem>
                  <SelectItem value="automotive">Automotive & Transportation</SelectItem>
                  <SelectItem value="consumer">Consumer Goods & Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing & Industrial</SelectItem>
                  <SelectItem value="financial">Financial Services</SelectItem>
                  <SelectItem value="telecommunications">Telecommunications</SelectItem>
                  <SelectItem value="aerospace">Aerospace & Defense</SelectItem>
                  <SelectItem value="chemicals">Chemicals & Materials</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timeline */}
            <div>
              <Label 
                htmlFor="timeline" 
                className="text-sm font-medium text-gray-700"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Preferred Timeline
              </Label>
              <Select 
                value={formData.timeline} 
                onValueChange={(value) => handleInputChange('timeline', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent (1-2 weeks)</SelectItem>
                  <SelectItem value="standard">Standard (3-4 weeks)</SelectItem>
                  <SelectItem value="flexible">Flexible (1-2 months)</SelectItem>
                  <SelectItem value="long-term">Long-term (2+ months)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* reCAPTCHA */}
            <div className="py-4">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="recaptcha"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                />
                <div className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <div className="mb-2">
                    I agree to the{" "}
                    <a href={`/${language}/privacy`} className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href={`/${language}/terms`} className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>
                    .
                  </div>
                  <div className="text-xs text-gray-500">
                    This site is protected by reCAPTCHA and the Google{" "}
                    <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href="https://policies.google.com/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    apply.
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 text-white font-semibold rounded-lg"
              style={{ 
                fontFamily: 'Space Grotesk, sans-serif',
                background: 'linear-gradient(to right, #1160C9 0%, #08D2B8 100%)',
                border: 'none'
              }}
            >
              Request Custom Report
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
