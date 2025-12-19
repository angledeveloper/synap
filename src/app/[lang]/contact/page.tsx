"use client";

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store';
import { codeToId } from '@/lib/utils';
import CallToAction from '@/components/common/CallToAction';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import GlobalFooter from '@/components/layout/GlobalFooter';
import phoneCodes from '@/utils/phoneCodes.json';

interface ContactUsData {
  id: number;
  language_id: string;
  heading: string;
  have_question: string;
  our_team: string;
  full_name: string;
  business_email: string;
  phone_no: string;
  job_title: string;
  country: string;
  type: string;
  description: string;
  btn_text: string;
}

export default function ContactPage() {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneCode: '+1',
    phoneNumber: '',
    jobTitle: '',
    country: '',
    inquiryType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [contactData, setContactData] = useState<ContactUsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setIsLoading(true);
        const languageId = codeToId[language as keyof typeof codeToId] || '1';
        const response = await fetch(`${process.env.NEXT_PUBLIC_DB_URL}contactus/${languageId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch contact data');
        }

        const data = await response.json();
        setContactData(data.contactus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contact information');
        console.error('Error fetching contact data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, [language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const payload = {
        language_id: codeToId[language as keyof typeof codeToId] || '1',
        full_name: formData.fullName,
        business_email: formData.email,
        phone_code: formData.phoneCode,
        phone_no: formData.phoneCode + ' ' + formData.phoneNumber.trim(),
        job_title: formData.jobTitle,
        country: formData.country,
        type: formData.inquiryType,
        description: formData.message,
      };

      // Form submission initiated

      const response = await fetch(`${process.env.NEXT_PUBLIC_DB_URL}contact-us-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        responseData = {};
      }

      // Request completed

      if (!response.ok) {
        throw new Error(
          responseData.message ||
          responseData.error ||
          `Server responded with status: ${response.status} ${response.statusText}`
        );
      }

      // If we get here, the submission was successful
      setSubmitStatus({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phoneCode: '+1',
        phoneNumber: '',
        jobTitle: '',
        country: '',
        inquiryType: '',
        message: '',
      });

    } catch (err) {
      const error = err as Error;
      console.error('Form submission error:', error.message);

      setSubmitStatus({
        success: false,
        message: error.message || 'Failed to submit form. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!contactData) return null;

  return (
    <>
      <section className="relative text-white">
        <Image
          src="/contact-hero.jpg"
          alt="Contact Background"
          fill
          className="bg-no-repeat object-cover object-center md:object-left-top"
          priority
          sizes="100vw"
          style={{
            objectPosition: 'center center',
          }}
        />
        {/* Mobile overlay for better readability */}
        <div className="md:hidden absolute inset-0 "></div>

        <div className="relative m-auto mt-12 flex w-full max-w-[1440px] flex-col justify-center py-16 md:py-24 p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-36">
            {/* Left Side - Content */}
            <div className="w-full md:w-full max-w-[500px] text-white order-1 md:order-1">
              <h1 className="mb-6 md:mb-12 text-[32px] md:text-[40px] font-bold leading-tight">
                {contactData.heading}
              </h1>
              <p className="text-[18px] md:text-[23px] text-gray-200">
                {contactData.have_question}
              </p>
              <p className="mt-6 text-[14px] md:text-[14px] text-gray-200 max-w-[388px] break-words">
                {contactData.our_team}
              </p>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-[332px] order-2 md:order-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={`${contactData.full_name} *`}
                    className="w-full h-[40px] rounded-[7px] bg-[#242424] px-3 md:px-4 text-white placeholder-[#969696] focus:border-white focus:outline-none focus:ring-1 focus:ring-white text-[15px]"
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={`${contactData.business_email} *`}
                    className="w-full h-[40px] rounded-[7px] bg-[#242424] px-3 md:px-4 text-white placeholder-[#969696] focus:border-white focus:outline-none focus:ring-1 focus:ring-white text-[15px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1 relative">
                    <select
                      name="phoneCode"
                      value={formData.phoneCode}
                      onChange={handleChange}
                      className="w-full h-[40px] rounded-[7px] bg-[#242424] px-2 md:px-3 text-white text-[15px] focus:outline-none appearance-none"
                    >
                      <option value="" disabled>Code</option>
                      {phoneCodes.map((p: any) => (
                        <option key={p.dial_code + p.name} value={p.dial_code}>{p.dial_code}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="#969696" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder={contactData.phone_no}
                      className="w-full h-[40px] rounded-[7px] bg-[#242424] px-3 md:px-4 text-white placeholder-[#969696] focus:outline-none text-[15px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle || ''}
                      onChange={handleChange}
                      placeholder={contactData.job_title}
                      className="w-full h-[40px] appearance-none rounded-[7px] bg-[#242424] px-3 md:px-4 text-white text-[15px] focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <select
                      id="country"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleChange}
                      className="w-full h-[40px] appearance-none rounded-[7px] bg-[#242424] px-3 md:px-4 text-white text-[15px] focus:outline-none"
                    >
                      <option value="" disabled>{contactData.country}</option>
                      <option value="US">US</option>
                      <option value="CA">CA</option>
                      <option value="UK">UK</option>
                      <option value="AU">AU</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="#969696" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType || ''}
                    onChange={handleChange}
                    className="w-full h-[40px] appearance-none rounded-[7px] bg-[#242424] px-3 md:px-4 text-white text-[15px] mb-2 focus:outline-none"
                  >
                    <option value="" disabled>{contactData.type}</option>
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales</option>
                    <option value="support">Support</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 mb-2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="#969696" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={`${contactData.description} *`}
                    className="w-full h-[120px] md:h-[158px] resize-none rounded-[7px] bg-[#242424] px-3 md:px-4 py-3 text-white placeholder-[#969696] focus:outline-none text-[15px]"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-white px-4 md:px-6 py-3 font-medium focus:outline-none disabled:opacity-50 min-w-0 text-sm md:text-base"
                  >
                    <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                      {isSubmitting ? 'Submitting...' : contactData.btn_text}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <CallToAction
        title="Ready to Transform Your Market Strategy?"
        buttonText="Check our Research"
        buttonLink={`/${language}/reports`}
      />
    </>
  );
}

