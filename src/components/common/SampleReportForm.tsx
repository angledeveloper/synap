"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SampleReportFormProps {
  onClose: () => void;
  onSubmit: (data: {
    fullName: string;
    businessEmail: string;
    countryCode: string;
    phoneNumber: string;
    country: string;
  }) => void;
  initialData?: {
    fullName?: string;
    businessEmail?: string;
    countryCode?: string;
    phoneNumber?: string;
    country?: string;
  };
}

export default function SampleReportForm({ onClose, onSubmit, initialData = {} }: SampleReportFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    businessEmail: initialData.businessEmail || '',
    countryCode: initialData.countryCode || '+1',
    phoneNumber: initialData.phoneNumber || '',
    country: initialData.country || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-8 w-full max-w-md relative"
        style={{
          boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-[#0B1018] mb-2" style={{ 
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '20px',
          fontWeight: 700
        }}>
          Request Sample PDF
        </h2>
        
        <p className="text-base text-[#000000] mb-6" style={{ 
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 400
        }}>
          Please enter your details
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '14px',
                lineHeight: '20px'
              }}
              placeholder="Enter your full name"
            />
          </div>
          
          {/* Business Email */}
          <div>
            <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Business Email *
            </label>
            <input
              type="email"
              id="businessEmail"
              name="businessEmail"
              required
              value={formData.businessEmail}
              onChange={(e) => handleInputChange('businessEmail', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '14px',
                lineHeight: '20px'
              }}
              placeholder="Enter your business email"
            />
          </div>
          
          {/* Phone Number with Country Code */}
          <div className="flex gap-2">
            <div className="w-1/3">
              <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 mb-1">
                Code *
              </label>
              <div className="relative">
                <select
                  id="countryCode"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={(e) => handleInputChange('countryCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px'
                  }}
                >
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          {/* Country Dropdown */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <div className="relative">
              <select
                id="country"
                name="country"
                required
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="IN">India</option>
                <option value="AU">Australia</option>
                <option value="CA">Canada</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* reCAPTCHA Placeholder */}
          <div className="py-4">
            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  id="captcha"
                  name="captcha"
                  type="checkbox"
                  required
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <label htmlFor="captcha" className="ml-2 block text-sm text-gray-700">
                I'm not a robot
              </label>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              background: 'linear-gradient(90deg, #1160C9 0%, #08D2B8 100%)',
              fontSize: '16px',
              lineHeight: '24px'
            }}
          >
            Submit Now
          </button>
        </form>
      </div>
    </div>
  );
}
