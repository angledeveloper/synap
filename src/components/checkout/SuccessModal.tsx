import React from "react";
import type { LicenseOption, ReportData } from "@/types/checkout";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  licenseKey: string;
  license: LicenseOption | null;
  report: ReportData | null;
}

export default function SuccessModal({ open, onClose, licenseKey, license, report }: SuccessModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl text-center">
        <h4 className="text-lg font-semibold text-gray-900">Payment Successful</h4>
        <p className="mt-2 text-sm text-gray-700">
          {`You purchased ${license?.title ?? "a license"} for`} {report?.title ?? "the report"}
        </p>
        <div className="mt-4 rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Your License Key</p>
          <p className="mt-1 font-mono text-sm text-gray-900">{licenseKey}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}


