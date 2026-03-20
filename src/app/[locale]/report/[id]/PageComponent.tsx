'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { useState, useEffect, useRef } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { useCommonContext } from '~/context/common-context';
import { useRouter, useSearchParams } from 'next/navigation';
import PricingModal from '~/components/PricingModal';
import ColorFan from '~/components/ColorFan';
import { BeforeAfterSlider } from '~/components/BeforeAfterSlider';
import ShareModal from '~/components/ShareModal';

export default function PageComponent({
  locale,
  report,
  status: initialStatus,
  userImage,
  shareCardUrl,
  colorLabText,
  sessionId,
  drapingImages: initialDrapingImages,
  rating,
  isOwner = false
}: {
  locale: string;
  report: any;
  status: string;
  userImage: string | null;
  shareCardUrl?: string | null;
  colorLabText: any;
  sessionId?: string;
  drapingImages?: { best: string | null; worst: string | null };
  rating?: string;
  isOwner?: boolean;
}) {
  const { userData, setShowLoginModal, setShowPricingModal } = useCommonContext();
  const router = useRouter();

  const [status, setStatus] = useState(initialStatus);
  const [drapingImages, setDrapingImages] = useState(initialDrapingImages || { best: null, worst: null });
  const [isGeneratingDraping, setIsGeneratingDraping] = useState(false);
  const hasTriggeredDraping = useRef(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [drapingError, setDrapingError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const LOADING_TIPS = [
    "Analyzing your skin undertones...",
    "Matching with 12-season color theory...",
    "Simulating fabric reflections...",
    "Finding your perfect power colors...",
    "Consulting the AI stylist...",
  ];

  useEffect(() => {
    let tipInterval: any;
    let progressInterval: any;
    if (status === 'processing') {
      tipInterval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 3500);
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) return prev + 2;
          if (prev < 70) return prev + 1;
          if (prev < 92) return prev + 0.5;
          return prev;
        });
      }, 500);
    }
    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [status]);

  const [viewMode, setViewMode] = useState<'draping' | 'fan'>('draping');
  const searchParams = useSearchParams();
  const isDemo = searchParams?.get('demo') === 'true';
  const mockStatus = searchParams?.get('mock_status') || 'protected';

  useEffect(() => {
    if (isDemo) {
      setStatus(mockStatus);
    } else if (initialStatus && initialStatus !== status) {
      if (status === 'completed' && (initialStatus === 'protected' || initialStatus === 'processing' || initialStatus === 'draft')) return;
      if ((status === 'processing' || status === 'protected') && initialStatus === 'draft') return;
      setStatus(initialStatus);
    }
  }, [initialStatus, isDemo, mockStatus, status]);

  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'good' | 'bad' | 'submitted'>(rating ? 'submitted' : 'idle');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isMainFeedbackVisible, setIsMainFeedbackVisible] = useState(false);
  const [hasSeenContent, setHasSeenContent] = useState(false);

  useEffect(() => {
    if (userData?.email && sessionId) {
      fetch('/api/color-lab/session/claim', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ sessionId, email: userData.email })
      }).catch(err => console.error("Session claim failed", err));
    }
  }, [userData?.email, sessionId]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    if (paymentSuccess === 'true') {
      if (userData?.user_id) {
        window.history.replaceState({}, '', window.location.pathname);
        if (status === 'protected') handleUnlockClick();
      }
    } else if (status === 'draft') {
      if (userData?.email) triggerGeneration(); else setShowLoginModal(true);
    }
  }, [status, userData?.email, setShowLoginModal, userData?.user_id]);

  const triggerGeneration = async () => {
    if (!sessionId || !userData?.email) return;
    setStatus('processing');
    setGenerationError(null);
    setExistingSessionId(null);
    try {
      const res = await fetch('/api/color-lab/analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ sessionId, imageUrl: userImage, email: userData.email })
      });
      if (res.status === 402) { setStatus('protected'); return; }
      if (res.status === 409) {
        const data = await res.json();
        setExistingSessionId(data.sessionId);
        setGenerationError("PENDING_REPORT_EXISTS");
        return;
      }
      if (res.ok) router.refresh(); else setGenerationError("Analysis failed.");
    } catch (e) { setGenerationError("Connection error."); }
  };

  const handleUnlockClick = async () => {
    if (!userData?.user_id) { setShowPricingModal(true); return; }
    try {
      const res = await fetch('/api/color-lab/unlock', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ sessionId, email: userData.email })
      });
      if (res.status === 402) { setShowPricingModal(true); return; }
      if (res.ok) { setStatus('processing'); router.refresh(); } else setShowPricingModal(true);
    } catch (e) { setShowPricingModal(true); }
  };

  useEffect(() => {
    if ((status === 'completed' || status === 'protected') && report && !drapingImages.best && !isGeneratingDraping && sessionId && !drapingError && !hasTriggeredDraping.current) {
      handleGenerateDraping();
    }
  }, [status, sessionId, report, drapingImages.best, drapingError]);

  const handleGenerateDraping = async () => {
    if ((status !== 'completed' && status !== 'protected') || !sessionId || !report?.virtual_draping_prompts) return;
    setDrapingError(null);
    setIsGeneratingDraping(true);
    hasTriggeredDraping.current = true;
    
    try {
      if (isLocked) {
        // Locked mode: Only bait with the 'worst' color
        const res = await fetch('/api/color-lab/draping', { 
          method: 'POST', 
          headers: {'Content-Type': 'application/json'}, 
          body: JSON.stringify({ sessionId, prompt: report.virtual_draping_prompts.worst_color_prompt, type: 'worst' }) 
        });
        if (!res.ok) throw new Error("AI_BUSY");
        const data = await res.json();
        setDrapingImages(prev => ({ ...prev, worst: data.imageUrl }));
      } else {
        // Full mode: Request both
        const [bestRes, worstRes] = await Promise.all([
          fetch('/api/color-lab/draping', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ sessionId, prompt: report.virtual_draping_prompts.best_color_prompt, type: 'best' }) }),
          fetch('/api/color-lab/draping', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ sessionId, prompt: report.virtual_draping_prompts.worst_color_prompt, type: 'worst' }) })
        ]);
        
        let bestUrl = null;
        let worstUrl = null;
        
        if (bestRes.ok) {
          const d = await bestRes.json();
          bestUrl = d.imageUrl;
        }
        if (worstRes.ok) {
          const d = await worstRes.json();
          worstUrl = d.imageUrl;
        }
        
        setDrapingImages({ best: bestUrl, worst: worstUrl });
      }
    } catch (error) {
      console.error("Draping generation error", error);
      setDrapingError("AI is busy, please try again.");
      hasTriggeredDraping.current = false;
    } finally { 
      setIsGeneratingDraping(false); 
    }
  };

  const handleFeedback = async (rating: 'good' | 'bad') => {
    setFeedbackStatus(rating);
    if (rating === 'good') fetch('/api/color-lab/feedback', { method: 'POST', body: JSON.stringify({ sessionId, rating: 'good' }) }).catch(() => {});
  };

  const submitComment = async () => {
    fetch('/api/color-lab/feedback', { method: 'POST', body: JSON.stringify({ sessionId, rating: 'bad', comment: feedbackComment }) }).catch(() => {});
    setFeedbackStatus('submitted');
  };

  const MOCK_REPORT = {
    season: "Deep Winter",
    headline: "The Dark Romantic",
    description: "Your primary characteristic is Deep, and your secondary characteristic is Cool. You shine in high-contrast and rich jewel tones.",
    characteristics: { skin: "Cool Alabaster", eyes: "Piercing Espresso", hair: "Midnight Ink" },
    palette: {
      power: { colors: [{ hex: "#2E1A47", name: "Royal Purple" }, { hex: "#800020", name: "Oxblood" }, { hex: "#004040", name: "Deep Emerald" }], usage_advice: "Wear near face." },
      neutrals: { colors: [{ hex: "#333333", name: "Charcoal" }, { hex: "#FFFFFF", name: "Pure White" }], usage_advice: "Core pieces." },
      pastels: { colors: [{ hex: "#E6E6FA", name: "Icy Lavender" }, { hex: "#F0FFFF", name: "Icy Blue" }], usage_advice: "Softer look." }
    },
    makeup_recommendations: { summary: "Cool deep shades with sharp definition.", specific_products: [{ category: "Lipstick", shade: "Ruby Woo", recommendation: "Matte red" }] },
    styling: { metals: ["Silver", "Platinum"], keywords: ["Dramatic", "Bold", "Sharp"], fabrics: ["Silk", "Velvet"], accessories: "Silver accents" },
    worst_colors: [{ hex: "#DAA520", name: "Goldenrod", reason: "Sallow skin" }],
    fashion_guide: { work: "Structured Blazers", casual: "Leather Jackets", evening: "Sleek Velvet" },
    celebrities: ["Anne Hathaway", "Kendall Jenner"]
  };

  const isLocked = status === 'protected';
  const displayReport = isDemo ? MOCK_REPORT : report;
  const displayUserImage = (isDemo && !userImage) ? '/seasonal_color_analysis.jpg' : userImage;
  const displayDraping = isDemo && status === 'completed' ? { best: displayUserImage, worst: displayUserImage } : (isLocked ? { best: displayUserImage, worst: displayUserImage } : drapingImages);

  const { season: rawSeason, headline: dHeadline, description: dDescription, characteristics: dCharacteristics, palette: dPalette, makeup_recommendations: dMakeup, styling: dStyling, worst_colors: dWorst, celebrities: dCelebs, hair_color_recommendations: dHair } = displayReport || {};
  const dSeason = rawSeason;

  const normalizePalette = (group: any) => {
    if (!group) return { colors: [], usage_advice: null };
    if (Array.isArray(group)) return { colors: group, usage_advice: null };
    return { colors: group.colors || [], usage_advice: group.usage_advice || null };
  };

  const powerPalette = isLocked ? { ...normalizePalette(dPalette?.power), colors: normalizePalette(dPalette?.power).colors.slice(0, 3) } : normalizePalette(dPalette?.power);
  const neutralPalette = normalizePalette(dPalette?.neutrals);
  const pastelPalette = normalizePalette(dPalette?.pastels);

  const BlurLock = ({ children, label = "Unlock to View" }: { children: React.ReactNode, label?: string }) => {
    if (!isLocked) return <>{children}</>;
    return (
      <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-100/50" onClick={handleUnlockClick}>
        <div className="blur-[6px] opacity-60 transition-all duration-500 group-hover:blur-[4px]">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/20 hover:bg-white/10">
          <div className="bg-[#1A1A2E] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 transform transition-all group-hover:scale-105">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span className="text-xs font-bold uppercase">{label}</span>
          </div>
        </div>
      </div>
    );
  };

  if (status === 'processing' || (!displayReport && !isDemo)) {
    return (
      <>
        <Header locale={locale} page={'report'} />
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] p-6 text-center">
          {generationError ? (
            <div className="max-w-md w-full space-y-8 animate-fade-in">
              <div className="text-6xl mb-6">
                {generationError === "PENDING_REPORT_EXISTS" ? "⏳" : "🤔"}
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-serif font-bold text-[#2D2D2D] tracking-tight">
                  {generationError === "PENDING_REPORT_EXISTS" ? "One Report at a Time" : "Analysis Interrupted"}
                </h2>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {generationError === "PENDING_REPORT_EXISTS" 
                    ? "Our AI is already busy curating a masterpiece for you. Please check your existing analysis before starting a new one."
                    : "We hit a small snag connecting to our AI stylist. Don't worry, your progress is saved."}
                </p>
              </div>

              <div className="pt-6">
                {generationError === "PENDING_REPORT_EXISTS" && existingSessionId ? (
                  <Link 
                    href={getLinkHref(locale, `report/${existingSessionId}`)}
                    className="inline-flex items-center justify-center px-10 py-4 bg-[#2D2D2D] text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                  >
                    View My Analysis
                  </Link>
                ) : (
                  <button 
                    onClick={triggerGeneration}
                    className="inline-flex items-center justify-center px-10 py-4 bg-[#2D2D2D] text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                  >
                    Retry Analysis
                  </button>
                )}
              </div>
              
              <div className="pt-4">
                <Link href={getLinkHref(locale, 'profile')} className="text-xs font-black text-[#C5A059] uppercase tracking-widest border-b border-[#C5A059]/30 pb-1 hover:border-[#C5A059] transition-all">
                  Go to My Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Professional Progress Circle */}
              <div className="relative w-32 h-32 mx-auto group">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" 
                          strokeDasharray={377} 
                          strokeDashoffset={377 - (377 * progress) / 100} 
                          className="text-[#E88D8D] transition-all duration-700 ease-out" 
                          strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold font-mono text-[#2D2D2D]">{Math.floor(progress)}%</span>
                </div>
                <div className="absolute -inset-4 bg-[#E88D8D]/5 rounded-full blur-xl animate-pulse -z-10"></div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-serif font-bold text-[#2D2D2D] tracking-tight italic">Curating Your Palette</h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-1.5 h-1.5 bg-[#E88D8D] rounded-full animate-bounce"></div>
                  <p className="text-sm font-medium text-gray-400 italic font-serif">
                    {LOADING_TIPS[currentTipIndex]}
                  </p>
                </div>
              </div>
              
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                Processing High-Resolution Data
              </p>
            </div>
          )}
        </div>
        <Footer locale={locale} page={'report'} />
      </>
    );
  }

  return (
    <>
      <Header locale={locale} page={'report'} />
      <PricingModal locale={locale} page={'report'} />
      <main className="min-h-screen bg-[#FAF9F6] font-sans text-[#2D2D2D] pb-20 scroll-smooth overflow-x-hidden">
        
        {/* 1. The Reveal - Mobile First Editorial */}
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-10 md:pt-20 overflow-hidden">
          <div id="reveal" className="relative flex flex-col pb-12 md:pb-32 border-b border-gray-100">
            <div className="absolute top-0 left-0 right-0 overflow-hidden z-0 pointer-events-none opacity-[0.03] select-none flex justify-center max-w-full truncate">
                <h1 className="text-[30vw] md:text-[20vw] font-serif leading-none text-[#2D2D2D] tracking-tighter uppercase">
                    {dSeason ? (dSeason.split(' ').length > 1 ? dSeason.split(' ')[1] : dSeason) : "ANALYSIS"}
                </h1>
            </div>

            <div className="relative z-10 w-full flex flex-col lg:flex-row gap-12 md:gap-24 items-center lg:items-start">
              {/* Image Column - First on Mobile for Impact */}
              <div className="w-full md:w-[70%] lg:w-[42%] relative order-1 lg:order-2 overflow-hidden lg:overflow-visible">
                <div className="relative w-full aspect-[3/4] md:aspect-[4/5] rounded-t-full rounded-b-[2.5rem] md:rounded-b-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border-[10px] md:border-[15px] border-white bg-white group z-10">
                  {displayUserImage ? (
                      <img src={displayUserImage} alt="User Muse" className="w-full h-full object-cover object-top transition-transform duration-[5000ms] group-hover:scale-110" />
                  ) : (
                      <div className="w-full h-full bg-[#F8F6F4] flex items-center justify-center text-gray-300 font-serif italic text-2xl">The Muse...</div>
                  )}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/50 shadow-lg flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#E88D8D] animate-pulse"></div>
                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-[#2D2D2D]">Muse Confirmed</span>
                  </div>
                </div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 border border-[#E88D8D]/10 rounded-full -z-0"></div>
              </div>

              {/* Text Column */}
              <div className="flex-1 space-y-10 md:space-y-16 lg:mt-24 w-full text-center lg:text-left order-2 lg:order-1">
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <div className="h-px w-12 bg-[#C5A059]"></div>
                    <span className="text-[#C5A059] uppercase tracking-[0.4em] text-[9px] md:text-[11px] font-black">Personal Color Analysis</span>
                  </div>
                  <h1 className="font-serif text-6xl md:text-[8rem] font-bold leading-[0.9] tracking-tighter text-[#2D2D2D]">
                    {isLocked ? (
                        <div className="relative inline-block cursor-pointer group" onClick={handleUnlockClick}>
                            <span className="opacity-30 blur-[2px] tracking-tight">
                                {dSeason ? (
                                    <>
                                        <span className="font-sans italic">****</span> {dSeason.split(' ').length > 1 ? dSeason.split(' ')[1] : ''}
                                    </>
                                ) : 'ANALYSIS READY'}
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-[#2D2D2D] text-white text-[9px] md:text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.3em] uppercase shadow-xl group-hover:scale-110 transition-all border border-white/20">
                                    Sub-type Locked
                                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#2D2D2D] via-[#4A4A4A] to-[#E88D8D]">{dSeason}</span>
                    )}
                  </h1>
                  
                  {/* Real Integrity Indicators */}
                  {isLocked && (
                    <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-8">
                        <div className="flex flex-col items-center lg:items-start">
                            <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mb-1">AI Confidence</span>
                            <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-1 ${i < 5 ? 'bg-[#C5A059]' : 'bg-gray-100'}`}></div>)}
                            </div>
                        </div>
                        <div className="flex flex-col items-center lg:items-start border-l border-gray-100 pl-6">
                            <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mb-1">Analysis Detail</span>
                            <span className="font-mono text-xs font-bold text-gray-400">High Precision</span>
                        </div>
                    </div>
                  )}

                  <p className="font-serif text-xl md:text-4xl italic text-gray-400 max-w-lg mx-auto lg:mx-0 px-4 md:px-0 leading-tight">
                    &quot;{dHeadline}&quot;
                  </p>
                </div>

                <div className="max-w-2xl mx-auto lg:mx-0 border-t border-gray-100 pt-10 md:pt-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    {isLocked && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FAF9F6]/40 backdrop-blur-[1px] cursor-pointer group" onClick={handleUnlockClick}>
                            <div className="bg-white/90 px-6 py-2 rounded-full shadow-md text-[10px] uppercase tracking-widest font-black text-gray-400 border border-gray-100">Analysis Secured</div>
                        </div>
                    )}
                    {dCharacteristics && Object.entries(dCharacteristics).map(([key, value]) => (
                      <div key={key} className={`space-y-2 md:space-y-4 ${isLocked ? 'opacity-30 blur-[2px]' : ''}`}>
                        <h4 className="text-[#C5A059] uppercase text-[9px] font-black tracking-[0.3em]">{key}</h4>
                        <p className="text-[#2D2D2D] text-[15px] md:text-lg font-serif italic leading-snug">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {isLocked && (
                    <div className="pt-6 flex flex-col items-center lg:items-start gap-6 px-4 md:px-0">
                        <button onClick={handleUnlockClick} className="w-full md:w-auto group relative bg-[#2D2D2D] text-white px-12 py-5 rounded-full font-bold text-xs tracking-[0.3em] uppercase overflow-hidden shadow-2xl transition-all active:scale-95">
                            <span className="relative z-10">Reveal My Full Report</span>
                            <div className="absolute inset-0 bg-[#E88D8D] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Visual Proof - Mobile Dark Stage */}
        <div id="draping" className="mt-24 md:mt-48 relative overflow-hidden bg-[#1A1A1A] py-20 md:py-48">
          <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-12 flex flex-col items-center">
            <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-end gap-10 mb-16 md:mb-24 text-center md:text-left">
              <div className="space-y-4">
                <h2 className="text-6xl md:text-[10rem] font-serif font-bold text-white tracking-tighter leading-none italic">The <br className="hidden md:block"/>Draping</h2>
                <p className="text-gray-500 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.4em]">Chromatography Diagnostic Stage</p>
              </div>
              {!isLocked && (
                <div className="bg-white/5 backdrop-blur-xl p-1.5 rounded-full border border-white/10 flex">
                  <button onClick={() => setViewMode('draping')} className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all ${viewMode === 'draping' ? 'bg-white text-black' : 'text-gray-400'}`}>PIXEL DATA</button>
                  <button onClick={() => setViewMode('fan')} className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all ${viewMode === 'fan' ? 'bg-white text-black' : 'text-gray-400'}`}>SPECTRUM</button>
                </div>
              )}
            </div>

            <div className="w-full flex flex-col items-center">
              {isLocked ? (
                <div className="relative w-full max-w-sm md:max-w-xl aspect-[4/5] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.8)] border border-white/5 bg-[#1A1A1A] group">
                  {/* 只要 worst 图回来了，就渲染滑块 */}
                  {drapingImages.worst ? (
                    <>
                      <BeforeAfterSlider 
                        beforeImage={drapingImages.worst} 
                        isLocked={true}
                        initialPosition={50} 
                        onLockClick={handleUnlockClick}
                        afterContent={
                            <div className="flex flex-col items-center justify-center p-4 text-center space-y-4 animate-fade-in" onClick={handleUnlockClick}>
                                <div className="w-10 h-10 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10">
                                    <svg className="w-5 h-5 text-[#E88D8D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-white text-[9px] font-black uppercase tracking-[0.3em]">Harmony Revealed</h4>
                                    <p className="text-white/40 text-[8px] leading-relaxed italic font-serif max-w-[140px] mx-auto">
                                        Unlock to eliminate shadows and visualize your peak radiance.
                                    </p>
                                </div>
                                <button onClick={handleUnlockClick} className="px-5 py-2 bg-[#E88D8D] text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                                    Discover
                                </button>
                            </div>
                        }
                      />
                      <div className="absolute top-6 left-6 z-40 pointer-events-none">
                          <span className="bg-red-500/80 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-sm uppercase tracking-widest border border-white/10">
                              Chromatic Noise
                          </span>
                      </div>
                    </>
                  ) : (
                    /* 只有当 worst 图还没回来时显示 loading */
                    <div className="absolute inset-0 z-50 bg-[#1A1A1A] flex flex-col items-center justify-center border border-white/5">
                        <div className="relative w-12 h-12 mb-6">
                            <div className="absolute inset-0 border-2 border-[#C5A059]/10 rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-t-[#C5A059] rounded-full animate-spin"></div>
                        </div>
                        <p className="font-mono text-[8px] text-[#C5A059] uppercase tracking-[0.4em]">Rendering Truth...</p>
                    </div>
                  )}
                </div>
              ) : viewMode === 'fan' ? (                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 w-full max-w-6xl shadow-2xl">
                  <div className="bg-[#1A1A1A] p-10 md:p-20"><ColorFan imageUrl={userImage} colors={powerPalette.colors || []} title="The Radiant Selection" /></div>
                  <div className="bg-[#1A1A1A] p-10 md:p-20 border-t md:border-t-0 md:border-l border-white/5"><ColorFan imageUrl={userImage} colors={dWorst || []} title="The Avoided Palette" /></div>
                </div>
              ) : (
                <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 md:gap-24 min-h-[600px] md:min-h-[800px]">
                  <div className="hidden lg:flex flex-col gap-16 w-48 opacity-20 text-white font-mono text-[9px] tracking-widest"><div>[ RAW_SIGNAL_01 ]</div><div>[ MATRIX_CALIBRATION ]</div></div>
                  <div className="flex-1 max-w-sm md:max-w-xl w-full">
                    <div className="relative aspect-[4/5] overflow-hidden shadow-[0_80px_150px_-40px_rgba(0,0,0,0.9)] bg-black border border-white/10 group">
                      <BeforeAfterSlider beforeImage={displayDraping.worst || ''} afterImage={displayDraping.best || ''} beforeLabel="VOID" afterLabel="VITAL" />
                    </div>
                  </div>
                  <div className="hidden lg:flex flex-col gap-16 w-48 opacity-20 text-white font-mono text-[9px] tracking-widest text-right"><div>[ NEURAL_SYNC_100% ]</div><div>[ OUTPUT_READY ]</div></div>
                </div>
              )}
            </div>

            {!isLocked && viewMode === 'draping' && displayDraping.best && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-32 max-w-5xl mt-12 md:mt-40 pt-12 border-t border-white/5 text-white/80 font-serif italic text-base md:text-2xl px-6 text-center md:text-left leading-tight">
                <div className="space-y-3 md:space-y-4">
                  <p className="opacity-90">&quot;Observe the dissonance created by sub-optimal pigments.&quot;</p>
                  <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-widest text-red-500/40 block">Diagnostic_Anomaly_Alpha</span>
                </div>
                <div className="space-y-3 md:space-y-4 md:pt-0 pt-8 border-t md:border-t-0 md:border-l border-white/5 md:pl-16">
                  <p className="opacity-90">&quot;Optimal harmony detected through skin-synchronized mapping.&quot;</p>
                  <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-widest text-emerald-500/30 block">Peak_Harmony_Sync</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. The Palette - Bauhaus Center Stage */}
        <div className="max-w-7xl mx-auto px-5 md:px-12 py-32 md:py-56 overflow-hidden">
          {dPalette && (
            <div id="palette" className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-start relative scroll-mt-32">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.02] select-none pointer-events-none z-0 overflow-hidden w-full max-w-full flex justify-center px-4">
                  <h2 className="text-[25vw] md:text-[30vw] font-serif font-black leading-none italic select-none break-all max-w-full overflow-hidden">HARMONY</h2>
              </div>
              <div className="lg:col-span-4 space-y-8 md:space-y-12 relative z-10 text-center md:text-left">
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center justify-center md:justify-start gap-4"><div className="h-[2.5px] w-10 bg-[#2D2D2D]"></div><span className="font-mono text-[10px] text-[#2D2D2D] uppercase font-black">Spec Archive / 003</span></div>
                  <h2 className="text-5xl md:text-[9rem] font-serif font-bold tracking-tighter leading-none italic break-words">The <br className="hidden md:block"/>Palette</h2>
                </div>
                <p className="text-gray-400 font-serif italic text-lg md:text-2xl leading-relaxed border-l-2 md:border-l-4 border-gray-100 pl-8 md:pl-12 max-w-md mx-auto md:mx-0 break-words">&quot;{powerPalette.usage_advice}&quot;</p>
              </div>
              
              <div className="lg:col-span-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-100 border border-gray-100 overflow-hidden shadow-2xl">
                  {powerPalette.colors.map((color: any, idx: number) => (
                    <div key={idx} className="group relative aspect-[3/5] bg-white">
                      <div className="absolute inset-0 transition-transform duration-[2000ms] group-hover:scale-110" style={{backgroundColor: color.hex}}></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white/95 backdrop-blur-xl border-t border-gray-100 translate-y-[2px]">
                        <p className="font-mono text-[9px] md:text-[11px] uppercase font-black tracking-widest text-gray-900 truncate">{color.name}</p>
                        <div className="flex justify-between font-mono text-[8px] md:text-[10px] text-gray-400 mt-1 md:mt-2"><span>{color.hex}</span><span className="opacity-40 italic">PWR_0{idx+1}</span></div>
                      </div>
                    </div>
                  ))}
                  {/* Visualizing Potential: Show more slots if locked to indicate depth */}
                  {isLocked && [1,2,3,4,5,6,7,8,9].map(i => (
                    <div key={`placeholder-${i}`} className="aspect-[3/5] bg-[#FAF9F6] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 via-white to-gray-50 opacity-50"></div>
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_3s_infinite] skew-x-12"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-1 h-1 bg-gray-200 rounded-full mb-2"></div>
                            <span className="font-mono text-[7px] text-gray-300 tracking-widest uppercase">Locked_Spectral_Node</span>
                        </div>
                    </div>
                  ))}
                </div>
                {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 bg-white/5 backdrop-blur-[1px]">
                        <button onClick={handleUnlockClick} className="bg-[#2D2D2D] text-white px-10 py-5 md:px-16 md:py-7 rounded-full font-mono text-[10px] md:text-[12px] uppercase tracking-[0.4em] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] active:scale-95 transition-all group/btn hover:bg-black ring-8 ring-white/50">
                            <span className="flex items-center gap-4">
                                <svg className="w-4 h-4 text-accent-gold" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                Unlock Full Professional Palette
                            </span>
                        </button>
                        <p className="mt-6 font-mono text-[8px] text-gray-400 uppercase tracking-widest bg-white/80 px-4 py-1 rounded-full border border-gray-100 shadow-sm">Personalized Material & Hue Analysis</p>
                    </div>
                )}
                
                <BlurLock label="Unlock Secondary Palettes">
                  <div className="mt-24 md:mt-40 space-y-32 md:space-y-48">
                    <div className="space-y-10 md:space-y-16">
                      <div className="flex items-center gap-6"><h3 className="font-mono text-[10px] md:text-[12px] uppercase font-black text-gray-300 tracking-[0.5em]">Essentials / Neutrals</h3><div className="h-px flex-1 bg-gray-50"></div></div>
                      <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1 bg-gray-50 p-1 border border-gray-100">
                        {neutralPalette.colors.map((c: any, i: number) => <div key={i} className="aspect-square sm:w-32 sm:h-40 bg-white" style={{backgroundColor: c.hex}}></div>)}
                      </div>
                    </div>
                    {dWorst && (
                      <div className="mt-24 md:mt-40 pt-20 md:pt-32 border-t border-gray-100">
                        <h3 className="font-mono text-[10px] md:text-[12px] uppercase font-black text-red-800/40 tracking-[0.5em] text-center md:text-left">Avoidance Archive / 004</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-12 md:mt-16">
                          {dWorst.map((c: any, i: number) => (
                            <div key={i} className="flex flex-col p-6 md:p-8 bg-white border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-700 group">
                              <div className="flex items-center gap-4 md:gap-8">
                                <div className="w-12 h-12 md:w-20 md:h-20 shrink-0 border-[4px] md:border-[8px] border-[#FAF9F6] shadow-sm" style={{backgroundColor: c.hex}}></div>
                                <div className="font-mono space-y-1 min-w-0">
                                  <p className="font-black text-[10px] md:text-sm uppercase tracking-widest text-gray-900 truncate">{c.name}</p>
                                  <p className="text-[8px] md:text-[11px] text-gray-400 font-bold">{c.hex}</p>
                                </div>
                              </div>
                              <p className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-gray-50 font-mono text-[8px] md:text-[10px] leading-relaxed text-red-900/40 uppercase italic opacity-0 group-hover:opacity-100 transition-opacity break-words">DIAGNOSIS: {c.reason}</p>                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </BlurLock>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-12 space-y-32 md:space-y-64 pb-40 md:pb-64 overflow-hidden">
          {/* 4. Beauty & Style */}
          <div id="makeup" className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-20 items-start relative">
            <div className="absolute top-0 left-0 opacity-[0.02] select-none pointer-events-none z-0 w-full max-w-full overflow-hidden flex justify-center">
                <h2 className="text-[35vw] md:text-[30vw] font-serif font-black leading-none break-all max-w-full overflow-hidden">GLOW</h2>
            </div>
            <div className="lg:col-span-7 space-y-12 md:space-y-24 relative z-10">
              <div className="space-y-6 md:space-y-8 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="h-px w-8 md:w-12 bg-[#C5A059]"></div>
                  <span className="text-[#C5A059] uppercase tracking-[0.3em] md:tracking-[0.4em] text-[8px] md:text-[10px] font-black">Cosmetic Strategy</span>
                </div>
                <h3 className="font-serif text-5xl md:text-[7rem] font-bold tracking-tighter text-[#2D2D2D] italic break-words">The Makeup Lab</h3>
                <p className="text-gray-400 font-serif italic text-lg md:text-3xl leading-snug max-w-xl mx-auto md:mx-0 break-words">&quot;{dMakeup?.summary}&quot;</p>
              </div>
              <BlurLock label="Unlock Makeup Artistry">
                <div className="grid grid-cols-1 gap-10 md:gap-20 border-t border-gray-100 pt-12 md:pt-24">
                  {dMakeup?.specific_products?.map((p: any, i: number) => (
                    <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-12 group text-center md:text-left">
                      <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border border-gray-100 rounded-full font-serif italic text-xl md:text-2xl mx-auto md:mx-0 group-hover:bg-[#2D2D2D] group-hover:text-white transition-all duration-500 shrink-0">{i+1}</div>
                      <div className="space-y-2 md:space-y-4">
                        <p className="text-[#C5A059] uppercase text-[8px] md:text-[10px] font-black tracking-[0.3em]">{p.category}</p>
                        <h4 className="font-serif text-2xl md:text-5xl font-bold text-[#2D2D2D] italic tracking-tight">{p.shade}</h4>
                        <p className="text-sm md:text-xl text-gray-400 font-serif italic leading-relaxed">{p.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </BlurLock>
            </div>
            <div id="styling" className="lg:col-span-5 space-y-20 md:space-y-40 lg:pl-16 border-t lg:border-t-0 lg:border-l border-gray-100/60 pt-20 lg:pt-0 relative z-10 overflow-hidden">              {dHair && (
                <div className="space-y-10 md:space-y-16">
                  <div className="space-y-3 md:space-y-4 text-center md:text-left">
                    <span className="font-mono text-[9px] md:text-[10px] text-[#C5A059] uppercase font-black tracking-[0.5em]">Haute Coiffure</span>
                    <h3 className="font-serif text-4xl md:text-6xl font-bold italic text-[#2D2D2D] break-words">Hair Artistry</h3>
                  </div>
                  <BlurLock label="Unlock Hair Concepts">
                    <div className="space-y-10 md:space-y-16">
                      {dHair.map((h: any, i: number) => (
                        <div key={i} className="group relative pl-0 md:pl-12 text-center md:text-left">
                          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#C5A059] via-[#C5A059]/20 to-transparent hidden md:block"></div>
                          <p className="font-black text-[10px] md:text-[13px] uppercase tracking-[0.3em] mb-2 text-[#2D2D2D]">{h.color}</p>
                          <p className="text-sm md:text-lg text-gray-400 font-serif italic leading-relaxed break-words">{h.desc}</p>
                        </div>
                      ))}
                    </div>
                  </BlurLock>
                </div>
              )}
              <div className="space-y-10 md:space-y-16 text-center md:text-left">
                <h3 className="font-serif text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Style Pillars</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-8 md:gap-x-10 gap-y-4 md:gap-y-6">
                  {dStyling?.keywords?.map((k: string, i: number) => (
                    <span key={i} className="text-[#2D2D2D] font-serif italic text-2xl md:text-5xl opacity-40 hover:opacity-100 hover:text-[#E88D8D] transition-all cursor-default select-none break-words">#{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. The Style Protocol */}
          {displayReport.fashion_guide && (
            <div id="fashion" className="pt-24 md:pt-48 border-t border-gray-100 relative scroll-mt-32 overflow-hidden">
              <div className="absolute top-0 right-0 opacity-[0.02] select-none pointer-events-none z-0"><h2 className="text-[30vw] md:text-[25vw] font-serif font-black leading-none">PROTOCOL</h2></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-baseline gap-8 md:gap-10 mb-16 md:mb-32 text-center md:text-left">
                <h3 className="font-serif text-5xl md:text-9xl font-bold tracking-tighter text-[#2D2D2D] italic leading-none">The Protocol</h3>
                <span className="font-mono text-[10px] md:text-[12px] tracking-[0.5em] text-gray-300 uppercase">Strategic Deployment / 005</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 shadow-2xl border border-gray-100 overflow-hidden relative z-10">
                {Object.entries(displayReport.fashion_guide).map(([key, value], i) => (
                  <div key={key} className="bg-white p-10 md:p-20 space-y-8 group hover:bg-[#FAF9F6] transition-all duration-700">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] md:text-[13px] font-black text-[#C5A059] uppercase tracking-[0.4em]">{key}</span>
                      <span className="text-gray-100 font-serif italic text-4xl md:text-7xl group-hover:text-[#E88D8D]/20 transition-colors">0{i + 1}</span>
                    </div>
                    <p className="text-[#2D2D2D] font-serif text-lg md:text-2xl leading-relaxed italic opacity-80">{value as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. The Icon Gallery */}
          {dCelebs && dCelebs.length > 0 && (
            <div id="muses" className="pt-24 md:pt-48 border-t border-gray-100 text-center relative">
              <div className="mb-16 md:mb-40 space-y-4 md:space-y-6">
                <span className="font-mono text-[9px] md:text-[12px] font-black text-[#C5A059] uppercase tracking-[0.5em] md:tracking-[0.6em]">Chromatic Peers</span>
                <h3 className="font-serif text-5xl md:text-[8rem] font-bold tracking-tighter text-[#2D2D2D]">Icon Gallery</h3>
                {isLocked && <p className="text-xs font-mono text-gray-400 uppercase tracking-widest px-6">Unlock to see your seasonal celebrity twins</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
                {dCelebs.map((c: string, i: number) => (
                  <div key={i} className={`bg-white p-10 md:p-20 border border-gray-50 flex flex-col items-center justify-center space-y-6 md:space-y-8 group transition-all duration-1000 shadow-sm ${isLocked && i > 0 ? 'blur-[10px] opacity-10 pointer-events-none' : 'hover:border-[#E88D8D]/20 hover:shadow-xl'}`}>
                    <div className="w-8 h-px bg-[#C5A059] group-hover:w-20 transition-all duration-1000"></div>
                    <span className="font-serif text-2xl md:text-5xl font-bold italic text-[#2D2D2D] group-hover:text-[#E88D8D] transition-colors">
                        {isLocked && i > 0 ? 'SECRET ICON' : c}
                    </span>
                    <p className="font-mono text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-gray-300">
                        {isLocked && i > 0 ? 'ID PROTECTED' : 'Seasonal Twin'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Final Manifesto */}
          <div className="max-w-5xl mx-auto p-10 md:p-32 bg-[#1A1A1A] text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#E88D8D]/5 rounded-full blur-[100px]"></div>
            <div className="relative z-10 space-y-10 md:space-y-20 text-center md:text-left">
              <div className="space-y-3 md:space-y-4">
                <span className="font-mono text-[9px] md:text-[12px] font-black text-[#C5A059] uppercase tracking-[0.5em] md:tracking-[0.6em]">Editorial Conclusion</span>
                <h3 className="font-serif text-5xl md:text-[7rem] font-bold tracking-tighter leading-[0.9] italic">Manifesto</h3>
              </div>
              <BlurLock label="Unlock Full Conclusion">
                <div className="relative pt-8 md:pt-0 overflow-hidden">
                  <span className="absolute -top-12 md:-top-16 -left-6 md:-left-12 text-[10rem] md:text-[15rem] text-white/5 font-serif leading-none select-none italic">&ldquo;</span>
                  <p className="text-xl md:text-5xl font-serif leading-tight md:leading-[1.1] italic opacity-95 relative z-10 text-white tracking-tight px-4 md:px-0">{dDescription}</p>
                </div>
              </BlurLock>
            </div>
          </div>

          <div className="text-center pt-24 border-t border-gray-100 flex flex-col items-center gap-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg">
                <Link href={getLinkHref(locale, 'analysis')} className="w-full group inline-flex items-center gap-4 px-12 py-6 bg-[#2D2D2D] text-white rounded-full text-lg font-bold hover:bg-black transition-all shadow-2xl justify-center uppercase tracking-widest text-[13px]">
                    <span>Analyze Again</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                {isOwner && (
                    <button onClick={() => setIsShareModalOpen(true)} className="w-full inline-flex items-center gap-4 px-12 py-6 bg-white text-[#2D2D2D] border-2 border-gray-100 rounded-full text-lg font-bold hover:border-[#2D2D2D] transition-all shadow-xl justify-center uppercase tracking-widest text-[13px]">
                        <span>Share Gallery</span>
                    </button>
                )}
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} page={'report'} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} season={dSeason} headline={dHeadline} colors={powerPalette.colors} userImage={userImage} locale={locale} sessionId={sessionId || report.session_id} initialShareCardUrl={shareCardUrl} />
      {isLocked && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-5 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] animate-slide-up">
            <div className="text-center md:text-left">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2D2D2D]">Personal Style Blueprint Ready</p>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-400 line-through">Stylist Office: $300</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                    <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest italic">Full Digital Access: $19.90</span>
                </div>
            </div>
            <button onClick={handleUnlockClick} className="w-full md:w-auto bg-[#2D2D2D] text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-lg hover:bg-black group/btn">
                <span className="flex items-center justify-center gap-3">
                    Unlock All 24 Pages
                    <span className="bg-[#E88D8D] px-2 py-0.5 rounded text-[8px]">1 Credit</span>
                </span>
            </button>
        </div>
      )}
    </>
  );
}
