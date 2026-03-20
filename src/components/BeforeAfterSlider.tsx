'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage?: string;
  afterContent?: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number;
  isLocked?: boolean;
  onLockClick?: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  afterContent,
  beforeLabel = 'Before',
  afterLabel = 'After',
  initialPosition = 50,
  isLocked = false,
  onLockClick,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setPosition(percentage);
    },
    []
  );

  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none group cursor-col-resize leading-[0]"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* After Layer (Background) */}
      <div className="absolute inset-0 w-full h-full bg-[#1A1A1A]">
        {isLocked && afterContent ? (
          <div 
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
            style={{ 
                // 动态计算右侧内容的可见性和偏移
                // 如果 position > 80%，说明滑块几乎把右侧全挡住了，文字消失
                opacity: position > 85 ? 0 : 1,
                // 让文字在右侧剩余空间的中心
                paddingLeft: `${position}%` 
            }}
          >
            <div className="w-full h-full flex items-center justify-center p-4">
                {afterContent}
            </div>
          </div>
        ) : (
          <img
            src={afterImage}
            alt="After"
            className="block w-full h-full object-cover object-top pointer-events-none"
            draggable={false}
          />
        )}
      </div>

      {/* Before Image (Overlay with Clip-path) */}
      <img
        src={beforeImage}
        alt="Before"
        className="absolute top-0 left-0 w-full h-full object-cover object-top pointer-events-none"
        style={{ clipPath: `inset(0px ${100 - position}% 0px 0px)` }}
        draggable={false}
      />

      {/* Diagnostic Annotation Layer */}
      {!isDragging && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
          <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/20"></div>
          <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-white/20"></div>
          <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-white/20"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/20"></div>
        </div>
      )}

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10 shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95 cursor-col-resize ring-4 ring-black/5 opacity-70 group-hover:opacity-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="w-5 h-5 text-gray-700/80"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      {!isLocked && (
        <>
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20">
            {beforeLabel}
          </div>
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20">
            {afterLabel}
          </div>
        </>
      )}
    </div>
  );
};
