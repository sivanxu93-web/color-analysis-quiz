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
        window.location.href = `/${locale}/analysis`;
    }
  };

  const isPaymentEnabled = !!process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL;

  return (
    <section className="bg-[#FFFBF7] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-wide">Launch Special</h2>
          <p className="mt-2 text-4xl font-serif font-bold tracking-tight text-gray-900 sm:text-5xl">
            Professional Analysis,<br/>Coffee Price.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Get the same insights as a $300 appointment for just <span className="font-bold text-[#1A1A2E]">$4.90</span>. <br/>
            <span className="text-red-500 font-bold text-sm">⚠️ Limited to first 100 users today.</span>
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
            <>
            <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 items-center sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
                
                {/* Single Plan */}
                <div className="rounded-3xl p-8 ring-1 ring-gray-200 bg-white/60 xl:p-10 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold leading-8 text-gray-900">Single Report</h3>
                    <p className="mt-4 text-sm leading-6 text-gray-600">Perfect for one person.</p>
                    <div className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-gray-900">$4.90</span>
                        <span className="text-sm font-semibold leading-6 text-gray-400 line-through ml-2">$19.90</span>
                    </div>
                    <div className="mt-2 inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">75% OFF</div>
                    <button
                        onClick={() => handleCreemCheckout('single')}
                        className="mt-6 block w-full rounded-md bg-indigo-50 px-3 py-2 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                    >
                        Unlock Now
                    </button>
                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                        <li className="flex items-start gap-x-3">
                            <span className="text-green-500 mt-0.5 shrink-0">✅</span>
                            <span><strong>Discover Your True Season</strong> <span className="text-gray-400 text-xs block sm:inline">(e.g. Deep Winter)</span></span>
                        </li>
                        <li className="flex items-start gap-x-3">
                            <span className="text-green-500 mt-0.5 shrink-0">✅</span>
                            <span><strong>Best vs Worst Colors</strong> <span className="text-gray-400 text-xs block sm:inline">(Visual Proof)</span></span>
                        </li>
                        <li className="flex items-start gap-x-3">
                            <span className="text-green-500 mt-0.5 shrink-0">✅</span>
                            <span><strong>Makeup Lab</strong> <span className="text-gray-400 text-xs block sm:inline">(Lipstick & Blush Shades)</span></span>
                        </li>
                        <li className="flex items-start gap-x-3">
                            <span className="text-green-500 mt-0.5 shrink-0">✅</span>
                            <span><strong>Avoid List</strong> <span className="text-gray-400 text-xs block sm:inline">(Colors that wash you out)</span></span>
                        </li>
                    </ul>
                </div>

                {/* Pack Plan (Highlighted) */}
                <div className="relative rounded-3xl p-8 ring-1 ring-gray-200 bg-[#1A1A2E] text-white shadow-2xl xl:p-10 transform scale-105 z-10 border-t-4 border-primary">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl uppercase tracking-wider">
                        Best Value
                    </div>
                    <h3 className="text-lg font-semibold leading-8 text-white">Style Pack</h3>
                    <p className="mt-4 text-sm leading-6 text-gray-300">Share with family or test different photos.</p>
                    <div className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-white">$9.90</span>
                        <span className="text-sm font-semibold leading-6 text-gray-300 line-through ml-2">$29.90</span>
                    </div>
                    <button
                        onClick={() => handleCreemCheckout('pack')}
                        className="mt-6 block w-full rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary animate-pulse"
                    >
                        Get 3 Credits ($3.30/each)
                    </button>
                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                        <li className="flex items-start gap-x-3">
                            <span className="text-primary text-lg mt-0.5 shrink-0">★</span>
                            <span><strong>3 Full Analyses</strong> <span className="text-gray-400 text-xs block sm:inline">(3 Credits)</span></span>
                        </li>
                        <li className="flex items-start gap-x-3">
                            <span className="text-primary text-lg mt-0.5 shrink-0">★</span>
                            <span><strong>Shareable</strong> <span className="text-gray-400 text-xs block sm:inline">(Analyze friends/family)</span></span>
                        </li>
                        <li className="flex items-start gap-x-3">
                            <span className="text-primary text-lg mt-0.5 shrink-0">★</span>
                            <span><strong>Test Different Photos</strong> <span className="text-gray-400 text-xs block sm:inline">(Verify accuracy)</span></span>
                        </li>
                        <li className="flex items-start gap-x-3">
                            <span className="text-primary text-lg mt-0.5 shrink-0">★</span>
                            <span><strong>Huge Savings</strong> <span className="text-gray-400 text-xs block sm:inline">($3.30 per report)</span></span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="mx-auto max-w-2xl mt-20 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-serif font-bold text-center mb-8 text-[#1A1A2E]">Why Choose AI Color Analysis Quiz?</h3>
                <div className="grid grid-cols-3 gap-6 text-sm items-center border-b border-gray-100 pb-4 mb-4">
                    <div className="font-bold text-gray-400">Feature</div>
                    <div className="text-center font-bold text-gray-500">Human Stylist</div>
                    <div className="text-center font-bold text-primary text-lg">AI Color Analysis Quiz</div>
                </div>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6 items-center">
                        <div className="font-medium text-gray-600">Cost</div>
                        <div className="text-center text-red-500">$200 - $500</div>
                        <div className="text-center text-green-600 font-bold bg-green-50 rounded-full py-1">$4.90</div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 items-center">
                        <div className="font-medium text-gray-600">Time</div>
                        <div className="text-center text-gray-500">2-3 Weeks</div>
                        <div className="text-center text-green-600 font-bold">~30 Seconds</div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 items-center">
                        <div className="font-medium text-gray-600">Objectivity</div>
                        <div className="text-center text-gray-500">Subjective Bias</div>
                        <div className="text-center text-green-600 font-bold">Data-Driven</div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 items-center">
                        <div className="font-medium text-gray-600">Try-on</div>
                        <div className="text-center text-gray-500">Imagination</div>
                        <div className="text-center text-green-600 font-bold">AI Visual Proof</div>
                    </div>
                </div>
            </div>
            </>
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
