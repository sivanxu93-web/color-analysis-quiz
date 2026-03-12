'use client'
import { Fragment, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'

export default function ShareModal({
  isOpen,
  onClose,
  season,
  headline,
  colors,
  userImage,
  locale,
  sessionId
}: {
  isOpen: boolean;
  onClose: () => void;
  season: string;
  headline: string;
  colors: { hex: string, name: string }[];
  userImage: string | null;
  locale: string;
  sessionId: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

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

  const shareText = `I just found my seasonal color: ${season}! Discover yours at ColorAnalysisQuiz.app`;
  const shareUrl = "https://coloranalysisquiz.app";

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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                
                {/* The Card to be Screenshotted */}
                <div ref={cardRef} className="bg-[#1A1A2E] text-white p-8 aspect-[4/5] flex flex-col justify-between relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    
                    <div className="relative z-10">
                        <p className="text-accent-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">My Seasonal ID</p>
                        <h2 className="font-serif text-4xl font-bold mb-2 leading-tight">{season}</h2>
                        <p className="text-gray-400 italic text-sm mb-8">&quot;{headline}&quot;</p>
                        
                        <div className="flex gap-4 mb-10">
                            {colors.slice(0, 3).map((c, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-2xl shadow-lg border border-white/10" style={{backgroundColor: c.hex}}></div>
                                    <span className="text-[8px] uppercase tracking-widest opacity-60">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                            {userImage ? (
                                <img src={userImage} className="w-12 h-12 rounded-full object-cover border-2 border-accent-gold" alt="Me" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-xl">✨</div>
                            )}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-accent-gold">Analyzed by</p>
                                <p className="text-xs font-bold">Color Analysis Quiz</p>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur p-2 rounded-lg border border-white/10">
                            <p className="text-[8px] font-bold text-center">SCAN TO START</p>
                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                                {/* Simple QR Placeholder */}
                                <div className="w-8 h-8 bg-black"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-white space-y-4">
                    <p className="text-center text-xs text-gray-500 font-medium mb-4">📸 Take a screenshot to share on Instagram or Pinterest!</p>
                    <div className="grid grid-cols-2 gap-4">
                        <a 
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={triggerReward}
                            className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            Share on 𝕏
                        </a>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                triggerReward();
                                alert("Link copied! You've earned 3 free Style Validator scans! 🎁");
                            }}
                            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
                        >
                            Copy Link
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full text-center text-sm text-gray-400 font-medium py-2 hover:text-gray-600 transition-colors"
                    >
                        Close
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
