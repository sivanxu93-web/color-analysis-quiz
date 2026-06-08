import React from 'react';
import { SEO_SEASONS_DATA } from './seoTextsData';

export const getSeoText = (slug: string, locale: string = 'en') => {
  const item = SEO_SEASONS_DATA[slug];
  if (!item) return null;

  return (
    <div className="space-y-12 text-[#2D2D2D]">
      {/* 1. What is Season */}
      <div className="space-y-4">
        <h2 className="text-3xl font-serif font-bold text-[#1A1A2E]">What Is {item.title}? A Complete Guide to This Season</h2>
        <div className="flex flex-wrap gap-3 my-4">
          <span className="px-3 py-1 bg-[#FAF9F6] border border-gray-200 rounded-full text-xs font-mono text-gray-500">Hue: {item.hue}</span>
          <span className="px-3 py-1 bg-[#FAF9F6] border border-gray-200 rounded-full text-xs font-mono text-gray-500">Value: {item.value}</span>
          <span className="px-3 py-1 bg-[#FAF9F6] border border-gray-200 rounded-full text-xs font-mono text-gray-500">Chroma: {item.chroma}</span>
        </div>
        <p className="leading-relaxed text-gray-600">{item.characteristics}</p>
      </div>

      {/* 2. Color Palette */}
      <div className="space-y-4">
        <h3 className="text-2xl font-serif font-bold text-[#1A1A2E]">The Complete {item.title} Color Palette</h3>
        <p className="text-gray-600"><strong>Best Colors for {item.title}:</strong></p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
          {item.colors.map((c, i) => (
            <li key={i} className="list-disc text-sm text-gray-600 leading-relaxed">{c}</li>
          ))}
        </ul>
        <div className="mt-6 p-6 bg-red-50/30 border border-red-100 rounded-2xl">
          <h4 className="font-bold text-red-800 mb-2">Colors to Avoid:</h4>
          <p className="text-sm text-red-950/80 leading-relaxed">{item.avoid}</p>
        </div>
      </div>

      {/* 3. Capsule Wardrobe Rules */}
      <div className="space-y-4">
        <h3 className="text-2xl font-serif font-bold text-[#1A1A2E]">{item.title} Capsule Wardrobe Rules</h3>
        <p className="leading-relaxed text-gray-600">{item.wardrobeRule}</p>
      </div>

      {/* 4. Makeup & Style Guide */}
      <div className="space-y-4">
        <h3 className="text-2xl font-serif font-bold text-[#1A1A2E]">{item.title} Makeup & Cosmetics Guide</h3>
        <p className="leading-relaxed text-gray-600">{item.makeupGuide}</p>
      </div>

      {/* 5. Celebrities */}
      <div className="space-y-4">
        <h3 className="text-2xl font-serif font-bold text-[#1A1A2E]">{item.title} Celebrities</h3>
        <p className="leading-relaxed text-gray-600">Famous faces who share your seasonal color palette include <strong>{item.celebs}</strong>. Notice how they glow and look striking when styled in their correct colors.</p>
      </div>

      {/* 6. Sibling Comparison */}
      <div className="space-y-4">
        <h3 className="text-2xl font-serif font-bold text-[#1A1A2E]">{item.title} vs. {item.sibling}</h3>
        <p className="leading-relaxed text-gray-600">{item.siblingDiff}</p>
      </div>

      {/* CTA Box */}
      <div className="mt-12 p-8 bg-[#1A1A2E] text-white rounded-3xl relative overflow-hidden shadow-[0_20px_45px_rgba(26,26,46,0.15)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E88D8D]/10 rounded-full blur-3xl"></div>
        <h3 className="text-xl md:text-2xl font-serif font-bold mb-4 text-white">Take the Professional AI Scan to Confirm Your Season</h3>
        <p className="mb-6 text-white/80 text-sm leading-relaxed">
          Not entirely sure if you are a {item.title}? The human eye is easily tricked by bathroom yellow lights and clothing reflections. Use our studio-grade AI analyzer to get a mathematically precise breakdown of your facial pigments.
        </p>
        <a 
          href={locale === 'en' || locale === '' ? '/analysis' : `/${locale}/analysis`} 
          className="inline-block px-8 py-4 bg-[#E88D8D] text-white font-black rounded-full text-xs md:text-sm uppercase tracking-[0.2em] shadow-lg hover:bg-[#D67474] hover:scale-105 transition-all"
        >
          Start Professional AI Scan
        </a>
      </div>
    </div>
  );
};
