"use client";

import React, { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useLanguageStore } from "@/store";
import { codeToId } from "@/lib/utils";

interface SampleReportFormData {
  id: number;
  language_id: string;
  heading: string;
  description: string;
  full_name: string;
  business_email: string;
  phone_no: string;
  job_title: string;
  country: string;
  industry_focus: string;
  requirements: string;
  timeline: string;
  terms: string;
  submit_btn: string;
}

interface FormData {
  fullName: string;
  businessEmail: string;
  phoneNumber: string;
  jobTitle: string;
  country: string;
  industryFocus: string;
  comments: string;
  agreeTerms: boolean;
}

interface SampleReportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SampleReportForm({ isOpen, onClose }: SampleReportFormProps) {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    businessEmail: '',
    phoneNumber: '',
    jobTitle: '',
    country: '',
    industryFocus: '',
    comments: '',
    agreeTerms: false
  });

  const [formFields, setFormFields] = useState<SampleReportFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormFields = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        const languageId = codeToId[language as keyof typeof codeToId] || '1';
        const response = await fetch(`https://dashboard.synapseaglobal.com/api/samplepdfform/${languageId}`);
        const data = await response.json();
        
        if (data.status && data.samplepdfform) {
          setFormFields(data.samplepdfform);
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
  // Reset form data when language changes
  setFormData({
    fullName: '',
    businessEmail: '',
    phoneNumber: '',
    jobTitle: '',
    country: '',
    industryFocus: '',
    comments: '',
    agreeTerms: false
  });
  setRecaptchaToken(null); // Also reset reCAPTCHA
}, [language]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA');
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionResponse = await fetch('https://dashboard.synapseaglobal.com/api/pdf-form-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language_id: codeToId[language as keyof typeof codeToId] || '1',
          full_name: formData.fullName,
          business_email: formData.businessEmail,
          phone_no: formData.phoneNumber,
          job_title: formData.jobTitle,
          country: formData.country,
          industry_focus: formData.industryFocus,
          comments: formData.comments,
          'g-recaptcha-response': recaptchaToken
        }),
      });

      if (!submissionResponse.ok) {
        throw new Error('Failed to submit form');
      }

      console.log('Sample Report Form submitted successfully');
      onClose();
      
      // Reset form
      setFormData({
        fullName: '',
        businessEmail: '',
        phoneNumber: '',
        jobTitle: '',
        country: '',
        industryFocus: '',
        comments: '',
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
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] text-[#242424]" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 'bold' }}>
            {formFields?.heading || 'Request Sample Report'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {formFields?.description && (
          <p className="text-[#242424] mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 'normal' }}>
            {formFields.description}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder={`${formFields?.full_name || 'Full Name'} *`}
              className="w-full px-4 py-3 border border-[#D3D3D3] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#969696]"
              required
            />
          </div>

          <div>
            <input
              type="email"
              id="businessEmail"
              value={formData.businessEmail}
              onChange={(e) => setFormData({...formData, businessEmail: e.target.value})}
              placeholder={`${formFields?.business_email || 'Business Email'} *`}
              className="w-full px-4 py-3 border border-[#D3D3D3] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#969696]"
              required
            />
          </div>

          <div>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              placeholder={formFields?.phone_no || 'Phone Number'}
              className="w-full px-4 py-3 border border-[#D3D3D3] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#969696]"
            />
          </div>

          <div>
            <input
              type="text"
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              placeholder="Country *"
              className="w-full px-4 py-3 border border-[#D3D3D3] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#969696]"
              required
            />
          </div>

          <div>
            <textarea
              id="comments"
              rows={4}
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              placeholder={formFields?.requirements || 'Your requirements *'}
              className="w-full px-4 py-3 border border-[#D3D3D3] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#969696]"
              required
            />
          </div>

          <div className="w-full py-2">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={(token) => setRecaptchaToken(token)}
            />
          </div>

          <div className="text-xs text-gray-500 mt-2" dangerouslySetInnerHTML={{ __html: formFields?.terms || '' }} />

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 text-white font-semibold rounded-md focus:outline-none"
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
      </div>
    </div>
  );
}