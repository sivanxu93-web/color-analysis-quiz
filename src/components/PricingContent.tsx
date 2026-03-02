import React from 'react';
import { useCommonContext } from "~/context/common-context";
import { useSearchParams } from 'next/navigation';

interface PricingContentProps {
  onCheckout: (plan: 'single' | 'pack') => void;
  isModal?: boolean;
}

export default function PricingContent({ onCheckout, isModal = false }: PricingContentProps) {
  const { userData } = useCommonContext();
  const searchParams = useSearchParams();
  const coupon = searchParams?.get('coupon');
  const isDiscounted = coupon === 'WELCOMEBACK';

  const isPaymentEnabled = !!process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL;

  // Single Plan Details
  const SinglePlan = () => (
    <div className={`rounded-3xl p-8 ring-1 ring-gray-200 bg-white/60 xl:p-10 hover:shadow-lg transition-shadow ${isModal ? 'bg-white' : ''}`}>
        <h3 className="text-lg font-semibold leading-8 text-gray-900">Single Report</h3>
        <p className="mt-4 text-sm leading-6 text-gray-600">Perfect for one person.</p>
        <div className="mt-6 flex items-baseline gap-x-1">
            <span className="text-4xl font-bold tracking-tight text-gray-900">${isDiscounted ? '2.45' : '4.90'}</span>
            <span className="text-sm font-semibold leading-6 text-gray-400 line-through ml-2">${isDiscounted ? '4.90' : '19.90'}</span>
        </div>
        <div className="mt-2 inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">{isDiscounted ? 'EXTRA 50% OFF APPLIED' : '75% OFF'}</div>
        
        <button
            onClick={() => onCheckout('single')}
            className="mt-6 block w-full rounded-md bg-[#1A1A2E] px-3 py-2 text-center text-sm font-bold text-white hover:bg-black transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
        >
            Unlock My Full Analysis
        </button>

        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
            <li className="flex items-start gap-x-3">
                <span className="text-green-500 mt-0.5 shrink-0">✅</span>
                <span><strong>Discover Your True Season</strong></span>
            </li>
            <li className="flex items-start gap-x-3">
                <span className="text-green-500 mt-0.5 shrink-0">✅</span>
                <span><strong>Best vs Worst Colors</strong></span>
            </li>
            <li className="flex items-start gap-x-3">
                <span className="text-green-500 mt-0.5 shrink-0">✅</span>
                <span><strong>Makeup Lab</strong></span>
            </li>
            <li className="flex items-start gap-x-3">
                <span className="text-green-500 mt-0.5 shrink-0">✅</span>
                <span><strong>Avoid List</strong></span>
            </li>
            <li className="flex items-start gap-x-3 bg-green-50/50 p-2 rounded-lg border border-green-100 -mx-2">
                <span className="text-xl shrink-0 leading-none">🎁</span>
                <span><strong>3 Style Validations</strong> <span className="text-xs text-gray-500 block">Test clothes before you buy</span></span>
            </li>
        </ul>
    </div>
  );

  // Pack Plan Details
  const PackPlan = () => (
    <div className="relative rounded-3xl p-8 ring-1 ring-gray-200 bg-[#1A1A2E] text-white shadow-2xl xl:p-10 transform scale-105 z-10 border-t-4 border-primary">
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl uppercase tracking-wider">
            Best Value
        </div>
        <h3 className="text-lg font-semibold leading-8 text-white">Style Pack</h3>
        <p className="mt-4 text-sm leading-6 text-gray-300">Share with family or test different photos.</p>
        <div className="mt-6 flex items-baseline gap-x-1">
            <span className="text-4xl font-bold tracking-tight text-white">${isDiscounted ? '4.95' : '9.90'}</span>
            <span className="text-sm font-semibold leading-6 text-gray-300 line-through ml-2">${isDiscounted ? '9.90' : '29.90'}</span>
        </div>
        
        <button 
            onClick={() => onCheckout('pack')}
            className="mt-6 block w-full rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary animate-pulse transition-colors"
        >
            Get 3 Credits (${isDiscounted ? '1.65' : '3.30'}/each)
        </button>

        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
            <li className="flex items-start gap-x-3">
                <span className="text-primary text-lg mt-0.5 shrink-0">★</span>
                <span><strong>3 Full Analyses</strong> <span className="text-gray-400 text-xs block sm:inline">(3 Credits)</span></span>
            </li>
            <li className="flex items-start gap-x-3">
                <span className="text-primary text-lg mt-0.5 shrink-0">★</span>
                <span><strong>Shareable</strong></span>
            </li>
            <li className="flex items-start gap-x-3">
                <span className="text-primary text-lg mt-0.5 shrink-0">★</span>
                <span><strong>Test Different Photos</strong></span>
            </li>
            <li className="flex items-start gap-x-3">
                <span className="text-primary text-lg mt-0.5 shrink-0">★</span>
                <span><strong>Huge Savings</strong></span>
            </li>
            <li className="flex items-start gap-x-3 bg-white/10 p-2 rounded-lg border border-white/10 -mx-2 mt-4">
                <span className="text-xl shrink-0 leading-none">🎁</span>
                <span><strong>10 Style Validations</strong> <span className="text-xs text-gray-400 block">AI checks your shopping</span></span>
            </li>
        </ul>
    </div>
  );

  // Fallback / Beta UI
  const BetaPlan = () => (
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
                onClick={() => onCheckout('single')}
                className="mt-10 block w-full rounded-md bg-primary px-3 py-2 text-center text-sm font-bold text-white shadow-sm hover:bg-primary-hover"
            >
                {userData?.user_id ? "Start Analysis Now" : "Login to Get Free Access"}
            </button>
        </div>
    </div>
  );

  if (!isPaymentEnabled) return <BetaPlan />;

  return (
    <div className={`mx-auto ${isModal ? 'flex flex-col space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 md:max-w-3xl' : 'mt-16 grid max-w-lg grid-cols-1 gap-y-6 items-center sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8'}`}>
        {/* On Landing page, Pack is highlighted on right. */}
        {/* On Modal, show Single then Pack, or Pack then Single? */}
        {/* Let's keep consistent: Single Left, Pack Right (Best Value) */}
        
        <SinglePlan />
        <PackPlan />
    </div>
  );
}
