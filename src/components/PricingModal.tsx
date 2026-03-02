'use client';
import React from 'react';
import BaseModal from './BaseModal';
import {useCommonContext} from "~/context/common-context";
import {useParams, useSearchParams} from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';
import PricingContent from './PricingContent';

export default function PricingModal({
                                       locale,
                                       page
                                     }) {

  const {showPricingModal, setShowPricingModal, userData, setShowLoginModal} = useCommonContext();
  const params = useParams();
  const searchParams = useSearchParams();
  const currentLocale = params?.locale || 'en';
  // If we are on a report page, 'id' will be the sessionId
  const sessionId = params?.id as string;
  const coupon = searchParams?.get('coupon');

  const isPaymentEnabled = !!process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL;
  const singleProductId = process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_SINGLE;
  const packProductId = process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_PACK;

  const handleCreemCheckout = async (plan: 'single' | 'pack') => {
    sendGAEvent('event', 'purchase_attempt', { 
        item: plan === 'pack' ? 'style_pack' : 'single_report', 
        status: userData?.user_id ? 'logged_in' : 'guest',
        sessionId: sessionId,
        coupon: coupon
    });

    if (!userData?.user_id) {
        setShowPricingModal(false);
        setTimeout(() => setShowLoginModal(true), 300);
        return;
    }

    const productId = plan === 'pack' ? packProductId : singleProductId;
    if (!productId) {
        alert("Product ID not configured.");
        return;
    }

    try {
        let successUrl = `${window.location.origin}/${currentLocale}/profile`; // Default fallback
        const metadata: any = {
            user_id: userData.user_id,
            email: userData.email,
            plan: plan
        };

        if (sessionId) {
            metadata.session_id = sessionId;
            // Return to report page with success flag
            successUrl = `${window.location.origin}/${currentLocale}/report/${sessionId}?payment_success=true&session_id=${sessionId}`;
        }

        const res = await fetch('/api/creem/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: productId,
                metadata: metadata,
                successUrl: successUrl,
                discountCode: coupon
            })
        });

        if (!res.ok) throw new Error("Failed to init checkout");
        
        const { checkout_url } = await res.json();
        if (checkout_url) {
            window.location.href = checkout_url;
        } else {
            throw new Error("No checkout URL returned");
        }
    } catch (e) {
        console.error(e);
        alert("Payment initialization failed. Please try again.");
    }
  };

  return (
    <BaseModal 
      isOpen={showPricingModal} 
      onClose={() => setShowPricingModal(false)}
      title="Reveal Your Full Color Palette & Style Guide"
      icon={<span className="text-4xl">✨</span>}
      maxWidth="sm:max-w-4xl"
    >
        <div className="text-center mt-2">
            <PricingContent onCheckout={handleCreemCheckout} isModal={true} />
            <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-900 mb-1 uppercase tracking-widest">Expert AI Analysis • One-Time Payment • Lifetime Access</p>
                <p className="text-[10px] text-gray-400">Join 5,000+ style enthusiasts. Secure checkout powered by Creem.</p>
            </div>
        </div>
    </BaseModal>
  )
}
