import {useState, useEffect} from 'react'
import BaseModal from './BaseModal';
import {useCommonContext} from "~/context/common-context";

export default function GeneratingModal({
                                          generatingText,
                                        }) {

  const {showGeneratingModal, setShowGeneratingModal} = useCommonContext();
  const [tipIndex, setTipIndex] = useState(0);
  
  const TIPS = [
    "Analyzing skin undertones...",
    "Scanning eye patterns...",
    "Calculating contrast levels...",
    "Matching seasonal palettes...",
    "Generating virtual try-on..."
  ];

  useEffect(() => {
    if (showGeneratingModal) {
      const interval = setInterval(() => {
        setTipIndex(i => (i + 1) % TIPS.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [showGeneratingModal]);

  return (
    <BaseModal 
      isOpen={showGeneratingModal} 
      onClose={() => {}} // Prevent closing while generating
      title="AI Stylist at Work"
      icon={<span className="text-4xl animate-pulse">✨</span>}
    >
        <div className="py-6 px-2">
            <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/60 to-primary rounded-full animate-[progress_20s_cubic-bezier(0.1,0.7,1.0,0.1)_forwards] w-0"></div>
            </div>
            
            <div className="text-center space-y-2">
                <p className="text-gray-600 font-bold text-lg animate-fade-in transition-all duration-500">
                    {TIPS[tipIndex]}
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Processing</p>
            </div>
            
            <style jsx>{`
                @keyframes progress {
                    0% { width: 0%; }
                    10% { width: 20%; }
                    40% { width: 60%; }
                    70% { width: 85%; }
                    100% { width: 98%; }
                }
            `}</style>
        </div>
    </BaseModal>
  )
}
