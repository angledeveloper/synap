  import React, { useEffect, useRef } from "react";
import type { LicenseOption, ReportData } from "@/app/[lang]/reports/[id]/checkout/page";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  license: LicenseOption | null;
  report: ReportData | null;
}

export default function PaymentModal({ open, onClose, onConfirm, isLoading, license, report }: PaymentModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h4 className="text-lg font-semibold text-gray-900">Confirm Purchase</h4>
        <p className="mt-2 text-sm text-gray-700">
          {`You're buying ${license?.title ?? ""} for`} {report?.title ?? "Selected Report"}
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 p-3">
          <span className="text-sm text-gray-700">Amount</span>
          <span className="text-xl font-semibold text-gray-900">${license?.price}</span>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            ref={closeRef}
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            aria-label="Confirm Payment"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all disabled:opacity-70"
          >
            {isLoading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}


