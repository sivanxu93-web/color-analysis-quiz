'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { useCommonContext } from '~/context/common-context';
import { useState, useEffect } from 'react';

export default function PageComponent({
  locale,
  colorLabText,
}: {
  locale: string;
  colorLabText: any;
}) {
  const [reportCount, setReportCount] = useState(0);
  const [userAvatars, setUserAvatars] = useState<string[]>([]);

  useEffect(() => {
      // Fetch Stats
      fetch('/api/color-lab/stats')
          .then(res => res.json())
          .then(data => {
              if (data.count) setReportCount(data.count);
              if (data.avatars && data.avatars.length > 0) setUserAvatars(data.avatars);
          })
          .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Header locale={locale} page={''} />
      <main className="flex min-h-screen flex-col items-center">
         
         {/* Hero Section */}
         <section className="relative w-full overflow-hidden bg-white">
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-900/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-32 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left w-full">
                    <span className="inline-block py-1 px-4 rounded-md bg-[#1A1A2E] text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-6 shadow-xl">
                        Advanced 16-Season Matrix
                    </span>
                    <h1 className="font-serif text-4xl md:text-7xl font-bold text-[#1A1A2E] leading-tight mb-6">
                       {colorLabText.SixteenSeasonLanding.h1}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto md:mx-0">
                       {colorLabText.SixteenSeasonLanding.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full">
                        <Link
                            href={getLinkHref(locale, 'analysis')}
                            className="inline-flex items-center justify-center rounded-full bg-[#1A1A2E] px-8 py-4 text-lg font-bold text-white shadow-2xl hover:bg-black transition-all transform hover:-translate-y-1 w-full sm:w-auto"
                        >
                            {colorLabText.Landing.uploadBtn}
                        </Link>
                        <a href="#features" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-bold text-[#1A1A2E] border-2 border-[#1A1A2E] hover:bg-slate-50 transition-all w-full sm:w-auto">
                            The Science
                        </a>
                    </div>
                    <div className="mt-12 flex items-center justify-center md:justify-start gap-6 text-sm text-slate-400">
                        <div className="flex flex-col">
                            <span className="text-[#1A1A2E] font-bold text-2xl">16</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold">Sub-Types</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="flex flex-col">
                            <span className="text-[#1A1A2E] font-bold text-2xl">100%</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold">AI Driven</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="flex flex-col">
                            <span className="text-[#1A1A2E] font-bold text-2xl">30+</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold">HD Colors</span>
                        </div>
                    </div>
                </div>
                
                {/* Hero Visual */}
                <div className="flex-1 relative w-full group">
                    <div className="relative z-10 rounded-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-100">
                        <img 
                            src="/seasonal_color_analysis.jpg" 
                            alt="16-Season AI Color Analysis - High Precision Color Matching" 
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1A2E]/20 to-transparent"></div>
                    </div>
                    {/* UI Overlay Elements */}
                    <div className="absolute top-10 -left-10 bg-white/90 backdrop-blur p-4 rounded-xl shadow-xl border border-slate-100 z-20 animate-bounce-slow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contrast Match</span>
                        </div>
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[94%]"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-10 -right-10 bg-[#1A1A2E] text-white p-4 rounded-xl shadow-2xl z-20">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Detected Season</p>
                        <p className="text-xl font-serif italic">Bright Winter Flow</p>
                    </div>
                </div>
            </div>
         </section>

         {/* 16-Season Science */}
         <section id="features" className="py-32 w-full bg-[#f8f9fa]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1A1A2E] mb-8 leading-tight">
                            {colorLabText.SixteenSeasonLanding.h2}
                        </h2>
                        <p className="text-xl text-slate-500 leading-relaxed mb-12">
                            {colorLabText.SixteenSeasonLanding.h2_2}
                        </p>
                        <div className="space-y-8">
                            {[
                                { title: colorLabText.SixteenSeasonLanding.feature1Title, desc: colorLabText.SixteenSeasonLanding.feature1Desc, icon: '🎯' },
                                { title: colorLabText.SixteenSeasonLanding.feature2Title, desc: colorLabText.SixteenSeasonLanding.feature2Desc, icon: '🌊' },
                                { title: colorLabText.SixteenSeasonLanding.feature3Title, desc: colorLabText.SixteenSeasonLanding.feature3Desc, icon: '💎' }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-xl">{feature.icon}</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[#1A1A2E] mb-2">{feature.title}</h4>
                                        <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="grid grid-cols-4 grid-rows-4 gap-4 aspect-square">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className="rounded-lg shadow-inner animate-pulse" 
                                    style={{ 
                                        backgroundColor: `hsl(${(i * 22) % 360}, 60%, 70%)`,
                                        animationDelay: `${i * 0.1}s`
                                    }}
                                ></div>
                            ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl border border-white text-center">
                                <p className="text-3xl font-bold text-[#1A1A2E]">16</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Precision Zones</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </section>

         {/* CTA */}
         <section className="py-24 w-full bg-[#1A1A2E] text-white">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8">Ready for High-Precision Analysis?</h2>
                <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">Get your definitive 16-season profile and stop the guesswork once and for all.</p>
                <Link
                    href={getLinkHref(locale, 'analysis')}
                    className="inline-flex items-center justify-center rounded-full bg-white px-12 py-5 text-xl font-bold text-[#1A1A2E] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-slate-100 transition-all transform hover:-translate-y-1"
                >
                    {colorLabText.Landing.uploadBtn}
                </Link>
            </div>
         </section>

         <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": colorLabText.SixteenSeasonLanding.h1,
                "description": colorLabText.SixteenSeasonLanding.description,
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app'}/${locale}/16-season-color-analysis`,
                "applicationCategory": "LifestyleApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "19.90",
                  "priceCurrency": "USD"
                }
              })
            }}
          />
      </main>
      <Footer locale={locale} page={'home'} />
    </>
  )
}
