'use client';

import React, { useState } from 'react';
import { useCommonContext } from '~/context/common-context';
import { useParams } from 'next/navigation';
import BaseModal from '~/components/BaseModal';

const PricingContent = ({ locale, isModal = false }: { locale: string, isModal?: boolean }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly'); // Default to yearly
  const { setShowLoginModal, userData, setShowPricingModal, availableTimes, refreshAvailableTimes } = useCommonContext();
  const params = useParams();
  const sessionId = params?.id as string;
  
  // Custom Modal State
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: (() => Promise<void>) | null;
    isLoading: boolean;
    isSuccess: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    isLoading: false,
    isSuccess: false
  });

  const isSubscribed = (availableTimes?.subscription_status === 'active' || availableTimes?.subscription_status === 'trialing');
  const currentPlan = isSubscribed ? availableTimes?.subscription_plan : null;
  const currentCycle = isSubscribed ? availableTimes?.subscription_billing_cycle : null;

  const handleConfirmAction = async () => {
    if (!confirmModalState.action) return;
    
    setConfirmModalState(prev => ({ ...prev, isLoading: true }));
    try {
        await confirmModalState.action();
        setConfirmModalState(prev => ({ 
            ...prev, 
            isLoading: false, 
            isSuccess: true,
            title: 'Success!',
            message: 'Your subscription has been successfully updated.'
        }));
    } catch (e) {
        setConfirmModalState(prev => ({ 
            ...prev, 
            isLoading: false,
            title: 'Error',
            message: 'Failed to update subscription. Please try again later.'
        }));
    }
  };

  const executeUpgrade = async (tier: string, billingCycle: string) => {
      const res = await fetch('/api/creem/update-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              tier, 
              userId: userData.user_id, 
              billingCycle 
          })
      });
      const data = await res.json();
      
      if (!data.success) {
          throw new Error(data.error || "Update failed");
      }
      
      if (refreshAvailableTimes) {
          await refreshAvailableTimes(userData.user_id);
      }
  };

  const handleSubscribe = async (tier: 'standard' | 'pro') => {
    if (!userData?.email) {
      if (isModal) setShowPricingModal(false);
      setShowLoginModal(true);
      return;
    }

    // If it's current plan AND current cycle, do nothing
    if (currentPlan === tier && currentCycle === billingCycle) {
      return;
    }

    try {
      if (isSubscribed && currentPlan) {
        // Handle Upgrade / Downgrade for existing subscribers using Custom Modal
        const isUpgrade = tier === 'pro' && currentPlan === 'standard';
        const actionText = isUpgrade ? 'upgrade' : 'change';
        
        setConfirmModalState({
            isOpen: true,
            title: `Confirm Subscription Change`,
            message: `Are you sure you want to ${actionText} your plan to ${tier.toUpperCase()} ${billingCycle.toUpperCase()}? The price difference will be calculated and applied automatically.`,
            action: () => executeUpgrade(tier, billingCycle),
            isLoading: false,
            isSuccess: false
        });
        
      } else {
        // New Subscription Checkout
        let successUrl = `${window.location.origin}/${locale}/profile?payment_success=true`;
        if (sessionId) {
            successUrl = `${window.location.origin}/${locale}/report/${sessionId}?payment_success=true`;
        }

        const res = await fetch('/api/color-lab/checkout/creem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              tier, 
              email: userData.email, 
              billingCycle,
              successUrl
          })
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      }
    } catch (e) {
      console.error("Subscription error", e);
    }
  };

  const handleBuyPack = async (pack: 'starter' | 'plus') => {
    if (!userData?.email) {
      if (isModal) setShowPricingModal(false);
      setShowLoginModal(true);
      return;
    }

    try {
      let successUrl = `${window.location.origin}/${locale}/profile?payment_success=true`;
      if (sessionId) {
          successUrl = `${window.location.origin}/${locale}/report/${sessionId}?payment_success=true`;
      }

      const res = await fetch('/api/color-lab/checkout/creem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            pack, 
            email: userData.email,
            billingCycle: 'onetime',
            successUrl
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error("Redirection error", e);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto text-center px-4 ${isModal ? 'space-y-8' : 'space-y-12'}`}>
        <div className="space-y-4">
          <h1 className={`${isModal ? 'text-3xl md:text-5xl' : 'text-5xl md:text-7xl'} font-serif font-bold text-[#2D2D2D] tracking-tighter italic`}>Choose Your Perfect Plan</h1>
          <p className="text-gray-400 font-serif italic text-base md:text-xl">Stop guessing. Discover your perfect palette instantly.</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-full border border-gray-100 shadow-sm inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 md:px-8 py-2 rounded-full text-[10px] font-black transition-all tracking-widest ${billingCycle === 'monthly' ? 'bg-[#2D2D2D] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 md:px-8 py-2 rounded-full text-[10px] font-black transition-all tracking-widest ${billingCycle === 'yearly' ? 'bg-[#2D2D2D] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              YEARLY <span className={`ml-1 text-[8px] font-bold ${billingCycle === 'yearly' ? 'text-[#E88D8D]' : 'text-[#E88D8D]/70'}`}>(-50%)</span>
            </button>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Column 1: Standard Plan */}
          <div className={`bg-white p-8 md:p-10 border border-gray-100 shadow-sm rounded-2xl flex flex-col hover:shadow-xl transition-all duration-500 text-left relative ${currentPlan === 'standard' && currentCycle === billingCycle ? 'ring-2 ring-[#E88D8D]' : ''}`}>
            {currentPlan === 'standard' && currentCycle === billingCycle && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E88D8D] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                Current Plan
              </div>
            )}
            <div className="space-y-2 mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#2D2D2D]">Standard</h3>
              <p className="text-[#C5A059] text-[11px] font-black uppercase tracking-widest">Best for Daily Style</p>
              <p className="text-gray-500 text-sm leading-relaxed">For fashion enthusiasts to explore styles.</p>
            </div>
            
            <div className="mb-6 border-b border-gray-50 pb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tighter text-[#2D2D2D]">${billingCycle === 'monthly' ? '12.90' : '6.90'}</span>
                <span className="text-gray-400 text-sm font-serif italic">/mo</span>
              </div>
              <p className="text-[#E88D8D] text-xs font-bold mt-2 tracking-wide">{billingCycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'}</p>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E88D8D] flex-shrink-0"></div>
                <p className="text-sm font-bold text-[#2D2D2D]">Unlock Full Color Analysis Report</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] flex-shrink-0"></div>
                <p className="text-sm font-bold text-[#2D2D2D]">120 Credits <span className="text-gray-400 font-normal italic">/mo</span></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-100 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">AI Style Validator</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">Virtual Hair Color Try On <span className="text-[9px] uppercase font-black text-[#E88D8D] ml-1">Soon</span></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-100 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">Outfits &amp; Makeup Try-on <span className="text-[9px] uppercase font-black text-[#E88D8D] ml-1">Soon</span></p>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('standard')}
              className={`w-full py-3.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all active:scale-95 mt-auto ${
                currentPlan === 'standard' && currentCycle === billingCycle
                ? 'bg-gray-100 text-gray-400 cursor-default' 
                : 'bg-[#FAF9F6] border border-gray-200 text-[#2D2D2D] hover:bg-gray-50'
              }`}
            >
              {currentPlan === 'standard' && currentCycle === billingCycle ? 'Current Plan' : currentPlan === 'pro' ? 'Downgrade' : 'Subscribe Standard'}
            </button>
          </div>

          {/* Column 2: Pro Plan (Highlighted) */}
          <div className={`bg-[#2D2D2D] p-8 md:p-10 border border-[#2D2D2D] shadow-2xl rounded-2xl flex flex-col hover:-translate-y-1 transition-transform duration-500 text-left relative transform scale-100 lg:scale-105 z-10 ${currentPlan === 'pro' && currentCycle === billingCycle ? 'ring-4 ring-[#E88D8D]' : ''}`}>
            {currentPlan === 'pro' && currentCycle === billingCycle ? (
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E88D8D] text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                  Current Plan
               </div>
            ) : (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E88D8D] text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                Best Value
              </div>
            )}
            
            <div className="space-y-2 mb-6">
              <h3 className="font-serif text-2xl font-bold text-white">Pro</h3>
              <p className="text-[#C5A059] text-[11px] font-black uppercase tracking-widest">Best for Creators</p>
              <p className="text-gray-300 text-sm leading-relaxed">For stylists &amp; creators needing more power.</p>
            </div>
            
            <div className="mb-6 border-b border-gray-700 pb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tighter text-white">${billingCycle === 'monthly' ? '29.90' : '15.90'}</span>
                <span className="text-gray-400 text-sm font-serif italic">/mo</span>
              </div>
              <p className="text-[#E88D8D] text-xs font-bold mt-2 tracking-wide">{billingCycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'}</p>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E88D8D] flex-shrink-0"></div>
                <p className="text-sm font-bold text-white">500 Credits <span className="text-gray-400 font-normal italic">/mo</span></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] flex-shrink-0"></div>
                <p className="text-sm text-gray-200">Everything in Standard</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-100 flex-shrink-0"></div>
                <p className="text-sm text-gray-200">Priority Processing</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-300 flex-shrink-0"></div>
                <p className="text-sm text-gray-200">Commercial License</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-200 flex-shrink-0"></div>
                <p className="text-sm text-gray-200">Early Access to New Tools</p>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('pro')}
              className={`w-full py-3.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all active:scale-95 shadow-lg mt-auto ${
                currentPlan === 'pro' && currentCycle === billingCycle
                ? 'bg-gray-700 text-gray-400 cursor-default'
                : 'bg-white text-[#2D2D2D] hover:bg-gray-100'
              }`}
            >
              {currentPlan === 'pro' && currentCycle === billingCycle ? 'Current Plan' : currentPlan === 'standard' ? 'Upgrade to Pro' : 'Subscribe Pro'}
            </button>
          </div>

          {/* Column 3: Pay-as-you-go Packs */}
          <div className="bg-white p-8 md:p-10 border border-gray-100 shadow-sm rounded-2xl flex flex-col hover:shadow-xl transition-all duration-500 text-left relative">
            <div className="space-y-2 mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#2D2D2D]">Pay As You Go</h3>
              <p className="text-[#C5A059] text-[11px] font-black uppercase tracking-widest">Not ready to subscribe?</p>
              <p className="text-gray-500 text-sm leading-relaxed">Buy credits as you need them. No expiration.</p>
            </div>
            
            <div className="flex-grow space-y-4 flex flex-col justify-center mb-6 pt-4 border-t border-gray-50">
              {/* Starter Pack */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-100 hover:border-[#E88D8D]/30 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-serif font-bold text-[#2D2D2D]">Starter Pack</h4>
                  <span className="font-bold text-[#2D2D2D]">$8.90</span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-[#E88D8D] uppercase tracking-widest">50 Credits</p>
                  <button
                    onClick={() => handleBuyPack('starter')}
                    className="text-[9px] font-black uppercase tracking-widest bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-[#2D2D2D] hover:text-white transition-all"
                  >
                    Buy
                  </button>
                </div>
              </div>

              {/* Plus Pack */}
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-100 hover:border-[#E88D8D]/30 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-serif font-bold text-[#2D2D2D]">Plus Pack</h4>
                  <span className="font-bold text-[#2D2D2D]">$14.90</span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-[#E88D8D] uppercase tracking-widest">100 Credits</p>
                  <button
                    onClick={() => handleBuyPack('plus')}
                    className="text-[9px] font-black uppercase tracking-widest bg-[#2D2D2D] text-white px-3 py-1.5 rounded-full hover:bg-black transition-all shadow-sm"
                  >
                    Buy
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-start gap-2 pt-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-gray-500 italic">Perfect for Quick Checks</p>
              </div>
            </div>
            
          </div>

        </div>

        {/* Custom Confirmation Modal */}
        <BaseModal
          isOpen={confirmModalState.isOpen}
          onClose={() => {
            if (!confirmModalState.isLoading) {
              setConfirmModalState(prev => ({ ...prev, isOpen: false }));
            }
          }}
          title={confirmModalState.title}
          icon={
            confirmModalState.isSuccess ? (
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-2xl">✨</span>
            )
          }
        >
          <div className="mt-2 space-y-6">
            <p className="text-sm text-gray-500 text-center">
              {confirmModalState.message}
            </p>
            
            <div className="flex flex-col gap-3">
              {!confirmModalState.isSuccess ? (
                <>
                  <button
                    onClick={handleConfirmAction}
                    disabled={confirmModalState.isLoading}
                    className="w-full inline-flex justify-center rounded-full bg-[#1A1A2E] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-black transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {confirmModalState.isLoading ? 'Processing...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
                    disabled={confirmModalState.isLoading}
                    className="w-full inline-flex justify-center rounded-full bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
                  className="w-full inline-flex justify-center rounded-full bg-[#1A1A2E] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-black transition-all focus:outline-none"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </BaseModal>

    </div>
  );
};

export default PricingContent;