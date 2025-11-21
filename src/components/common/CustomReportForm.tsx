"use client";

import React, { useState, useEffect } from "react";
import { useLanguageStore } from '@/store';
import ReCAPTCHA from "react-google-recaptcha";
import { codeToId } from "@/lib/utils";

interface CustomReportFormData {
  id: number;
  language_id: string;
  heading: string;
  description: string;
  full_name: string;
  business_email: string;
  phone_no: string;
  requirements: string;
  timeline: string;
  terms: string;
  submit_btn: string;
}

interface FormData {
  fullName: string;
  businessEmail: string;
  phoneNumber: string;
  requirements: string;
  timeline: string;
  agreeTerms: boolean;
}

interface CustomReportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomReportForm({ isOpen, onClose }: CustomReportFormProps) {
  const { language } = useLanguageStore()
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    businessEmail: '',
    phoneNumber: '',
    requirements: '',
    timeline: '',
    agreeTerms: false
  });

  const [formFields, setFormFields] = useState<CustomReportFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  // Reset form data when language changes
  setFormData({
    fullName: '',
    businessEmail: '',
    phoneNumber: '',
    requirements: '',
    timeline: '',
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
      // Submit form data to the backend
      const submissionResponse = await fetch('https://dashboard.synapseaglobal.com/api/custom-report-form-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          business_email: formData.businessEmail,
          phone_number: formData.phoneNumber,
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
      onClose();
      
      // Reset form
      setFormData({
        fullName: '',
        businessEmail: '',
        phoneNumber: '',
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
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] text-[#242424]" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 'bold' }}>
            {formFields?.heading || 'Request Custom Report'}
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
              placeholder={formFields?.full_name || 'Full Name *'}
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
              placeholder={formFields?.business_email || 'Business Email *'}
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
            <textarea
              id="requirements"
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              placeholder={formFields?.requirements || 'Requirements *'}
              className="w-full px-4 py-3 border border-[#D3D3D3] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#969696] "
              required
            />
          </div>

          <div>
            <select
              id="timeline"
              value={formData.timeline}
              onChange={(e) => setFormData({...formData, timeline: e.target.value})}
              className="w-full px-4 py-3 border border-[#D3D3D3] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#969696]"
            >
              <option value="">{formFields?.timeline || 'Preferred Timeline'}</option>
              <option value="ASAP">ASAP</option>
              <option value="1-2 weeks">1-2 weeks</option>
              <option value="2-4 weeks">2-4 weeks</option>
              <option value="1+ month">1+ month</option>
            </select>
          </div>

          <div className="w-full py-2 ">
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