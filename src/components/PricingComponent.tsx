'use client';
import React from 'react';
import Link from 'next/link';
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

  // BETA MODE: No Stripe yet. Just guide to Analysis/Login.
  const handleBetaAccess = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userData?.user_id) {
        setShowLoginModal(true);
        return;
    }
    // Already logged in? Go to analysis to use the free credit.
    window.location.href = `/${locale}/analysis`;
  };

  return (
    <section className="bg-[#FFFBF7] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-wide">Simple Pricing</h2>
          <p className="mt-2 text-4xl font-serif font-bold tracking-tight text-gray-900 sm:text-5xl">
            Invest in Your Confidence
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            One comprehensive analysis to transform your style forever.
          </p>
        </div>

        <div className="mx-auto max-w-lg rounded-3xl bg-white ring-1 ring-gray-200 shadow-xl overflow-hidden">
            <div className="p-8 sm:p-10 relative">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Beta Access
                </div>
                <h3 className="text-2xl font-serif font-bold tracking-tight text-gray-900">Full Color Analysis</h3>
                <p className="mt-4 text-sm leading-6 text-gray-500">Everything you need to discover your best self.</p>
                <div className="mt-6 flex items-baseline gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-green-600">FREE</span>
                    <span className="text-lg font-semibold leading-6 text-gray-400 line-through">$19.90</span>
                </div>
                
              {
                process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME != '0' ? (
                  <button
                    onClick={handleBetaAccess}
                    className="mt-10 block w-full rounded-md bg-primary px-3 py-2 text-center text-sm font-bold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                  >
                    {userData?.user_id ? "Start Analysis Now" : "Login to Get Free Access"}
                  </button>
                ) : null
              }

                <p className="mt-4 text-xs text-center text-gray-400">Limited time beta offer</p>
            </div>
            <div className="bg-gray-50 p-8 sm:p-10">
                <ul role="list" className="space-y-4 text-sm leading-6 text-gray-600">
                    {[
                        '✨ AI Visual Proof (Virtual Draping)',
                        '🎨 Your Signature Color Palette',
                        '💄 Personalized Makeup Guide',
                        '👗 Style & Fabric Recommendations',
                        '📑 Comprehensive Web Analysis Report',
                        '📱 Lifetime Access to Results'
                    ].map((feature) => (
                        <li key={feature} className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        
        <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
                &quot;I spent hundreds on clothes I never wore. This report saved me a fortune.&quot; — <span className="italic">Sarah J.</span>
            </p>
        </div>
      </div>
    </section>
  );
}
