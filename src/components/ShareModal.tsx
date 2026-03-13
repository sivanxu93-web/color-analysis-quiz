'use client'
import { Fragment, useRef, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { toPng } from 'html-to-image'

export default function ShareModal({
  isOpen,
  onClose,
  season,
  headline,
  colors,
  userImage,
  locale,
  sessionId,
  initialShareCardUrl
}: {
  isOpen: boolean;
  onClose: () => void;
  season: string;
  headline: string;
  colors: { hex: string, name: string }[];
  userImage: string | null;
  locale: string;
  sessionId: string;
  initialShareCardUrl?: string | null;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(initialShareCardUrl || null);

  // Pre-upload the card as soon as it's likely to be needed
  useEffect(() => {
    if (isOpen && !shareCardUrl) {
        // Delay slightly to ensure fonts/images are rendered
        const timer = setTimeout(() => {
            ensureImageUploaded();
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const triggerReward = async () => {
    if (!sessionId) return;
    try {
        await fetch('/api/color-lab/share', {
            method: 'POST',
            body: JSON.stringify({ sessionId })
        });
    } catch (e) {
        console.error("Reward trigger failed", e);
    }
  };

  const ensureImageUploaded = async (): Promise<string | null> => {
    if (shareCardUrl) return shareCardUrl;
    if (cardRef.current === null) return null;
    
    setIsCapturing(true);
    try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
        const res = await fetch('/api/color-lab/share/upload', {
            method: 'POST',
            body: JSON.stringify({ sessionId, imageData: dataUrl })
        });
        const data = await res.json();
        if (data.url) {
            setShareCardUrl(data.url);
            return data.url;
        }
    } catch (err) {
        console.error('Upload failed', err);
    } finally {
        setIsCapturing(false);
    }
    return null;
  };

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    setIsCapturing(true);
    try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `my-color-season-${season.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
        triggerReward(); 
        
        // Also upload in background if not already there to enable future link previews
        if (!shareCardUrl) {
            fetch('/api/color-lab/share/upload', {
                method: 'POST',
                body: JSON.stringify({ sessionId, imageData: dataUrl })
            }).then(res => res.json()).then(data => {
                if (data.url) setShareCardUrl(data.url);
            }).catch(e => console.error("BG upload failed", e));
        }
    } catch (err) {
        console.error('oops, something went wrong!', err);
    } finally {
        setIsCapturing(false);
    }
  };

  const shareToX = async () => {
    await ensureImageUploaded();
    const text = `I just found my seasonal color: ${season}! Discover yours at ColorAnalysisQuiz.app`;
    const baseUrl = "https://coloranalysisquiz.app";
    const url = locale === 'en' ? `${baseUrl}/report/${sessionId}` : `${baseUrl}/${locale}/report/${sessionId}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    triggerReward();
  };

  const handleCopyLink = async () => {
    await ensureImageUploaded();
    const baseUrl = "https://coloranalysisquiz.app";
    const url = locale === 'en' ? `${baseUrl}/report/${sessionId}` : `${baseUrl}/${locale}/report/${sessionId}`;
    navigator.clipboard.writeText(url);
    alert("Link copied! When you share this link on social media, your result card will automatically appear. 🎁 You've earned 3 free Style Validator scans!");
    triggerReward();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                
                {/* Visual Area (The Card) */}
                <div className="p-4 bg-gray-50 flex justify-center overflow-hidden">
                    <div 
                        ref={cardRef} 
                        className="bg-white text-[#1A1A2E] w-full max-w-sm aspect-[3/4] flex flex-col justify-between relative shadow-xl overflow-hidden rounded-xl"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        {/* Background Design Elements */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary-light/30 to-transparent"></div>
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                        
                        <div className="p-10 relative z-10 flex-1 flex flex-col">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">Seasonal Identity</p>
                                    <h2 className="text-4xl font-serif font-bold text-[#1A1A2E]">{season}</h2>
                                </div>
                                <div className="w-10 h-10 border border-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-serif italic">
                                    AI
                                </div>
                            </div>

                            {/* Center Visual: The Palette */}
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {colors.slice(0, 3).map((c, i) => (
                                        <div key={i} className="flex flex-col items-center group">
                                            <div 
                                                className="w-full aspect-square rounded-full shadow-lg border-4 border-white transform transition-transform group-hover:scale-105" 
                                                style={{backgroundColor: c.hex}}
                                            ></div>
                                            <span className="mt-3 text-[8px] uppercase tracking-widest font-bold text-gray-400">{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-center text-gray-500 italic text-sm px-4">&quot;{headline}&quot;</p>
                            </div>

                            {/* Card Footer */}
                            <div className="mt-auto pt-10 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {userImage ? (
                                        <img src={userImage} className="w-12 h-12 rounded-full object-cover border-4 border-[#FFFBF7] shadow-sm" alt="Analysis Target" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl border-2 border-primary-light">✨</div>
                                    )}
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Certified Result</p>
                                        <p className="text-xs font-serif font-bold tracking-tight">ColorAnalysisQuiz.app</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-gray-300">Analysis Date</p>
                                    <p className="text-[10px] font-bold text-gray-500">2026.03.12</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interaction Area */}
                <div className="px-8 pb-8 pt-6 bg-white space-y-6">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-[#1A1A2E]">Share Your Style Identity</h3>
                        <p className="text-xs text-gray-500 mt-1">Download your card to post on Instagram or Pinterest Stories.</p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleDownload}
                            disabled={isCapturing}
                            className={`w-full flex items-center justify-center gap-3 bg-[#1A1A2E] text-white py-4 rounded-full font-bold shadow-xl hover:bg-black transition-all ${isCapturing ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isCapturing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Generating Card...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4-4v12" /></svg>
                                    Save Image & Earn +3 Scans
                                </>
                            )}
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={shareToX}
                                className="flex items-center justify-center gap-2 bg-[#F5F8FA] text-[#14171A] py-4 rounded-full font-bold text-sm border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                Post on X
                            </button>
                            <button 
                                onClick={handleCopyLink}
                                className="flex items-center justify-center gap-2 bg-[#F5F8FA] text-[#14171A] py-4 rounded-full font-bold text-sm border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                Copy Link
                            </button>
                        </div>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="w-full text-center text-xs text-gray-400 font-medium hover:text-gray-600 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
