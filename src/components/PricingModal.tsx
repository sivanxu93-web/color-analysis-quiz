'use client';
import React from 'react';
import BaseModal from './BaseModal';
import {useCommonContext} from "~/context/common-context";
import {useParams} from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';

export default function PricingModal({
                                       locale,
                                       page
                                     }) {

  const {showPricingModal, setShowPricingModal, userData, setShowLoginModal} = useCommonContext();
  const params = useParams();
  const currentLocale = params?.locale || 'en';

  const handleCreemCheckout = (plan: 'single' | 'pack') => {
    sendGAEvent('event', 'purchase_attempt', { 
        item: plan === 'pack' ? 'style_pack' : 'single_report', 
        status: userData?.user_id ? 'logged_in' : 'guest' 
    });

    if (!userData?.user_id) {
        setShowPricingModal(false);
        setTimeout(() => setShowLoginModal(true), 300);
        return;
    }

    const checkoutUrl = plan === 'pack' 
        ? process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL_PACK 
        : process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL;

    if (checkoutUrl) {
        const url = new URL(checkoutUrl);
        url.searchParams.set('email', userData.email);
        url.searchParams.set('metadata[user_id]', userData.user_id); 
        window.location.href = url.toString();
    } else {
        alert("Checkout configuration missing.");
    }
  };

  const isPaymentEnabled = !!process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL;

  return (
    <BaseModal 
      isOpen={showPricingModal} 
      onClose={() => setShowPricingModal(false)}
      title="Unlock Your Analysis"
      icon={<span className="text-4xl">💎</span>}
    >
        <div className="text-center mt-2">
            {!isPaymentEnabled ? (
                // Beta/Free Fallback UI
                <div className="bg-gradient-to-br from-indigo-50 via-[#FFFBF7] to-white p-6 rounded-2xl border border-indigo-100 shadow-sm mb-6">
                     <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 border border-green-200 rounded-full inline-block px-3 py-1 bg-white/50">
                        Beta Exclusive
                    </p>
                    <div className="flex items-baseline justify-center gap-3 mb-6">
                        <span className="text-5xl font-serif font-bold text-[#1A1A2E]">FREE</span>
                        <span className="text-lg text-gray-400 line-through decoration-gray-300 decoration-2">$19.90</span>
                    </div>
                    <button
                        onClick={() => window.location.href = `/${currentLocale}/analysis`}
                        className="w-full rounded-full bg-[#1A1A2E] px-6 py-4 text-base font-bold text-white shadow-xl hover:bg-primary transition-all"
                    >
                        {userData?.user_id ? "Start Analysis Now" : "Login to Claim"}
                    </button>
                </div>
            ) : (
                // Paid UI - Stacked Cards for Modal
                <div className="space-y-4">
                    
                    {/* Pack Plan (Highlighted) */}
                    <div className="relative rounded-2xl p-6 ring-1 ring-gray-200 bg-[#1A1A2E] text-white shadow-xl text-left overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                            Best Value
                        </div>
                        <h3 className="text-lg font-bold">Style Pack</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-serif font-bold">$9.90</span>
                            <span className="text-sm text-gray-400 line-through">$29.90</span>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-gray-300">
                            <li className="flex gap-2"><span>★</span> 3 Full Analyses</li>
                            <li className="flex gap-2"><span>★</span> Shareable & Test Photos</li>
                        </ul>
                        <button
                            onClick={() => handleCreemCheckout('pack')}
                            className="mt-6 w-full rounded-full bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-primary-hover animate-pulse"
                        >
                            Get 3 Credits
                        </button>
                    </div>

                    {/* Single Plan */}
                    <div className="rounded-2xl p-6 ring-1 ring-gray-200 bg-white text-left hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-gray-900">Single Report</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-serif font-bold text-gray-900">$4.90</span>
                            <span className="text-sm text-gray-400 line-through">$19.90</span>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                            <li className="flex gap-2"><span className="text-indigo-500">✓</span> 1 Full Analysis</li>
                            <li className="flex gap-2"><span className="text-indigo-500">✓</span> Virtual Draping & Makeup</li>
                        </ul>
                        <button
                            onClick={() => handleCreemCheckout('single')}
                            className="mt-6 w-full rounded-full bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-100"
                        >
                            Unlock Report
                        </button>
                    </div>

                </div>
            )}
            
            <p className="text-xs text-gray-400 mt-4">Secure payment via Creem • 100% Satisfaction Guarantee</p>
        </div>
    </BaseModal>
  )
}