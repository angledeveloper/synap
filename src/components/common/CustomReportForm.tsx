"use client";

import React, { useState, useEffect } from "react";
import { useLanguageStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReCAPTCHA from 'react-google-recaptcha';

interface CustomReportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomReportForm({ isOpen, onClose }: CustomReportFormProps) {
  const { language } = useLanguageStore();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    businessEmail: '',
    phoneNumber: '',
    countryCode: '+1',
    requirements: '',
    timeline: '',
    agreeTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    if (!recaptchaToken) {
      alert('Please verify you are not a robot');
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify reCAPTCHA token with your backend
      const verificationResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      const verificationResult = await verificationResponse.json();

      if (!verificationResult.success) {
        throw new Error('reCAPTCHA verification failed');
      }

      console.log('Custom Report Form submitted:', formData);
      onClose();
      
      // Reset form
      setFormData({
        fullName: '',
        businessEmail: '',
        phoneNumber: '',
        countryCode: '+1',
        requirements: '',
        timeline: '',
        agreeTerms: false
      });
      setRecaptchaToken(null);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-md bg-opacity-10 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="rounded-[10px] w-[600px] h-[765px] overflow-hidden shadow-xl"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.94)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="text-left mb-6">
            <h2 className="text-[20px] text-black mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 'bold' }}>Request Custom Report</h2>
            <p className="text-black text-[16px]" >
              Please provide your requirements for a customized report. Our team will get back to you with a tailored solution.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Input
                id="fullName"
                type="text"
                placeholder="Full Name*"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full h-[40px] p-3 border border-gray-300 rounded-[7px] bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-[#969696]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                required
              />
            </div>

            {/* Business Email */}
            <div>
              <Input
                id="businessEmail"
                type="email"
                placeholder="Business Email*"
                value={formData.businessEmail}
                onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                className="w-full h-[40px] p-3 border border-gray-300 rounded-[7px] bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-[#969696]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                required
              />
            </div>

            {/* Phone Number with Country Code */}
            <div className="flex gap-2">
              <Select 
                value={formData.countryCode}
                onValueChange={(value) => handleInputChange('countryCode', value)}
              >
                <SelectTrigger className="w-[73px] h-[40px] p-3 border border-gray-300 rounded-[7px] bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#969696]">
                  <SelectValue placeholder="+91" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">+1 (US)</SelectItem>
                  <SelectItem value="+44">+44 (UK)</SelectItem>
                  <SelectItem value="+91">+91 (IN)</SelectItem>
                  <SelectItem value="+86">+86 (CN)</SelectItem>
                  <SelectItem value="+81">+81 (JP)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="tel"
                placeholder="Phone Number*"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white h-[40px] placeholder:text-[#969696]"
              />
            </div>

            {/* Message */}
            <div>
              <textarea
                placeholder="Please describe your specific requirements for custom reports*"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white placeholder:text-[#969696]"
                required
              />
            </div>

            {/* Preferred Timeline */}
            <div>
              <Select 
                value={formData.timeline}
                onValueChange={(value) => handleInputChange('timeline', value)}
              >
                <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white h-[40px]">
                  <SelectValue placeholder="Preferred Timeline*%" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                  <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                  <SelectItem value="1-2 months">1-2 months</SelectItem>
                  <SelectItem value="2+ months">2+ months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* reCAPTCHA */}
            <div className="py-2">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="recaptcha"
                  checked={formData.agreeTerms}
                  onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1 flex-shrink-0"
                />
                <label htmlFor="recaptcha" className="text-sm text-gray-600">
                  I'm not a robot
                </label>
              </div>
            </div>

            <div className="mt-4">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
                className="mb-4"
              />
              <Button
                type="submit"
                className="w-full py-3 text-white font-semibold rounded-lg"
                style={{ 
                  fontFamily: 'Space Grotesk, sans-serif',
                  background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                  border: 'none'
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Request Custom Report'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
