"use client";

import React, { useState, useEffect, useRef } from 'react';
import phoneCodes from '@/utils/phoneCodes.json';

interface PhoneCodeSelectProps {
    value: string;
    onChange: (value: string) => void;
    className?: string; // Standard className prop for sizing/styling
}

export default function SearchablePhoneSelect({ value, onChange, className = '' }: PhoneCodeSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize search term from current value
    useEffect(() => {
        if (value) {
            // Optional: Set search term to match value? 
            // Often better to keep search separate or just show selected.
            // For a combobox, the search input often acts as the display input.
            setSearchTerm(value);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCodes = phoneCodes.filter((p: any) =>
        p.dial_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (code: string) => {
        onChange(code);
        setSearchTerm(code);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setSearchTerm(newVal);
        // If user types a valid code manually, should we call onChange? 
        // Usually for phone code selector, we want strictly valid codes, 
        // but allowing typing helps filtering. 
        // We let them type to filter, selection confirms it.
        // OPTIONAL: If typed value exactly matches a dial_code, auto-select?
        setIsOpen(true);
    };

    const handleFocus = () => {
        setIsOpen(true);
    };

    return (
        <div className={`flex items-center ${className}`} ref={dropdownRef}>
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                className="w-full h-full bg-transparent border-none outline-none text-inherit placeholder-gray-500 px-0"
                placeholder="Code"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#969696" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 w-[320px] mt-1 bg-[#333] border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredCodes.length > 0 ? (
                        filteredCodes.map((p: any) => (
                            <button
                                key={`${p.dial_code}-${p.code}`}
                                type="button"
                                className="w-full text-left px-3 py-2 text-white hover:bg-[#444] text-sm flex items-center justify-between"
                                onClick={() => handleSelect(p.dial_code)}
                            >
                                <span>{p.name} ({p.code})</span>
                                <span className="text-gray-400">{p.dial_code}</span>
                            </button>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-gray-400 text-sm">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
}
