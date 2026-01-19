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

  const handleBetaAccess = (e) => {
    e.preventDefault();
    
    sendGAEvent('event', 'purchase_attempt', { 
        item: 'beta_access', 
        status: userData?.user_id ? 'logged_in' : 'guest' 
    });

    if (!userData?.user_id) {
        setShowPricingModal(false);
        // Small delay to allow one modal to close before another opens (animation smoothness)
        setTimeout(() => setShowLoginModal(true), 300);
        return;
    }
    // If logged in, go to analysis (or profile)
    window.location.href = `/${currentLocale}/analysis`;
  };

  return (
    <BaseModal 
      isOpen={showPricingModal} 
      onClose={() => setShowPricingModal(false)}
      title="Unlock Full Analysis"
      icon={<span className="text-4xl">🚀</span>}
    >
        <div className="text-center mt-2">
            <div className="bg-gradient-to-br from-indigo-50 via-[#FFFBF7] to-white p-6 rounded-2xl border border-indigo-100 shadow-sm mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100 rounded-full blur-2xl -mr-10 -mt-10"></div>
                
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 border border-indigo-200 rounded-full inline-block px-3 py-1 bg-white/50">
                    Beta Exclusive
                </p>
                
                <div className="flex items-baseline justify-center gap-3 mb-6">
                    <span className="text-5xl font-serif font-bold text-[#1A1A2E]">FREE</span>
                    <span className="text-lg text-gray-400 line-through decoration-gray-300 decoration-2">$19.90</span>
                </div>
                
                <ul className="text-left space-y-3 text-sm text-gray-600 mb-8 px-2">
                    <li className="flex items-start gap-3">
                        <span className="text-green-500 text-lg">✓</span>
                        <span><strong>Virtual Draping</strong> (Try-on)</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-green-500 text-lg">✓</span>
                        <span><strong>Full Seasonal Report</strong> (30+ pages)</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-green-500 text-lg">✓</span>
                        <span><strong>Makeup & Style Guide</strong></span>
                    </li>
                </ul>
                
                <button
                    onClick={handleBetaAccess}
                    className="w-full rounded-full bg-[#1A1A2E] px-6 py-4 text-base font-bold text-white shadow-xl hover:bg-primary hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                >
                    {userData?.user_id ? "Start Analysis Now" : "Login to Claim Offer"}
                </button>
            </div>
            <p className="text-xs text-gray-400">Limited time offer. No credit card required.</p>
        </div>
    </BaseModal>
  )
}
