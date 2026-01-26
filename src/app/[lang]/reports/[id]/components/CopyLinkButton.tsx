"use client";

import { usePathname } from 'next/navigation';

export default function CopyLinkButton() {
    const handleCopy = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <button
            className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold transition-colors"
            onClick={handleCopy}
            aria-label="Copy link"
        >
            <img src="/share.svg" alt="Copy Link" className="w-9 h-9" />
        </button>
    );
}
