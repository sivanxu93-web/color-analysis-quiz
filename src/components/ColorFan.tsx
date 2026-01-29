import React, { useState } from 'react';

interface ColorFanProps {
  imageUrl: string | null;
  colors: { hex: string; name: string }[];
  title: string;
}

export default function ColorFan({ imageUrl, colors, title }: ColorFanProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  if (!imageUrl) return null;

  return (
    <div className="relative bg-white p-3 shadow-xl rounded-2xl flex flex-col h-full">
      {/* Image Area with Overlay */}
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 group">
        <img 
            src={imageUrl} 
            alt="User" 
            className="w-full h-full object-cover" 
        />
        
        {/* Digital Drape Overlay - Simulates a neckline */}
        <div className="absolute inset-0 pointer-events-none">
            {/* SVG Mask for Neckline Drape */}
            {/* This path creates a 'U' shape at the bottom, covering the user's clothes */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <path 
                    d="M0,100 L0,75 Q50,90 100,75 L100,100 Z" 
                    fill={selectedColor?.hex || 'transparent'} 
                />
            </svg>
            {/* Texture overlay for realism */}
            <div 
                className="absolute bottom-0 left-0 right-0 h-[25%] opacity-30 mix-blend-overlay pointer-events-none"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000000' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` 
                }}
            ></div>
        </div>

        {/* Floating Label */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</p>
                <p className="font-bold text-[#1A1A2E]">{selectedColor?.name}</p>
            </div>
            <div className="w-6 h-6 rounded-full border border-gray-200" style={{backgroundColor: selectedColor?.hex}}></div>
        </div>
      </div>

      {/* Color Picker (Swatches) */}
      <div className="mt-4 px-2">
          <p className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-widest text-center">Tap to Try Color</p>
          <div className="flex flex-wrap justify-center gap-2">
              {colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selectedColor.hex === c.hex ? 'border-[#1A1A2E] scale-110 shadow-md' : 'border-transparent'}`}
                    style={{backgroundColor: c.hex}}
                    title={c.name}
                  />
              ))}
          </div>
      </div>
    </div>
  );
}
