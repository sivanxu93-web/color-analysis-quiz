'use client';
import React, { useState, useEffect } from 'react';
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

  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  // Check if user is from Google Ads
  const [isFromGoogle, setIsFromGoogle] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const source = localStorage.getItem('utm_source');
        setIsFromGoogle(source === 'google_ads_gclid');
    }
  }, []);

  // Countdown Logic
  useEffect(() => {
    if (!showPricingModal) return;

    const TIMER_KEY = `offer_deadline_${sessionId || 'global'}`;
    const DURATION = 15 * 60 * 1000; // 15 minutes

    let deadline = localStorage.getItem(TIMER_KEY);
    if (!deadline) {
        deadline = (Date.now() + DURATION).toString();
        localStorage.setItem(TIMER_KEY, deadline);
    }

    const interval = setInterval(() => {
        const now = Date.now();
        const diff = parseInt(deadline!) - now;

        if (diff <= 0) {
            setTimeLeft("00:00");
            clearInterval(interval);
        } else {
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [showPricingModal, sessionId]);

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
        {timeLeft && (
            <div className={`mb-6 -mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${timeLeft === '00:00' ? 'bg-black border-black text-white' : 'bg-red-50 border-red-100 text-red-700'}`}>
                <span className={`w-2 h-2 rounded-full ${timeLeft === '00:00' ? 'bg-yellow-400 animate-ping' : 'bg-red-500 animate-pulse'}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider">
                    {timeLeft === '00:00' 
                        ? "LAST CHANCE: Discount Expired! Secure $1.90 before price reverts." 
                        : `${isFromGoogle ? 'Google Search Exclusive' : 'Limited Time Special'} Offer Expires In: ${timeLeft}`
                    }
                </span>
            </div>
        )}
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
