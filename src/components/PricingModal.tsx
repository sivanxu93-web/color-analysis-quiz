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
    // e.preventDefault(); // Called from onClick, manual preventDefault if needed
    
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
        // Fallback or Alert
        alert("Checkout configuration missing for this plan.");
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
                // Paid UI - Dual Cards
                <div className="space-y-4">
                    {/* Pack Option (Best Value) */}
                    <div 
                        onClick={() => handleCreemCheckout('pack')}
                        className="relative bg-gradient-to-r from-[#1A1A2E] to-[#2a2a4a] text-white p-5 rounded-2xl border-2 border-transparent hover:border-primary/50 cursor-pointer shadow-lg transform hover:-translate-y-1 transition-all group text-left flex justify-between items-center"
                    >
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">
                            Best Value
                        </div>
                        <div>
                            <h4 className="text-lg font-bold flex items-center gap-2">
                                Style Pack <span className="text-xl">✨</span>
                            </h4>
                            <p className="text-gray-300 text-xs mt-1">3 Analyses (Share with family!)</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-serif font-bold">$29.90</span>
                            <span className="text-xs text-gray-400 line-through">$59.70</span>
                        </div>
                    </div>

                    {/* Single Option */}
                    <div 
                        onClick={() => handleCreemCheckout('single')}
                        className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-gray-400 cursor-pointer shadow-sm hover:shadow-md transition-all text-left flex justify-between items-center"
                    >
                        <div>
                            <h4 className="text-lg font-bold text-gray-900">Single Report</h4>
                            <p className="text-gray-500 text-xs mt-1">1 Full Color Analysis</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-serif font-bold text-gray-900">$19.90</span>
                        </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 pt-2">Secure payment via Creem • 100% Satisfaction Guarantee</p>
                </div>
            )}
        </div>
    </BaseModal>
  )
}
