'use client'

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import PricingContent from '~/components/PricingContent';
import { useCommonContext } from '~/context/common-context';
import { getLinkHref } from '~/configs/buildLink';

const FAKE_NOTIFICATIONS = [
  "Emma from New York just unlocked her report",
  "Sophia from London just found her season",
  "Mia from Toronto just got her Virtual Draping",
  "Isabella from Sydney is shopping smarter now",
  "Charlotte from Austin just discovered her best colors"
];

export default function PaywallPageComponent({ locale, sessionId }: { locale: string, sessionId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, setShowLoginModal } = useCommonContext();
  const [notification, setNotification] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState("");

  // Check if session is already paid/analyzing on mount
  useEffect(() => {
    const checkStatus = async () => {
        try {
            const res = await fetch(`/api/color-lab/session/info?sessionId=${sessionId}`);
            const data = await res.json();
            if (data.status === 'analyzing' || data.status === 'analyzed' || data.status === 'completed' || data.hasReport) {
                router.push(getLinkHref(locale, `report/${sessionId}`));
            }
        } catch (e) { console.error(e); }
    };
    checkStatus();
  }, [sessionId, locale]);

  // Fake live notifications
  useEffect(() => {
    const showRandomNotification = () => {
      const randomMsg = FAKE_NOTIFICATIONS[Math.floor(Math.random() * FAKE_NOTIFICATIONS.length)];
      setNotification(randomMsg);
      setTimeout(() => setNotification(""), 4000); // Hide after 4 seconds
    };

    const interval = setInterval(showRandomNotification, 12000); // Show every 12 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle payment success
  useEffect(() => {
    const paymentSuccess = searchParams?.get('payment_success');
    if (paymentSuccess === 'true') {
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        if (userData?.email) {
            handleAnalyze();
        } else {
            setShowLoginModal(true);
        }
    }
  }, [searchParams, userData?.email]);

  const handleAnalyze = async () => {
    if (!userData?.email) {
        setShowLoginModal(true);
        return;
    }
    if (isUnlocking) return;
    setIsUnlocking(true);
    setError("");

    try {
      // Assuming the image URL is already linked to the session in the DB
      // We just need to trigger the analysis. We will pass a dummy imageUrl 
      // or we can modify the API to fetch it from the DB if omitted, but let's see.
      // Wait, /api/color-lab/analyze requires imageUrl currently. 
      // We need to fetch the session first to get the URL, OR modify the API to auto-fetch it.
      
      // Let's modify /api/color-lab/analyze to lookup the imageUrl if not provided.
      const res = await fetch('/api/color-lab/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email: userData.email }) 
      });

      if (res.status === 402) {
          setError("Insufficient credits. Please choose a plan below.");
          setIsUnlocking(false);
          return;
      }

      const data = await res.json();

      if (!res.ok) {
          throw new Error(data.error || "Analysis failed");
      }

      // Success! Redirect to report page
      // Since our API call is synchronous (waits for Gemini), if it returns successfully, 
      // the report is DONE. We should redirect with 'completed' status.
      router.push(getLinkHref(locale, `report/${sessionId}?status=completed`));

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please contact support.");
      setIsUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D2D2D] flex flex-col font-sans relative">
      <Header locale={locale} page="quiz" />
      
      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm transition-all duration-500 transform ${notification ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/95 backdrop-blur-sm px-5 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 flex items-start gap-3">
          <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 animate-pulse shrink-0"></div>
          <span className="text-sm font-medium text-[#2D2D2D] leading-snug">{notification}</span>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-20 space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 bg-[#E88D8D]/10 text-[#E88D8D] text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
            Step 4 / 4
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold italic leading-tight">
            Meet the best <br/>version of you.
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            We&apos;ve analyzed your facial coordinates. Unlock your <strong>12-Season AI Color Blueprint</strong> to discover your ultimate color palette, get inspired by curated outfit ideas, and start building a wardrobe that makes your natural beauty shine.
          </p>
        </div>

        {/* Action / Error Area */}
        {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-center text-sm font-bold animate-in fade-in">
                {error}
            </div>
        )}

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-8 border-y border-gray-100 max-w-4xl mx-auto">
            {[
                { 
                    icon: <svg className="w-6 h-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
                    title: "Discover Your Palette", 
                    desc: "Find your exact seasonal colors and style guide tailored to your unique skin tone." 
                },
                { 
                    icon: <svg className="w-6 h-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                    title: "Virtual AI Draping", 
                    desc: "See yourself in your best and worst colors instantly with our AI try-on technology." 
                },
                { 
                    icon: <svg className="w-6 h-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
                    title: "Outfit Inspiration", 
                    desc: "Be inspired by curated makeup shades, jewelry choices, and daily outfit ideas." 
                },
                { 
                    icon: <svg className="w-6 h-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                    title: "Shop Smarter", 
                    desc: "Check if clothes match you before you buy. Build a cohesive capsule wardrobe." 
                }
            ].map((prop, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] transition-all">
                    <div className="w-14 h-14 shrink-0 bg-[#FAF9F6] rounded-full flex items-center justify-center border border-white shadow-inner">
                        {prop.icon}
                    </div>
                    <div className="text-left mt-1 space-y-1.5">
                        <h3 className="font-bold text-base md:text-lg font-serif italic text-[#1A1A2E]">{prop.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{prop.desc}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex flex-col items-center justify-center space-y-6">
            <button 
                onClick={handleAnalyze}
                disabled={isUnlocking}
                className="group relative px-12 py-5 bg-[#2D2D2D] text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-15px_rgba(45,45,45,0.4)] hover:shadow-[0_30px_60px_-15px_rgba(45,45,45,0.6)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden w-full max-w-md"
            >
                {isUnlocking ? (
                    <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Blueprint...
                    </span>
                ) : (
                    <>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Unlock My Report Now
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-black border border-white/30 tracking-widest">-40 Credits</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    </>
                )}
            </button>
            <p className="text-xs text-gray-400 italic">One-time payment or use existing credits.</p>
        </div>

        {/* Pricing Component embedded */}
        <div className="pt-8 border-t border-gray-100">
            <div className="text-center mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Need credits? Choose a plan below</span>
            </div>
            <PricingContent locale={locale} />
        </div>

        {/* Reviews Section */}
        <div className="grid md:grid-cols-3 gap-6 pt-16 border-t border-gray-100">
            {[
                { name: "Sarah M.", text: "I finally understand why black always made me look sick! This completely changed how I shop.", stars: 5 },
                { name: "Jessica T.", text: "The virtual draping is mind-blowing. I can visually see what colors work before I buy them.", stars: 5 },
                { name: "Emily R.", text: "Worth every penny. The 12-week transformation plan gave me the confidence to rebuild my wardrobe.", stars: 5 }
            ].map((review, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex text-[#C5A059]">
                        {[...Array(review.stars)].map((_, j) => (
                            <svg key={j} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 italic leading-relaxed">&quot;{review.text}&quot;</p>
                    <span className="block text-[10px] font-black uppercase tracking-widest">{review.name}</span>
                </div>
            ))}
        </div>

      </main>

      <Footer locale={locale} page="quiz" />
    </div>
  );
}
