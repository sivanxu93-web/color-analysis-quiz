'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { useState, useEffect } from 'react';

export default function PageComponent({
  locale,
  report,
  userImage,
  colorLabText,
  sessionId,
  drapingImages: initialDrapingImages 
}: {
  locale: string;
  report: any; 
  userImage: string | null;
  colorLabText: any;
  sessionId?: string;
  drapingImages?: { best: string | null; worst: string | null };
}) {
  const [drapingImages, setDrapingImages] = useState(initialDrapingImages || { best: null, worst: null });
  const [isGeneratingDraping, setIsGeneratingDraping] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const LOADING_TIPS = [
    "Analyzing your skin undertones...",
    "Matching with 12-season color theory...",
    "Simulating fabric reflections...",
    "Finding your perfect power colors...",
    "Consulting the AI stylist...",
  ];

  useEffect(() => {
    if (!drapingImages.best) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [drapingImages.best]);

  const { 
      season, headline, description, characteristics, 
      palette, makeup, makeup_recommendations, styling, 
      worst_colors, virtual_draping_prompts,
      celebrities, fashion_guide, hair_color_recommendations
  } = report || {};

  const handleGenerateDraping = async () => {
    if (!sessionId || !virtual_draping_prompts) return;
    setIsGeneratingDraping(true);
    
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

        const bestData = await bestRes.json();
        const worstData = await worstRes.json();

        setDrapingImages({
            best: bestData.imageUrl,
            worst: worstData.imageUrl
        });

    } catch (error) {
        console.error("Failed to generate draping images", error);
    } finally {
        setIsGeneratingDraping(false);
    }
  };

  // Auto-generate on mount if images are missing
  useEffect(() => {
      if (!drapingImages.best && !isGeneratingDraping && sessionId) {
          handleGenerateDraping();
      }
  }, [sessionId]); // Run once when sessionId is available

  if (!report) return null;

      return (

        <>

          <Header locale={locale} page={'report'} />

          <main className="min-h-screen bg-[#FFFBF7] font-sans text-[#1A1A2E] pb-20">

            

            {/* Decorative Background Elements */}

            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">

                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            </div>

    

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-12">

    

                {/* 1. The Reveal - Magazine Cover Style */}

                <div className="relative bg-[#1A1A2E] text-white rounded-3xl overflow-hidden shadow-2xl">

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

                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 italic pr-2">{season}</span>

                            </h1>

                            <p className="text-lg md:text-xl text-gray-300 font-light italic mb-8 border-l-2 border-accent-gold pl-6">

                                &quot;{headline || 'Discover your true colors.'}&quot;

                            </p>

                                                    <p className="text-gray-400 leading-relaxed max-w-md">

                                                        {description}

                                                    </p>

                                                    

                                                                            {/* Quick Traits */}

                                                    

                                                                            <div className="mt-10 grid grid-cols-3 gap-6 text-sm border-t border-white/5 pt-6">

                                                    

                                                                                {characteristics && Object.entries(characteristics).map(([key, value]) => (

                                                    

                                                                                    <div key={key}>

                                                    

                                                                                        <p className="text-accent-gold uppercase text-[10px] tracking-widest mb-1 font-bold opacity-80">{key}</p>

                                                    

                                                                                        <p className="font-medium text-white leading-snug">{value as string}</p>

                                                    

                                                                                    </div>

                                                    

                                                                                ))}

                                                    

                                                                            </div>

                                                    

                                                    

                                                    

                                                                            {/* Celebrity Twins (Moved Back Here) */}

                                                    

                                                                            {celebrities && (

                                                    

                                                                                <div className="mt-8 pt-6 border-t border-white/10">

                                                    

                                                                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Celebrity Twins</p>

                                                    

                                                                                    <div className="flex flex-wrap gap-x-4 gap-y-2">

                                                    

                                                                                        {celebrities.map((celeb: string, i: number) => (

                                                    

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

                                                    

                                                                                    <img src={userImage} alt="User" className="w-full h-auto object-cover" />

                                                    

                                                                                ) : (

                                                    

                                                                                    <div className="w-full aspect-[3/4] bg-gray-800 flex items-center justify-center text-gray-500">No Image</div>

                                                    

                                                                                )}

                                                    

                                                                            </div>

                                                    

                                                                        </div>

                                                    

                                                    

                    </div>

                </div>

    

                {/* 2. Visual Proof - Before & After */}

                <div className="text-center space-y-4">

                    <span className="text-primary font-bold tracking-widest uppercase text-xs">The Transformation</span>

                    <h2 className="text-4xl font-serif font-bold text-[#1A1A2E]">Virtual Draping</h2>

                    <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>

                </div>

    

                {!drapingImages.best && (
                    <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] md:aspect-[2/1] bg-white/50 rounded-3xl border border-gray-100/50 flex flex-col items-center justify-center overflow-hidden my-12 shadow-sm backdrop-blur-sm">
                        
                        <div className="relative z-10 text-center px-6">
                            <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                            <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 tracking-tight">AI Stylist at Work</h4>
                            <p className="text-sm text-gray-500 font-medium animate-pulse min-h-[20px] transition-all duration-500 flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                {LOADING_TIPS[currentTipIndex]}
                            </p>
                        </div>
                    </div>
                )}

                {drapingImages.best && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">

                    {/* Best Color */}

                    <div className="group relative">

                        <div className="absolute -inset-4 bg-green-100/50 rounded-[2rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>

                        <div className="relative aspect-[3/4] bg-white p-3 shadow-xl rounded-2xl">

                            <div className="w-full h-full rounded-xl overflow-hidden relative">

                                {drapingImages.best ? (

                                    <img src={drapingImages.best} alt="Best" className="w-full h-full object-cover" />

                                ) : (

                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse text-gray-400">Generatiing...</div>

                                )}

                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm">

                                    <p className="text-xs font-bold uppercase tracking-wider text-green-800">✨ Best Match</p>

                                </div>

                            </div>

                        </div>

                        <p className="text-center mt-6 font-serif italic text-gray-600">
                            &quot;Notice how your skin looks clearer and your eyes brighter.&quot;
                        </p>

                    </div>

    

                                    {/* Worst Color */}

    

                                    <div className="group relative">

    

                                        <div className="absolute -inset-4 bg-red-100/50 rounded-[2rem] rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>

    

                                        <div className="relative aspect-[3/4] bg-white p-3 shadow-xl rounded-2xl hover:shadow-2xl transition-all">

    

                                            <div className="w-full h-full rounded-xl overflow-hidden relative">

    

                                                {drapingImages.worst ? (

    

                    

                                    <img src={drapingImages.worst} alt="Worst" className="w-full h-full object-cover" />

                                ) : (

                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse text-gray-400">Generating...</div>

                                )}

                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm">

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

                {/* 3. The Curator's Palette */}

                {palette && (

                    <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-[#E8E1D9] relative overflow-hidden">

                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                        

                        <div className="text-center mb-16 relative z-10">

                            <h2 className="text-4xl font-serif font-bold mb-4">Your Power Palette</h2>

                            <p className="text-gray-500 max-w-xl mx-auto">

                                A curated selection of shades that harmonize perfectly with your natural coloring.

                            </p>

                        </div>

    

                        <div className="space-y-16 relative z-10">

                            {/* Power Colors - Big Impact */}

                            <div>

                                <div className="flex items-center gap-4 mb-8">

                                    <span className="h-px flex-1 bg-gray-200"></span>

                                    <h3 className="font-serif text-2xl font-bold italic">Power Colors</h3>

                                    <span className="h-px flex-1 bg-gray-200"></span>

                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                                    {palette.power?.map((color: any, idx: number) => (

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

    

                            {/* Neutrals & Accents */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                                <div>

                                    <h3 className="font-serif text-xl font-bold mb-6 text-gray-800 border-b pb-2">Essentials / Neutrals</h3>

                                    <div className="space-y-3">

                                        {palette.neutrals?.map((color: any, idx: number) => (

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

                                        {palette.pastels?.map((color: any, idx: number) => (

                                            <div key={idx} className="flex flex-col items-center w-20">

                                                <div className="w-16 h-16 rounded-full shadow-sm border border-gray-100 mb-2" style={{backgroundColor: color.hex}}></div>

                                                <p className="text-[10px] text-center text-gray-500 leading-tight">{color.name}</p>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

    

                {/* 4. Beauty & Style (Magazine Layout) */}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    

                    {/* Makeup - Left Column */}

                    <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-[#E8E1D9]">

                        <h3 className="font-serif text-3xl font-bold mb-8 flex items-center gap-3">

                            <span className="text-4xl">💄</span> Makeup Lab

                        </h3>

                        

                        <div className="bg-[#FFFBF7] p-6 rounded-xl border border-primary/10 mb-8">
                            <p className="text-lg text-[#1A1A2E] font-medium leading-relaxed italic">
                                &quot;{makeup_recommendations?.summary}&quot;
                            </p>
                        </div>

    

                        <div className="space-y-6">

                            {makeup_recommendations?.specific_products?.map((prod: any, i: number) => (

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

    

                    {/* Styling - Right Column */}

                    <div className="lg:col-span-5 space-y-8">

                        

                        {/* Metal Card */}

                        <div className="bg-[#1A1A2E] text-white p-8 rounded-[2rem] shadow-lg relative overflow-hidden">

                            <div className="relative z-10">

                                <h3 className="font-serif text-2xl font-bold mb-4">Best Metals</h3>

                                <div className="flex flex-wrap gap-3">

                                    {styling?.metals?.map((m: string, i: number) => (

                                        <span key={i} className="px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-sm font-medium">

                                            {m}

                                        </span>

                                    ))}

                                </div>

                            </div>

                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/20 rounded-full blur-2xl"></div>

                        </div>

    

                        {/* Keywords Card */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E8E1D9]">
                            <h3 className="font-serif text-2xl font-bold mb-6">Style Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {styling?.keywords?.map((k: string, i: number) => (
                                    <span key={i} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-colors cursor-default">
                                        #{k}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

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
        </>
      )
    }