import React from 'react';
import { useCommonContext } from "~/context/common-context";
import { useParams } from 'next/navigation';
import PricingContent from './PricingContent';

export default function Pricing({
  redirectUrl,
  isPricing = false
}: {
    redirectUrl?: string;
    isPricing?: boolean;
}) {
  const { userData, setShowLoginModal } = useCommonContext();
  const params = useParams();
  const locale = params?.locale || 'en';

  const singleProductId = process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_SINGLE;
  const packProductId = process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_PACK;

  const handleCreemCheckout = async (plan: 'single' | 'pack') => {
    if (!userData?.user_id) {
        setShowLoginModal(true);
        return;
    }

    const productId = plan === 'pack' ? packProductId : singleProductId;
    if (!productId) {
        alert("Product ID not configured.");
        return;
    }

    try {
        let finalSuccessUrl = `${window.location.origin}/${locale}/profile`; // Default

        if (redirectUrl) {
            const baseUrl = redirectUrl.startsWith('http') 
                ? redirectUrl 
                : `${window.location.origin}${redirectUrl.startsWith('/') ? '' : '/'}${redirectUrl}`;
            
            const hasQuery = baseUrl.includes('?');
            finalSuccessUrl = `${baseUrl}${hasQuery ? '&' : '?'}payment_success=true`;
        }

        const res = await fetch('/api/creem/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: productId,
                metadata: {
                    user_id: userData.user_id,
                    email: userData.email,
                    plan: plan
                },
                // Default success URL for landing page (e.g. user profile or history)
                successUrl: finalSuccessUrl
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

        <PricingContent onCheckout={handleCreemCheckout} />

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
        
        <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
                &quot;I spent hundreds on clothes I never wore. This report saved me a fortune.&quot; — <span className="italic">Sarah J.</span>
            </p>
        </div>
      </div>
    </section>
  );
}
