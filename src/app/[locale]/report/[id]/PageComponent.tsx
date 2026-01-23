'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { useState, useEffect, useRef } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { useCommonContext } from '~/context/common-context';
import { useRouter } from 'next/navigation';

export default function PageComponent({
  locale,
  report,
  userImage,
  colorLabText,
  sessionId,
  drapingImages: initialDrapingImages,
  rating,
  isOwner = false
}: {
  locale: string;
  report: any; 
  userImage: string | null;
  colorLabText: any;
  sessionId?: string;
  drapingImages?: { best: string | null; worst: string | null };
  rating?: string;
  isOwner?: boolean;
}) {
  const { userData, setShowLoginModal, setShowPricingModal } = useCommonContext();
  const router = useRouter();
  // const searchParams = useSearchParams(); // Removed
  // const autoUnlock = searchParams.get('auto') === '1'; // Removed
  
  const [drapingImages, setDrapingImages] = useState(initialDrapingImages || { best: null, worst: null });
  const [isGeneratingDraping, setIsGeneratingDraping] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [drapingError, setDrapingError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  // const hasAutoUnlocked = useRef(false); // Removed
  
  // Feedback State
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'good' | 'bad' | 'submitted'>(rating ? 'submitted' : 'idle');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isMainFeedbackVisible, setIsMainFeedbackVisible] = useState(false);
  const [hasSeenContent, setHasSeenContent] = useState(false);

  const LOADING_TIPS = [
    "Analyzing your skin undertones...",
    "Matching with 12-season color theory...",
    "Simulating fabric reflections...",
    "Finding your perfect power colors...",
    "Consulting the AI stylist...",
  ];

  // Auto-Unlock removed. Analysis page handles it.

  useEffect(() => {
    if (!report) return; // Skip observer if report is null (Teaser mode)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
            if (entry.target.id === 'main-feedback') {
                setIsMainFeedbackVisible(entry.isIntersecting);
            }
            if (entry.target.id === 'palette' && entry.isIntersecting) {
                setHasSeenContent(true);
            }
        });
      },
      { threshold: 0.1 }
    );
    
    const mainFeedback = document.getElementById('main-feedback');
    const palette = document.getElementById('palette');
    
    if (mainFeedback) observer.observe(mainFeedback);
    if (palette) observer.observe(palette);

    return () => {
      observer.disconnect();
    };
  }, [report]);

  useEffect(() => {
      if (report?.season) {
          sendGAEvent('event', 'view_report', { season: report.season });
      }
  }, [report]);

  useEffect(() => {
    if (report && !drapingImages.best && !drapingError) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [report, drapingImages.best, drapingError]);

  const { 
      season, headline, description, characteristics, 
      palette, makeup, makeup_recommendations, styling, 
      worst_colors, virtual_draping_prompts,
      celebrities, fashion_guide, hair_color_recommendations
  } = report || {};

  const handleFeedback = async (rating: 'good' | 'bad') => {
      setFeedbackStatus(rating);
      if (rating === 'good') {
          try {
            await fetch('/api/color-lab/feedback', {
                method: 'POST',
                body: JSON.stringify({ sessionId, rating: 'good' })
            });
          } catch(e) { console.error(e) }
      }
  };

  const submitComment = async () => {
      try {
        await fetch('/api/color-lab/feedback', {
            method: 'POST',
            body: JSON.stringify({ sessionId, rating: 'bad', comment: feedbackComment })
        });
      } catch(e) { console.error(e) }
      setFeedbackStatus('submitted');
  };

  const handleUnlock = async (isAuto = false) => {
      if (!userData?.email) {
          if (!isAuto) setShowLoginModal(true);
          return;
      }

      setIsUnlocking(true);
      try {
          const res = await fetch('/api/color-lab/analyze', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  sessionId,
                  imageUrl: userImage,
                  email: userData.email
              })
          });

          if (res.status === 402) {
              if (isAuto) {
                  // If auto-unlock failed due to no credits, just stop spinning.
                  // User stays on Teaser page and sees "Unlock" button.
                  setIsUnlocking(false);
              } else {
                  // If manual click failed, redirect to pay
                  router.push(getLinkHref(locale, 'pricing'));
                  setIsUnlocking(false);
              }
              return;
          }

          if (res.ok) {
              router.refresh();
          } else {
              if (!isAuto) alert("Analysis failed. Please try again.");
              setIsUnlocking(false);
          }
      } catch (e) {
          console.error(e);
          setIsUnlocking(false);
      }
  };

  const handleGenerateDraping = async () => {
    if (!sessionId || !virtual_draping_prompts) return;
    setIsGeneratingDraping(true);
    setDrapingError(null);
    
    try {
        const [bestRes, worstRes] = await Promise.all([
            fetch('/api/color-lab/draping', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    sessionId, 
                    prompt: virtual_draping_prompts.best_color_prompt, 
                    makeup_prompt: virtual_draping_prompts.best_makeup_prompt,
                    type: 'best' 
                })
            }),
            fetch('/api/color-lab/draping', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    sessionId, 
                    prompt: virtual_draping_prompts.worst_color_prompt, 
                    makeup_prompt: virtual_draping_prompts.worst_makeup_prompt,
                    type: 'worst' 
                })
            })
        ]);

        if (!bestRes.ok || !worstRes.ok) {
            throw new Error("AI Service is busy");
        }

        const bestData = await bestRes.json();
        const worstData = await worstRes.json();

        setDrapingImages({
            best: bestData.imageUrl,
            worst: worstData.imageUrl
        });

    } catch (error) {
        console.error("Failed to generate draping images", error);
        setDrapingError("Our AI stylist is currently in high demand. Please try again.");
    } finally {
        setIsGeneratingDraping(false);
    }
  };

  // Auto-generate on mount if images are missing
  useEffect(() => {
      if (report && !drapingImages.best && !isGeneratingDraping && sessionId && !drapingError) {
          handleGenerateDraping();
      }
  }, [sessionId, report]); 

  // MOCK REPORT for Soft Paywall
  const MOCK_REPORT = {
      season: "Deep Winter",
      headline: "The Dark Romantic",
      description: "Your primary characteristic is Deep, and your secondary characteristic is Cool. You shine in colors that are dark, vivid, and cool-toned. Your high contrast features require equally high contrast outfits to look your best.",
      characteristics: {
          skin: "Cool Undertone (Analyzed)",
          eyes: "High Contrast (Analyzed)",
          hair: "Deep Tone (Analyzed)"
      },
      palette: {
          power: [
              { hex: "#2E1A47", name: "Royal Purple" }, { hex: "#0F4C3A", name: "Emerald" },
              { hex: "#8B0000", name: "Deep Red" }, { hex: "#000000", name: "Black" }
          ],
          neutrals: [{ hex: "#333333", name: "Charcoal" }, { hex: "#FFFFFF", name: "Pure White" }],
          pastels: [{ hex: "#E6E6FA", name: "Icy Lavender" }, { hex: "#F0FFFF", name: "Icy Blue" }]
      },
      makeup_recommendations: {
          summary: "Opt for cool, deep shades. A bold red lip is your signature look.",
          specific_products: [
              { category: "Lipstick", shade: "Ruby Woo", recommendation: "Perfect matte red" },
              { category: "Blush", shade: "Deep Berry", recommendation: "Apply lightly" }
          ]
      },
      styling: {
          metals: ["Silver", "Platinum", "White Gold"],
          keywords: ["Dramatic", "Bold", "Sharp"],
      },
      worst_colors: [
          { hex: "#DAA520", name: "Goldenrod", reason: "Makes skin look sallow" },
          { hex: "#FF8C00", name: "Dark Orange", reason: "Clashes with cool undertones" }
      ],
      hair_color_recommendations: [
          { color: "Jet Black", desc: "Enhances contrast" },
          { color: "Cool Dark Brown", desc: "Harmonizes with skin" }
      ],
      celebrities: ["Anne Hathaway", "Kendall Jenner", "Lucy Liu"]
  };

  const isLocked = !report;
  const displayReport = report || MOCK_REPORT;
  
  // Use userImage for mock draping if locked
  const displayDraping = isLocked ? { best: userImage, worst: userImage } : drapingImages;

  // Destructure displayReport properly (moved down here)
  const { 
      season: dSeason, headline: dHeadline, description: dDescription, characteristics: dCharacteristics, 
      palette: dPalette, makeup_recommendations: dMakeup, styling: dStyling, 
      worst_colors: dWorst, celebrities: dCelebs, hair_color_recommendations: dHair
  } = displayReport;

  return (
    <>
      <Header locale={locale} page={'report'} />

      {/* Soft Paywall Overlay */}
      {isLocked && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 h-screen w-screen overflow-hidden">
             {/* Unlock Card */}
             <div className="relative bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-lg w-full text-center animate-fade-in-up">
                 <div className="relative inline-block mb-8">
                     <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                     {userImage ? (
                         <img src={userImage} alt="User" className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover mx-auto" />
                     ) : (
                         <div className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-4xl border-4 border-white shadow-xl">👤</div>
                     )}
                     <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white shadow-sm">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                     </div>
                 </div>

                 <h1 className="text-3xl font-serif font-bold text-[#1A1A2E] mb-3">Analysis Complete!</h1>
                 <p className="text-gray-500 mb-8 leading-relaxed">
                     We have identified your seasonal palette, best colors, and styling recommendations.
                 </p>

                 <button 
                    onClick={() => handleUnlock(false)}
                    disabled={isUnlocking}
                    className="group w-full bg-[#1A1A2E] text-white py-4 rounded-full font-bold text-lg shadow-xl hover:bg-primary transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                 >
                    {isUnlocking ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>Unlocking...</span>
                        </>
                    ) : (
                        <>
                            <span>Unlock My Report</span>
                        </>
                    )}
                 </button>
                 
                 <p className="mt-6 text-xs text-gray-400">
                    Secure & Private • 100% Satisfaction Guarantee
                 </p>
             </div>
         </div>
      )}

      <main className={`min-h-screen bg-[#FFFBF7] font-sans text-[#1A1A2E] pb-20 scroll-smooth transition-all duration-1000 ${isLocked ? 'blur-xl opacity-60 pointer-events-none select-none overflow-hidden h-screen' : ''}`}>

        {/* Sticky Nav */}
        <nav className="sticky top-[72px] lg:top-[80px] z-40 bg-[#FFFBF7]/95 backdrop-blur-md border-b border-[#E8E1D9] py-3 overflow-x-auto no-scrollbar shadow-sm transition-all">
            <div className="max-w-6xl mx-auto px-4 flex justify-start md:justify-center gap-6 md:gap-10 min-w-max">
                <a href="#reveal" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider whitespace-nowrap">Analysis</a>
                <a href="#draping" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider whitespace-nowrap">Draping</a>
                <a href="#palette" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider whitespace-nowrap">Palette</a>
                <a href="#makeup" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider whitespace-nowrap">Makeup</a>
                {dHair && <a href="#hair" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider whitespace-nowrap">Hair</a>}
                <a href="#styling" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider whitespace-nowrap">Styling</a>
            </div>
        </nav>

        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-8">

            {/* 1. The Reveal */}
            <div id="reveal" className="relative bg-[#1A1A2E] text-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E]/90 to-transparent z-10"></div>
                
                <div className="relative z-20 flex flex-col md:flex-row items-stretch min-h-[500px]">
                    {/* Text Side */}
                    <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
                        <div className="inline-block px-4 py-1 border border-accent-gold/50 text-accent-gold text-xs font-bold uppercase tracking-[0.2em] mb-6 w-max rounded-full">
                            Personal Analysis
                        </div>
                        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 leading-tight">
                            You are a <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 italic pr-2">{dSeason}</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 font-light italic mb-8 border-l-2 border-accent-gold pl-6">
                            &quot;{dHeadline || 'Discover your true colors.'}&quot;
                        </p>
                        <p className="text-gray-400 leading-relaxed max-w-md">
                            {dDescription}
                        </p>
                        
                        {/* Quick Traits */}
                        <div className="mt-10 grid grid-cols-3 gap-6 text-sm border-t border-white/5 pt-6">
                            {dCharacteristics && Object.entries(dCharacteristics).map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-accent-gold uppercase text-[10px] tracking-widest mb-1 font-bold opacity-80">{key}</p>
                                    <p className="font-medium text-white leading-snug">{value as string}</p>
                                </div>
                            ))}
                        </div>

                        {/* Celebrity Twins */}
                        {dCelebs && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Celebrity Twins</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {dCelebs.map((celeb: string, i: number) => (
                                        <span key={i} className="text-white font-serif text-lg italic opacity-90 border-b border-white/20 pb-0.5">
                                            {celeb}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Side */}
                    <div className="relative w-full md:w-[400px] shrink-0 p-6 md:p-8 flex items-start justify-center bg-black/20">
                        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-2 hover:rotate-0 transition-transform duration-700">
                            {userImage ? (
                                <img src={userImage} alt="User" className="w-full h-auto max-h-[600px] object-contain bg-gray-900" />
                            ) : (
                                <div className="w-full aspect-[3/4] bg-gray-800 flex items-center justify-center text-gray-500">No Image</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Visual Proof */}
            <div id="draping" className="text-center space-y-4 pt-8">
                <span className="text-primary font-bold tracking-widest uppercase text-xs">The Transformation</span>
                <h2 className="text-4xl font-serif font-bold text-[#1A1A2E]">Virtual Draping</h2>
                <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
            </div>

            {/* Draping: If Locked, show mock images. Else show real or loading */}
            {isLocked ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto opacity-50">
                    <div className="relative bg-white p-3 shadow-xl rounded-2xl">
                        <div className="w-full rounded-xl overflow-hidden bg-gray-50">
                            <img src={userImage || ''} className="w-full h-auto max-h-[700px] object-contain mx-auto" />
                        </div>
                    </div>
                    <div className="relative bg-white p-3 shadow-xl rounded-2xl">
                        <div className="w-full rounded-xl overflow-hidden bg-gray-50">
                            <img src={userImage || ''} className="w-full h-auto max-h-[700px] object-contain mx-auto" />
                        </div>
                    </div>
                 </div>
            ) : (
                <>
                {!displayDraping.best && !drapingError && (
                    <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] md:aspect-[2/1] bg-white/50 rounded-3xl border border-gray-100/50 flex flex-col items-center justify-center overflow-hidden my-12 shadow-sm backdrop-blur-sm">
                        <div className="relative z-10 text-center px-6 w-full max-w-md">
                            <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                            <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 tracking-tight">AI Stylist at Work</h4>
                            <p className="text-sm text-gray-500 font-medium animate-pulse min-h-[20px] transition-all duration-500 flex items-center justify-center gap-2 mb-4">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                {LOADING_TIPS[currentTipIndex]}
                            </p>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full animate-[progress_15s_ease-out_forwards] w-0"></div>
                            </div>
                        </div>
                    </div>
                )}

                {!displayDraping.best && drapingError && (
                    <div className="relative w-full max-w-3xl mx-auto py-12 px-6 flex flex-col items-center justify-center text-center bg-red-50/50 rounded-3xl border border-red-100 my-12">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-2">Generation Paused</h4>
                        <p className="text-sm text-gray-500 mb-6 max-w-md">{drapingError}</p>
                        <button 
                            onClick={handleGenerateDraping}
                            className="bg-[#1A1A2E] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {displayDraping.best && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    <div className="group relative">
                        <div className="absolute -inset-4 bg-green-100/50 rounded-[2rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
                        <div className="relative bg-white p-3 shadow-xl rounded-2xl">
                            <div className="w-full rounded-xl overflow-hidden relative bg-gray-50">
                                <img src={displayDraping.best} alt="Best" className="w-full h-auto max-h-[700px] object-contain mx-auto" />
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-green-100">
                                    <p className="text-xs font-bold uppercase tracking-wider text-green-800">✨ Best Match</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-center mt-6 font-serif italic text-gray-600">
                            &quot;Notice how your skin looks clearer and your eyes brighter.&quot;
                        </p>
                    </div>

                    <div className="group relative">
                        <div className="absolute -inset-4 bg-red-100/50 rounded-[2rem] rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
                        <div className="relative bg-white p-3 shadow-xl rounded-2xl hover:shadow-2xl transition-all">
                            <div className="w-full rounded-xl overflow-hidden relative bg-gray-50">
                                <img src={displayDraping.worst} alt="Worst" className="w-full h-auto max-h-[700px] object-contain mx-auto" />
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-red-100">
                                    <p className="text-xs font-bold uppercase tracking-wider text-red-800">🚫 To Avoid</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-center mt-6 font-serif italic text-gray-600">
                            &quot;Colors that may wash you out or create shadows.&quot;
                        </p>
                    </div>
                </div>
                )}
                </>
            )}

            {/* 3. The Curator's Palette */}
            {dPalette && (
                <div id="palette" className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-[#E8E1D9] relative overflow-hidden scroll-mt-20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    
                    <div className="text-center mb-16 relative z-10">
                        <h2 className="text-4xl font-serif font-bold mb-4">Your Power Palette</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            A curated selection of shades that harmonize perfectly with your natural coloring.
                        </p>
                    </div>

                    <div className="space-y-16 relative z-10">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="h-px flex-1 bg-gray-200"></span>
                                <h3 className="font-serif text-2xl font-bold italic">Power Colors</h3>
                                <span className="h-px flex-1 bg-gray-200"></span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {dPalette.power?.map((color: any, idx: number) => (
                                    <div key={idx} className="group">
                                        <div className="aspect-square rounded-2xl shadow-md transition-transform group-hover:-translate-y-2 relative overflow-hidden" style={{backgroundColor: color.hex}}>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <div className="text-center mt-3">
                                            <p className="font-bold text-[#1A1A2E]">{color.name}</p>
                                            <p className="text-xs text-gray-400 uppercase tracking-widest">{color.hex}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="font-serif text-xl font-bold mb-6 text-gray-800 border-b pb-2">Essentials / Neutrals</h3>
                                <div className="space-y-3">
                                    {dPalette.neutrals?.map((color: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 group cursor-default">
                                            <div className="w-12 h-12 rounded-full shadow-sm border-2 border-white ring-1 ring-gray-100" style={{backgroundColor: color.hex}}></div>
                                            <div>
                                                <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">{color.name}</p>
                                                <p className="text-xs text-gray-400 uppercase">{color.hex}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-serif text-xl font-bold mb-6 text-gray-800 border-b pb-2">Soft / Pastels</h3>
                                <div className="flex flex-wrap gap-3">
                                    {dPalette.pastels?.map((color: any, idx: number) => (
                                        <div key={idx} className="flex flex-col items-center w-20">
                                            <div className="w-16 h-16 rounded-full shadow-sm border border-gray-100 mb-2" style={{backgroundColor: color.hex}}></div>
                                            <p className="text-[10px] text-center text-gray-500 leading-tight">{color.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {dWorst && dWorst.length > 0 && (
                            <div className="mt-16 pt-12 border-t border-dashed border-gray-200">
                                <div className="text-center mb-10">
                                    <h3 className="font-serif text-2xl font-bold text-red-800 flex items-center justify-center gap-2">
                                        <span>🚫</span> Colors to Avoid
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-2">Shades that may conflict with your natural undertones.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {dWorst.map((color: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 bg-red-50/50 p-4 rounded-xl border border-red-100">
                                            <div className="w-12 h-12 rounded-full border border-white shadow-sm shrink-0" style={{backgroundColor: color.hex}}></div>
                                            <div>
                                                <p className="font-bold text-gray-900">{color.name}</p>
                                                <p className="text-xs text-gray-500 leading-tight mt-0.5">{color.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 4. Beauty & Style */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Makeup */}
                <div id="makeup" className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-[#E8E1D9] scroll-mt-20">
                    <h3 className="font-serif text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="text-4xl">💄</span> Makeup Lab
                    </h3>
                    
                    <div className="bg-[#FFFBF7] p-6 rounded-xl border border-primary/10 mb-8">
                        <p className="text-lg text-[#1A1A2E] font-medium leading-relaxed italic">
                            &quot;{dMakeup?.summary}&quot;
                        </p>
                    </div>

                    <div className="space-y-6">
                        {dMakeup?.specific_products?.map((prod: any, i: number) => (
                            <div key={i} className="flex items-center gap-5 p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
                                <div className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-xl shrink-0">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{prod.category}</p>
                                    <p className="font-bold text-lg text-gray-900">{prod.shade}</p>
                                    <p className="text-sm text-gray-500 mt-1">{prod.recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Styling */}
                <div id="styling" className="lg:col-span-5 space-y-8 scroll-mt-20">
                    {/* Hair Card */}
                    {dHair && (
                        <div id="hair" className="bg-[#1A1A2E] text-white p-8 rounded-[2rem] shadow-lg relative overflow-hidden scroll-mt-20">
                            <div className="relative z-10">
                                <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                                    <span>💇‍♀️</span> Hair Color
                                </h3>
                                <div className="space-y-4">
                                    {dHair.map((hair: any, i: number) => (
                                        <div key={i} className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                                            <p className="font-bold text-accent-gold mb-1">{hair.color}</p>
                                            <p className="text-sm text-gray-300 leading-snug">{hair.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        </div>
                    )}

                    {/* Metal Card */}
                    <div className="bg-white text-[#1A1A2E] p-8 rounded-[2rem] shadow-sm border border-[#E8E1D9] relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-serif text-2xl font-bold mb-4">Best Metals</h3>
                            <div className="flex flex-wrap gap-3">
                                {dStyling?.metals?.map((m: string, i: number) => (
                                    <span key={i} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium border border-gray-200">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Keywords Card */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E8E1D9]">
                        <h3 className="font-serif text-2xl font-bold mb-6">Style Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                            {dStyling?.keywords?.map((k: string, i: number) => (
                                <span key={i} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-colors cursor-default">
                                    #{k}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Section - Only for Owner */}
            {isOwner && !isLocked && (
            <div id="main-feedback" className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 text-center">
                <h3 className="text-xl font-serif font-bold text-[#1A1A2E] mb-6">Was this analysis helpful?</h3>
                
                {feedbackStatus === 'idle' && (
                    <div className="flex justify-center gap-8">
                        <button 
                            onClick={() => handleFeedback('good')} 
                            className="group flex flex-col items-center gap-2 transition-transform hover:scale-110"
                        >
                            <span className="text-4xl bg-green-50 p-4 rounded-full border border-green-100 group-hover:bg-green-100 transition-colors">👍</span>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-green-600">Yes</span>
                        </button>
                        <button 
                            onClick={() => handleFeedback('bad')} 
                            className="group flex flex-col items-center gap-2 transition-transform hover:scale-110"
                            >
                                <span className="text-4xl bg-red-50 p-4 rounded-full border border-red-100 group-hover:bg-red-100 transition-colors">👎</span>
                                <span className="text-xs font-bold text-gray-400 group-hover:text-red-600">No</span>
                            </button>
                        </div>
                    )}

                    {feedbackStatus === 'good' && (
                        <div className="animate-fade-in py-4">
                            <p className="text-green-600 font-bold text-2xl mb-2">Thank you! ✨</p>
                            <p className="text-gray-500">We&apos;re glad you liked your results.</p>
                        </div>
                    )}

                    {feedbackStatus === 'bad' && (
                        <div className="animate-fade-in text-left max-w-md mx-auto">
                            <p className="text-gray-700 font-medium mb-3 text-center">We&apos;re sorry to hear that. How can we improve?</p>
                            <textarea 
                                className="w-full p-4 border border-gray-200 rounded-2xl mb-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="E.g., Skin tone analysis was off, Colors don't match..."
                                rows={3}
                                value={feedbackComment}
                                onChange={(e) => setFeedbackComment(e.target.value)}
                            />
                            <div className="text-center">
                                <button 
                                    onClick={submitComment}
                                    className="bg-[#1A1A2E] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-md"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </div>
                    )}

                    {feedbackStatus === 'submitted' && (
                        <div className="py-6 animate-fade-in">
                            <p className="text-gray-500 font-medium mb-4">Thank you for your feedback!</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a 
                                    href={`https://twitter.com/intent/tweet?text=I%20just%20found%20out%20my%20seasonal%20color%20is%20${report?.season || 'amazing'}!%20Discover%20yours:&url=https://coloranalysisquiz.app`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <span>Share on 𝕏</span>
                                </a>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Link copied!");
                                    }}
                                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors shadow-sm"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                )}

                {/* CTA */}
                <div className="text-center py-16 border-t border-gray-200/50 mt-8">
                    <Link 
                        href={getLinkHref(locale, 'analysis')}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A2E] text-white rounded-full text-lg font-bold hover:bg-primary transition-colors shadow-xl"
                    >
                        <span>Analyze Another Photo</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

            </div>
        </main>
        <Footer locale={locale} page={'report'} />

        {/* Sticky Bottom Feedback Bar */}
        {isOwner && !isLocked && feedbackStatus === 'idle' && !isMainFeedbackVisible && hasSeenContent && drapingImages.best && (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl animate-slide-up transition-transform duration-500">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1A1A2E] mr-2">Was this helpful?</span>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleFeedback('good')} 
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1A1A2E] text-white rounded-full font-bold text-sm hover:bg-primary transition-colors shadow-sm"
                        >
                            <span>👍</span> Yes
                        </button>
                        <button 
                            onClick={() => handleFeedback('bad')} 
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <span>👎</span> No
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  )
}