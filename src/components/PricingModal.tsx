'use client';
import React from 'react';
import BaseModal from './BaseModal';
import {useCommonContext} from "~/context/common-context";
import PricingContent from './PricingContent';

export default function PricingModal({
                                       locale,
                                     }: {
                                       locale: string;
                                       page?: string;
                                     }) {

  const {showPricingModal, setShowPricingModal} = useCommonContext();

  return (
    <BaseModal 
      isOpen={showPricingModal} 
      onClose={() => setShowPricingModal(false)}
      title="Unlock Professional Insights"
      icon={<span className="text-4xl">✨</span>}
      maxWidth="sm:max-w-4xl"
    >
        <div className="text-center py-4">
            <PricingContent locale={locale} isModal={true} />
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-2">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Secure Checkout Powered by Creem</p>
                <div className="flex items-center gap-4 opacity-40 grayscale scale-75">
                    <span className="font-mono text-[8px] uppercase tracking-tighter">Global Tax Compliant</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className="font-mono text-[8px] uppercase tracking-tighter">Instant Credit Activation</span>
                </div>
            </div>
        </div>
    </BaseModal>
  )
}
