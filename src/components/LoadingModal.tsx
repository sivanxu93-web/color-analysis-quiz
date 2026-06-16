'use client'
import { Fragment, useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { useCommonContext } from "~/context/common-context";

export default function LoadingModal({
                                       loadingText,
                                     }: {
  loadingText?: string;
}) {
  const { showLoadingModal } = useCommonContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = [
    "Detecting skin undertones...",
    "Calibrating contrast levels...",
    "Synthesizing seasonal palette...",
    "Finalizing beauty matrix..."
  ];

  // Text cycling logic
  useEffect(() => {
    if (!showLoadingModal) {
      setCurrentIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [showLoadingModal]);

  // Progress bar simulation
  useEffect(() => {
    if (!showLoadingModal) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = prev < 50 ? 10 : prev < 80 ? 5 : 2;
        return Math.min(prev + increment, 100);
      });
    }, 300);
    return () => clearInterval(interval);
  }, [showLoadingModal]);

  return (
    <Transition.Root show={showLoadingModal} as={Fragment}>
      <div className="fixed inset-0 z-[99999] bg-[#fff8f5] text-[#1e1b18] min-h-screen flex flex-col items-center justify-center overflow-hidden antialiased">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          @keyframes fade-text {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes aura-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes aura-spin-reverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
        `}} />
        
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#efe6e2]/50 to-transparent pointer-events-none" />

        <main className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
          {/* Brand Header */}
          <div className="mb-12" style={{ animation: 'pulse-slow 4s infinite ease-in-out' }}>
            <h1 className="font-serif text-4xl text-[#884c35] tracking-[0.2em] text-center font-bold">AURA</h1>
          </div>

          {/* Shader Container */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-[0_0_40px_rgba(192,122,96,0.15)] flex items-center justify-center bg-white/50 backdrop-blur-md border border-white/50 mb-12">
            {/* Fluid Aura Shader Animation */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-[#c07a60] via-[#D4A5A5] to-[#fff8f5] opacity-60 filter blur-xl scale-125" 
              style={{ animation: 'aura-spin 10s linear infinite' }} 
            />
            <div 
              className="absolute inset-2 bg-gradient-to-bl from-[#D4A5A5] via-[#fff8f5] to-[#c07a60] opacity-50 filter blur-lg scale-110" 
              style={{ animation: 'aura-spin-reverse 15s linear infinite' }} 
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent mix-blend-overlay animate-pulse" 
            />
            {/* Inner Ring for depth */}
            <div className="absolute inset-4 rounded-full border border-white/30 pointer-events-none z-10" />
          </div>

          {/* Status Text Area */}
          <div className="text-center w-full min-h-[80px] flex flex-col items-center justify-center">
            <h2 className="font-serif text-xl font-bold text-[#53433e] mb-2">
              {loadingText && loadingText !== "Analyzing..." && loadingText !== "分析中..." ? loadingText : "Analyzing Profile"}
            </h2>
            {/* Dynamic Status Messages */}
            <div className="relative w-full h-6 flex justify-center items-center">
              <p 
                className="font-sans text-sm text-[#85736d] absolute" 
                style={{ animation: 'fade-text 3s infinite' }}
              >
                {messages[currentIndex]}
              </p>
            </div>
          </div>

          {/* Progress Bar (Minimalist) */}
          <div className="w-48 h-0.5 bg-[#e9e1dc] mt-6 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#884c35]/50 transition-all duration-300 ease-out rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </main>

        {/* Decorative Bottom Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-[#efe6e2]/30 to-transparent pointer-events-none" />
      </div>
    </Transition.Root>
  );
}
