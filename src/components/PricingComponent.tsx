'use client';
import React from 'react';
import { useCommonContext } from "~/context/common-context";
import { useParams } from 'next/navigation';

export default function Pricing({
  redirectUrl,
  isPricing = false
}: {
    redirectUrl?: string;
    isPricing?: boolean;
}) {
  const { pricingText, userData, setShowLoginModal } = useCommonContext();
  const params = useParams();
  const locale = params?.locale || 'en';

  const handleCreemCheckout = (plan: 'single' | 'pack') => {
    if (!userData?.user_id) {
        setShowLoginModal(true);
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
        // Fallback
        window.location.href = `/${locale}/analysis`;
    }
  };

  const isPaymentEnabled = !!process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL;

  return (
    <section className="bg-[#FFFBF7] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-wide">Simple Pricing</h2>
          <p className="mt-2 text-4xl font-serif font-bold tracking-tight text-gray-900 sm:text-5xl">
            Invest in Your Confidence
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Professional color analysis at a fraction of the stylist cost.
          </p>
        </div>

        {!isPaymentEnabled ? (
            // Beta UI
            <div className="mx-auto max-w-lg rounded-3xl bg-white ring-1 ring-gray-200 shadow-xl overflow-hidden">
                <div className="p-8 sm:p-10 relative">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                        Beta Access
                    </div>
                    <h3 className="text-2xl font-serif font-bold tracking-tight text-gray-900">Full Color Analysis</h3>
                    <div className="mt-6 flex items-baseline gap-x-2">
                        <span className="text-5xl font-bold tracking-tight text-green-600">FREE</span>
                        <span className="text-lg font-semibold leading-6 text-gray-400 line-through">$19.90</span>
                    </div>
                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                        {['Virtual Draping', 'Seasonal Report', 'Makeup Guide'].map((feature) => (
                            <li key={feature} className="flex gap-x-3">
                                <span>✅</span> {feature}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => handleCreemCheckout('single')}
                        className="mt-10 block w-full rounded-md bg-primary px-3 py-2 text-center text-sm font-bold text-white shadow-sm hover:bg-primary-hover"
                    >
                        {userData?.user_id ? "Start Analysis Now" : "Login to Get Free Access"}
                    </button>
                </div>
            </div>
        ) : (
            // Paid UI - Dual Columns
            <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 items-center sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
                
                {/* Single Plan */}
                <div className="rounded-3xl p-8 ring-1 ring-gray-200 bg-white/60 xl:p-10">
                    <h3 className="text-lg font-semibold leading-8 text-gray-900">Single Report</h3>
                    <p className="mt-4 text-sm leading-6 text-gray-600">Perfect for one person.</p>
                    <div className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-gray-900">$19.90</span>
                    </div>
                    <button
                        onClick={() => handleCreemCheckout('single')}
                        className="mt-6 block w-full rounded-md bg-indigo-50 px-3 py-2 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                    >
                        Buy Now
                    </button>
                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                        <li className="flex gap-x-3"><span>✅</span> 1 Full Analysis</li>
                        <li className="flex gap-x-3"><span>✅</span> Virtual Draping</li>
                        <li className="flex gap-x-3"><span>✅</span> Lifetime Access</li>
                    </ul>
                </div>

                {/* Pack Plan (Highlighted) */}
                <div className="relative rounded-3xl p-8 ring-1 ring-gray-200 bg-[#1A1A2E] text-white shadow-2xl xl:p-10 transform scale-105 z-10">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl uppercase tracking-wider">
                        Best Value
                    </div>
                    <h3 className="text-lg font-semibold leading-8 text-white">Style Pack</h3>
                    <p className="mt-4 text-sm leading-6 text-gray-300">Share with family or try different looks.</p>
                    <div className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-white">$29.90</span>
                        <span className="text-sm font-semibold leading-6 text-gray-300 line-through ml-2">$59.70</span>
                    </div>
                    <button
                        onClick={() => handleCreemCheckout('pack')}
                        className="mt-6 block w-full rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        Get 3 Credits
                    </button>
                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                        <li className="flex gap-x-3"><span className="text-primary">✦</span> <strong>3 Full Analyses</strong></li>
                        <li className="flex gap-x-3"><span className="text-primary">✦</span> Save 50% vs Single</li>
                        <li className="flex gap-x-3"><span className="text-primary">✦</span> All Premium Features</li>
                    </ul>
                </div>
            </div>
        )}
        
        <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
                &quot;I spent hundreds on clothes I never wore. This report saved me a fortune.&quot; — <span className="italic">Sarah J.</span>
            </p>
        </div>
      </div>
    </section>
  );
}