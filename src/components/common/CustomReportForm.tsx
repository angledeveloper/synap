"use client";

import React, { useState, useEffect } from "react";
import { useLanguageStore } from '@/store';
import ReCAPTCHA from "react-google-recaptcha";
import { codeToId } from "@/lib/utils";
import phoneCodes from "@/utils/phoneCodes.json";

interface CustomReportFormData {
  id: number;
  language_id: string;
  heading: string;
  description: string;
  full_name: string;
  business_email: string;
  phone_no: string;
  country: string;
  requirements: string;
  timeline: string;
  terms: string;
  submit_btn: string;
}

interface FormData {
  fullName: string;
  businessEmail: string;
  phoneCode: string;
  phoneNumber: string;
  country: string;
  requirements: string;
  timeline: string;
  agreeTerms: boolean;
}

interface CustomReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle?: string;
}

export default function CustomReportForm({ isOpen, onClose }: CustomReportFormProps) {
  const { language } = useLanguageStore()
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    businessEmail: '',
    phoneCode: '+91', // Default to India or first in list? Keeping +91 as per previous default
    phoneNumber: '',
    country: '',
    requirements: '',
    timeline: '',
    agreeTerms: false
  });

  const [formFields, setFormFields] = useState<CustomReportFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormFields = async () => {
      if (!isOpen) return;

      try {
        setIsLoading(true);

        const languageId = codeToId[language as keyof typeof codeToId] || '1';
        const response = await fetch(`https://dashboard.synapseaglobal.com/api/custom-report-form/${languageId}`, {
          // Add cache-busting to prevent stale data
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        });
        const data = await response.json();

        if (data.status && data.forms_custom_reports) {
          setFormFields(data.forms_custom_reports);
        }
      } catch (error) {
        console.error('Error fetching form fields:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormFields();
  }, [isOpen, language]);

  useEffect(() => {
    // Reset form data and success state when language changes or modal opens/closes
    if (!isOpen) {
      setIsSuccess(false);
      setFormData({
        fullName: '',
        businessEmail: '',
        phoneCode: '+91',
        phoneNumber: '',
        country: '',
        requirements: '',
        timeline: '',
        agreeTerms: false
      });
      setRecaptchaToken(null);
    }
  }, [language, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit form data to the backend
      const submissionResponse = await fetch('https://dashboard.synapseaglobal.com/api/custom-report-form-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          business_email: formData.businessEmail,
          phone_number: `${formData.phoneCode} ${formData.phoneNumber}`,
          country: formData.country,
          requirements: formData.requirements,
          timeline: formData.timeline,
          language_id: codeToId[language as keyof typeof codeToId] || '1',
          'g-recaptcha-response': recaptchaToken
        }),
      });

      if (!submissionResponse.ok) {
        throw new Error('Failed to submit form');
      }

      console.log('Custom Report Form submitted successfully');
      setIsSuccess(true);

      // Reset form (state is maintained for reopening, but fields cleared)
      setFormData({
        fullName: '',
        businessEmail: '',
        phoneCode: '+91',
        phoneNumber: '',
        country: '',
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-md bg-opacity-10 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 backdrop-blur-md bg-opacity-10 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="rounded-lg p-[1px] bg-gradient-to-r from-[#1160C9] to-[#08D2B8] w-full max-w-3xl shadow-xl transition-all duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg p-5 w-full h-full overflow-hidden">
          {/* Close Button absolute top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <h2
                className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#1160C9] to-[#08D2B8] pb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Thank you
              </h2>
              <p className="text-[#242424] text-sm md:text-base max-w-md" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Your response has been recorded. We shall get in touch within 24 hours.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4 pr-6">
                <h2 className="text-[18px] text-[#242424]" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 'bold' }}>
                  {formFields?.heading || 'Request Custom Report'}
                </h2>
              </div>

              {formFields?.description && (
                <p className="text-[#242424] text-sm mb-4 hidden md:block" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 'normal' }}>
                  {formFields.description}
                </p>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                {/* Row 1: Name & Email */}
                <div className="col-span-1">
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={formFields?.full_name || 'Full Name *'}
                    className="w-full px-3 py-2 text-sm border border-[#D3D3D3] rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-[#969696]"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="email"
                    id="businessEmail"
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                    placeholder={formFields?.business_email || 'Business Email *'}
                    className="w-full px-3 py-2 text-sm border border-[#D3D3D3] rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-[#969696]"
                    required
                  />
                </div>

                {/* Row 2: Phone & Country */}
                <div className="col-span-1 flex gap-2">
                  <select
                    value={formData.phoneCode}
                    onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                    className="w-[30%] px-0 py-2 text-sm border border-[#D3D3D3] rounded-md focus:ring-1 focus:ring-blue-500 text-[#969696] bg-white text-center"
                  >
                    {/* Map over imported phoneCodes */}
                    {phoneCodes.map((p: any) => (
                      <option key={p.dial_code + p.name} value={p.dial_code}>{p.dial_code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder={formFields?.phone_no || 'Phone Number'}
                    className="w-[70%] px-3 py-2 text-sm border border-[#D3D3D3] rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-[#969696]"
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="text"
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country *"
                    className="w-full px-3 py-2 text-sm border border-[#D3D3D3] rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-[#969696]"
                    required
                  />
                </div>


                {/* Row 3: Requirements & Timeline */}
                <div className="col-span-1 md:row-span-2">
                  <textarea
                    id="requirements"
                    rows={5}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder={formFields?.requirements || 'Requirements *'}
                    className="w-full h-full px-3 py-2 text-sm border border-[#D3D3D3] rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-[#969696] resize-none"
                    required
                  />
                </div>

                <div className="col-span-1 flex flex-col justify-between h-auto">
                  <div className="flex flex-col gap-3">
                    <select
                      id="timeline"
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#D3D3D3] rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-[#969696]"
                    >
                      <option value="">{formFields?.timeline || 'Preferred Timeline'}</option>
                      <option value="ASAP">ASAP</option>
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="2-4 weeks">2-4 weeks</option>
                      <option value="1+ month">1+ month</option>
                    </select>

                    <div className="scale-[0.80] origin-left">
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                        onChange={(token) => setRecaptchaToken(token)}
                      />
                    </div>

                    <div className="text-[10px] text-gray-400 leading-tight text-left" dangerouslySetInnerHTML={{ __html: formFields?.terms || '' }} />
                  </div>
                </div>

                {/* Row 4: Submit */}
                <div className="col-span-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 text-white font-semibold rounded-md focus:outline-none text-sm"
                    style={{
                      background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                      border: 'none'
                    }}
                    disabled={isSubmitting || !recaptchaToken}
                  >
                    {isSubmitting ? 'Submitting...' : (formFields?.submit_btn || 'Submit')}
                  </button>
                </div>

              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}