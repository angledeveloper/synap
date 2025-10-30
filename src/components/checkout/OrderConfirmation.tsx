"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Download, Phone, FileText } from 'lucide-react';

interface OrderConfirmationProps {
  orderId: string;
  transactionId: string;
  paymentMethod: string;
  purchaseDate: string;
  reportTitle: string;
  licenseType: string;
  originalPrice: number;
  discountAmount: number;
  subtotal: number;
  customerEmail: string;
  onDownloadInvoice: () => void;
  onCallAnalyst: () => void;
  onClose?: () => void;
  orderConfirmation?: any; // API data for order confirmation
}

export default function OrderConfirmation({
  orderId,
  transactionId,
  paymentMethod,
  purchaseDate,
  reportTitle,
  licenseType,
  originalPrice,
  discountAmount,
  subtotal,
  customerEmail,
  onDownloadInvoice,
  onCallAnalyst,
  onClose,
  orderConfirmation
}: OrderConfirmationProps) {
  return (
    <div className="w-full">
      {/* Close Button */}
      {onClose && (
        <div className="mb-6">
          <button
            onClick={onClose}
            className="text-[#555353] hover:text-gray-700 transition-colors"
            style={{ 
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '16px',
              fontWeight: '400'
            }}
          >
            ← Back to Reports
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - Confirmation and Delivery Information */}
          <div className="space-y-8">
            {/* Success Message */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {orderConfirmation?.thank_you_text || 'Thank you for your purhase!'}
              </h1>
              
              <p className="text-lg text-gray-600 mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {orderConfirmation?.payment_confirm_description || 'Payment received succesfully. You\'ll receive payment confirmation and an invoice on your email soon.'}
              </p>
            </div>

            {/* Report Delivery Card */}
            <Card className="p-6 border border-gray-200 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {orderConfirmation?.report_delivery_text || 'Report Delvery in Progress....'}
                  </h3>
                  <p className="text-gray-600 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {orderConfirmation?.report_delivery_description || 'Our tea is preparing your report package. You\'ll receive it at'} <span className="font-medium">{customerEmail}</span> {orderConfirmation?.report_delivery_description?.includes('within') ? '' : 'within 24-72 business hours. You will also be contacted by our analyst during that time.'}
                  </p>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={onCallAnalyst}
                      variant="outline"
                      className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {orderConfirmation?.call_anaylyst_btn_text || 'Call Anlyst'}
                    </Button>
                    
                    <Button
                      onClick={onDownloadInvoice}
                      className="w-full bg-gray-800 text-white hover:bg-gray-700"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {orderConfirmation?.download_invoice_btn_text || 'Dowload Invoice'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Thank You Message */}
            <p className="text-sm text-gray-500 text-center lg:text-left" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {orderConfirmation?.thank_you_description || 'Thank you for chosing SynapSEA Global. Your trust empowers us to deliver data-driven intelligence that drives real-world impact.'}
            </p>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:ml-8">
            <Card className="p-6 border-l-4 border-blue-500 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {orderConfirmation?.order_summary_heading || 'Your Order ummary:'}
              </h2>
              
              {/* Order Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{orderConfirmation?.order_id_text || 'Order ID'}:</span>
                  <span className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{orderConfirmation?.transaction_id_text || 'Transaction ID'}:</span>
                  <span className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{orderConfirmation?.payment_method_text || 'Payment Method'}:</span>
                  <span className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{orderConfirmation?.purchase_date_text || orderConfirmation?.report_date_text || 'Purchase Date'}:</span>
                  <span className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{purchaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{orderConfirmation?.report_title || 'Report Title'}:</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {reportTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{orderConfirmation?.license_type_text || 'License Type'}:</span>
                  <span className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{licenseType}</span>
                </div>
              </div>

              <hr className="border-gray-200 my-6" />

              {/* Pricing Breakdown */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{licenseType}</span>
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs">?</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      ${originalPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      (One time purchase)
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Discount</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      20% off
                    </span>
                  </div>
                  <div className="font-medium text-green-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    -${discountAmount.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <div className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Subtotal
                  </div>
                  <div className="font-medium text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ${subtotal.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Tax
                  </div>
                  <div className="text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Not applicable
                  </div>
                </div>

                <hr className="border-gray-300 my-4" />

                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Total
                  </div>
                  <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ${subtotal.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
    </div>
  );
}
