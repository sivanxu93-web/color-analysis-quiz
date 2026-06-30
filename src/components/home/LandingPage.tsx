'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { useCommonContext } from '~/context/common-context';
import { useState, useEffect } from 'react';
import { SEO_EXAMPLES } from '~/libs/examples';
import Image from 'next/image';



const BookIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const GalleryIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
  </svg>
);

const ApparelIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4L7.5 6.5L3.5 8L4.5 11.5L7 11V20H17V11L19.5 11.5L20.5 8L16.5 6.5L15 4H9Z M12 4V7" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 000 18c4.97 0 9-4.03 9-9 0-3.33-1.8-6.22-4.5-7.79M12 3c-1.2 0-2.4 1.35-2.4 3s1.2 3 2.4 3 2.4-1.35 2.4-3-1.2-3-2.4-3zM19 12a2 2 0 11-4 0 2 2 0 014 0zM14 17a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const MemoryIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813zM19.07 7.07a1 1 0 11-1.414-1.414 1 1 0 011.414 1.414zm-12-3a1 1 0 11-1.414-1.414 1 1 0 011.414 1.414zm12 12a1 1 0 11-1.414-1.414 1 1 0 011.414 1.414z" />
  </svg>
);

const PaletteLargeIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.072 2.748a15.996 15.996 0 006.292-1.892m0 0c.937-.512 1.832-1.134 2.667-1.85a4.5 4.5 0 00-6.108-6.606c-.716.835-1.338 1.73-1.85 2.668m4.93 5.788l4.49 4.489m0 0a1.5 1.5 0 01-2.122 2.122l-4.49-4.49m7.722-11.662a9 9 0 00-10.97 10.97M15 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

export default function PageComponent({
  locale,
  colorLabText,
}: {
  locale: string;
  colorLabText: any;
}) {
  const [reportCount, setReportCount] = useState(5280);
  const [userAvatars, setUserAvatars] = useState<string[]>([]);

  useEffect(() => {
      // Fetch Stats
      fetch('/api/color-lab/stats')
          .then(res => res.json())
          .then(data => {
              if (data.count && data.count > 5280) setReportCount(data.count);
              if (data.avatars && data.avatars.length > 0) setUserAvatars(data.avatars);
          })
          .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Header locale={locale} page={''} />
      <main className="flex min-h-screen flex-col items-center bg-[#fff8f5] text-[#1e1b18] font-sans antialiased overflow-x-hidden">
         
         {/* Hero Section */}
         <section className="relative w-full pt-12 pb-20 md:pt-20 md:pb-32 px-6 lg:px-20 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D4A5A5]/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#A46751]/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-[1440px] mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6 text-center md:text-left w-full">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-[#D4A5A5]/25 text-[#7b5455] text-xs font-semibold tracking-widest uppercase mb-2 self-center md:self-start">
                        ✨ #1 AI Color Analysis Tool
                    </span>
                    <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-[#1e1b18] leading-[1.15] tracking-tighter">
                       Your True Colors,<br/>Revealed by AI Color Analysis.
                    </h1>
                    <p className="text-base md:text-lg text-[#53433e] leading-relaxed max-w-lg mx-auto md:mx-0 font-sans opacity-95">
                       {colorLabText.Landing.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full pt-2">
                        <Link
                            href={getLinkHref(locale, 'analysis')}
                            className="inline-flex items-center justify-center rounded-full bg-[#A46751] px-8 py-4 text-base font-semibold text-white scale-95 active:scale-90 hover:scale-100 transition-all duration-300 hover:shadow-[0_10px_20px_rgba(192,122,96,0.2)] w-full sm:w-auto font-sans"
                        >
                            {colorLabText.Landing.uploadBtn}
                        </Link>
                        <Link 
                            href={getLinkHref(locale, 'what-season-am-i')} 
                            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-[#1e1b18] border border-white/50 glass-card soft-shadow hover:bg-white/70 transition-all w-full sm:w-auto font-sans"
                        >
                            What Season Am I?
                        </Link>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                        <Link href={getLinkHref(locale, 'blog')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D4A5A5]/15 rounded-full text-xs font-bold text-[#7b5455] hover:bg-[#D4A5A5]/25 transition-all font-sans">
                            <BookIcon /> Style Blog
                        </Link>
                        <Link href={getLinkHref(locale, 'examples')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f5ece7] rounded-full text-xs font-bold text-[#53433e] hover:bg-[#e9e1dc] transition-all font-sans">
                            <GalleryIcon /> 12-Season Gallery
                        </Link>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-center md:justify-start gap-4 text-sm text-[#53433e] font-sans">
                        <div className="flex -space-x-2">
                            {userAvatars.length > 0 ? (
                                userAvatars.slice(0, 3).map((src, i) => (
                                    <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src={src} alt="Color analysis user"/>
                                ))
                            ) : (
                                <>
                                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="Happy color analysis user"/>
                                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="Confident style quiz user"/>
                                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64" alt="Verified analysis user"/>
                                </>
                            )}
                        </div>
                        <p>Trusted by {reportCount.toLocaleString()} beauties</p>
                    </div>
                </div>
                
                {/* Hero Image */}
                <div className="relative w-full aspect-[4/5] md:aspect-auto md:h-[600px] rounded-xl overflow-hidden glass-card soft-shadow">
                    <Image 
                        src="/hero_photo.webp" 
                        alt="AI Color Analysis Quiz - Seasonal Palette Results" 
                        className="w-full h-full object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>
            </div>
         </section>

         {/* Features Section - "The Science of Style" */}
         <section className="w-full py-20 bg-[#fbf2ed]/50 px-6 lg:px-20">
            <div className="max-w-[1440px] mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1e1b18] mb-4">The Science of Seasonal Color Analysis</h2>
                    <p className="text-sm md:text-base text-[#53433e] max-w-2xl mx-auto font-sans opacity-80">Our advanced AI analyzes your unique undertones to curate a wardrobe that illuminates your natural beauty.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="glass-card soft-shadow rounded-2xl p-8 flex flex-col gap-4 items-start bg-white/40">
                        <div className="w-12 h-12 rounded-full bg-[#fdcbcb] text-[#795354] flex items-center justify-center mb-2">
                            <ApparelIcon />
                        </div>
                        <h3 className="font-sans text-lg md:text-xl font-bold text-[#1e1b18]">Virtual Draping</h3>
                        <p className="text-sm text-[#53433e] leading-relaxed">
                            Instantly test hundreds of shades against your complexion digitally. Discover your most flattering tones without stepping into a fitting room.
                        </p>
                    </div>
                    {/* Card 2 */}
                    <div className="glass-card soft-shadow rounded-2xl p-8 flex flex-col gap-4 items-start bg-white/40 mt-0 md:mt-8">
                        <div className="w-12 h-12 rounded-full bg-[#fdcbcb] text-[#795354] flex items-center justify-center mb-2">
                            <PaletteIcon />
                        </div>
                        <h3 className="font-sans text-lg md:text-xl font-bold text-[#1e1b18]">Seasonal Palettes</h3>
                        <p className="text-sm text-[#53433e] leading-relaxed">
                            Find your perfect seasonal match. From True Autumn to Light Spring, we classify your unique contrast levels to build your definitive color profile.
                        </p>
                    </div>
                    {/* Card 3 */}
                    <div className="glass-card soft-shadow rounded-2xl p-8 flex flex-col gap-4 items-start bg-white/40 mt-0 md:mt-16">
                        <div className="w-12 h-12 rounded-full bg-[#fdcbcb] text-[#795354] flex items-center justify-center mb-2">
                            <MemoryIcon />
                        </div>
                        <h3 className="font-sans text-lg md:text-xl font-bold text-[#1e1b18]">Precision Analysis</h3>
                        <p className="text-sm text-[#53433e] leading-relaxed">
                            Powered by millions of data points, our neural network detects micro-variations in melanin and hemoglobin levels for unparalleled accuracy.
                        </p>
                    </div>
                </div>
            </div>
         </section>

         {/* 12-Season Interactive Matrix */}
         <section className="w-full py-20 px-6 lg:px-20 bg-[#fff8f5]">
            <div className="max-w-[1440px] mx-auto">
                <div className="text-center mb-16">
                    <span className="text-[#884c35] font-bold tracking-widest uppercase text-xs font-sans">The 12-Season Matrix</span>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1e1b18] mt-4 mb-4">Discover Your 12-Season Color Palette</h2>
                    <p className="text-[#53433e] text-sm md:text-base max-w-2xl mx-auto font-sans opacity-80">Explore all 12 professional color seasons. Click any palette to see real analysis examples, best colors, and expert styling guides.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {SEO_EXAMPLES.map((item) => (
                        <Link 
                            key={item.slug} 
                            href={getLinkHref(locale, `examples/${item.slug}`)}
                            className="group relative block rounded-[2rem] overflow-hidden glass-card soft-shadow hover:-translate-y-2 transition-all duration-500 aspect-[4/5] p-2.5 bg-white/40"
                        >
                            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                                <Image 
                                    src={item.imageUrl} 
                                    alt={`${item.season} Palette`} 
                                    fill 
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" 
                                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b18]/90 via-[#1e1b18]/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500"></div>
                                
                                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A5A5] mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 font-sans">
                                        {item.category} Family
                                    </span>
                                    <h3 className="text-xl md:text-2xl font-serif font-bold leading-tight drop-shadow-lg">
                                        {item.season}
                                    </h3>
                                    <p className="text-xs text-white/80 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200 uppercase tracking-widest font-sans">
                                        View Full Guide &rarr;
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link 
                        href={getLinkHref(locale, 'analysis')}
                        className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[#A46751] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#884c35] scale-95 hover:scale-100 transition-all shadow-lg hover:shadow-[0_10px_20px_rgba(192,122,96,0.3)] font-sans"
                    >
                        Don&apos;t know your season? Take the AI Quiz
                    </Link>
                </div>
            </div>
         </section>

         {/* Visual Element Section - "Curated For You" */}
         <section className="w-full py-24 px-6 lg:px-20 bg-white/40">
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="w-full md:w-1/2 relative">
                    <div className="aspect-square rounded-full overflow-hidden border-4 border-white glass-card soft-shadow p-2 bg-white/40">
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                            <Image 
                                alt="Color Swatches" 
                                src="/swatches_photo.webp"
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-10 -left-10 w-24 h-24 rounded-2xl bg-[#36807a]/15 backdrop-blur-md animate-pulse"></div>
                    <div className="absolute bottom-10 -right-10 w-32 h-32 rounded-full bg-[#D4A5A5]/20 backdrop-blur-md"></div>
                </div>
                <div className="w-full md:w-1/2 flex flex-col gap-6 text-center md:text-left">
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1e1b18] font-bold">Personalized Style & Colors Curated For You</h2>
                    <p className="text-base md:text-lg text-[#53433e] leading-relaxed font-sans opacity-95">
                        Your personal palette is more than just a list of colors. It&apos;s a cohesive system designed to harmonize with your natural features, simplifying shopping and elevating your daily style.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-2">
                        <span className="px-5 py-2 rounded-full bg-[#D4A5A5]/20 text-[#1e1b18] font-sans text-xs font-semibold tracking-wider uppercase">Dusty Rose</span>
                        <span className="px-5 py-2 rounded-full bg-[#A46751]/20 text-[#1e1b18] font-sans text-xs font-semibold tracking-wider uppercase">Terracotta</span>
                        <span className="px-5 py-2 rounded-full bg-[#f5ece7] text-[#1e1b18] font-sans text-xs font-semibold tracking-wider uppercase">Warm Oat</span>
                    </div>
                </div>
            </div>
         </section>

         {/* How It Works */}
         <section id="how-it-works" className="py-20 w-full bg-[#f5ece7]/30 px-6 lg:px-20">
            <div className="max-w-[1440px] mx-auto">
               <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-[#1e1b18]">
                      {colorLabText.Landing.h2}
                  </h2>
                  <p className="mt-4 text-sm md:text-base text-[#53433e] font-sans opacity-85">
                      {colorLabText.Landing.h2_2}
                  </p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
                    {/* Step 1 */}
                    <div className="relative flex flex-col items-center text-center p-8 bg-white/45 backdrop-blur-md rounded-[2.5rem] glass-card soft-shadow border border-white/50">
                        <div className="absolute -top-6 w-12 h-12 bg-[#A46751] text-white text-base font-bold flex items-center justify-center rounded-full shadow-lg font-sans">1</div>
                        <div className="mt-6 mb-4 text-[#A46751]">
                             <CameraIcon />
                         </div>
                        <h3 className="text-lg font-serif font-bold mb-2 text-[#1e1b18]">{colorLabText.Landing.step1}</h3>
                        <p className="text-[#53433e] font-sans text-sm leading-relaxed">{colorLabText.Landing.step1Desc}</p>
                    </div>
                    {/* Step 2 */}
                    <div className="relative flex flex-col items-center text-center p-8 bg-white/45 backdrop-blur-md rounded-[2.5rem] glass-card soft-shadow border border-white/50 md:mt-8">
                        <div className="absolute -top-6 w-12 h-12 bg-[#A46751] text-white text-base font-bold flex items-center justify-center rounded-full shadow-lg font-sans">2</div>
                        <div className="mt-6 mb-4 text-[#A46751]">
                             <SparklesIcon />
                         </div>
                        <h3 className="text-lg font-serif font-bold mb-2 text-[#1e1b18]">{colorLabText.Landing.step2}</h3>
                        <p className="text-[#53433e] font-sans text-sm leading-relaxed">{colorLabText.Landing.step2Desc}</p>
                    </div>
                    {/* Step 3 */}
                    <div className="relative flex flex-col items-center text-center p-8 bg-white/45 backdrop-blur-md rounded-[2.5rem] glass-card soft-shadow border border-white/50 md:mt-16">
                        <div className="absolute -top-6 w-12 h-12 bg-[#A46751] text-white text-base font-bold flex items-center justify-center rounded-full shadow-lg font-sans">3</div>
                        <div className="mt-6 mb-4 text-[#A46751]">
                             <PaletteLargeIcon />
                         </div>
                        <h3 className="text-lg font-serif font-bold mb-2 text-[#1e1b18]">{colorLabText.Landing.step3}</h3>
                        <p className="text-[#53433e] font-sans text-sm leading-relaxed">{colorLabText.Landing.step3Desc}</p>
                    </div>
               </div>
            </div>
         </section>

         {/* CTA Section */}
         <section className="py-20 w-full bg-[#efe6e2]/50 text-center px-6 lg:px-20">
            <div className="max-w-xl mx-auto flex flex-col gap-6 items-center">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1e1b18]">Ready to Find Your Seasonal Color Palette?</h2>
                <p className="text-sm md:text-base text-[#53433e] font-sans max-w-sm opacity-90">Join thousands who have transformed their wardrobe with AURA AI.</p>
                <Link 
                    href={getLinkHref(locale, 'analysis')}
                    className="bg-[#A46751] text-white px-8 py-4 rounded-full font-sans text-base font-bold scale-95 active:scale-90 transition-transform hover:shadow-[0_10px_20px_rgba(192,122,96,0.2)] mt-2"
                >
                    Start Your Analysis
                </Link>
            </div>
         </section>

         {/* SEO Content Section */}
         <section className="w-full py-20 bg-white border-t border-gray-100 px-6 lg:px-20">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-10 text-center">
                    {colorLabText.Landing.seoContent?.title}
                </h2>
                
                <div className="prose prose-lg mx-auto text-text-secondary max-w-none">
                    <div className="mb-10">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">{colorLabText.Landing.seoContent?.section1Title}</h3>
                        <SimpleMarkdown className="markdown-body" text={colorLabText.Landing.seoContent?.section1Body} />
                    </div>
                    
                    <div className="mb-10">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">{colorLabText.Landing.seoContent?.section2Title}</h3>
                        <SimpleMarkdown className="markdown-body" text={colorLabText.Landing.seoContent?.section2Body} />
                    </div>

                    <div className="mb-10">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">{colorLabText.Landing.seoContent?.section3Title}</h3>
                        <SimpleMarkdown className="markdown-body" text={colorLabText.Landing.seoContent?.section3Body} />
                    </div>

                    {colorLabText.Landing.seoContent?.section4Title && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{colorLabText.Landing.seoContent?.section4Title}</h3>
                            <SimpleMarkdown className="markdown-body" text={colorLabText.Landing.seoContent?.section4Body} />
                        </div>
                    )}
                </div>
            </div>
         </section>

         <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "AI Color Analysis Quiz",
                "url": "https://coloranalysisquiz.app",
                "applicationCategory": "LifestyleApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "5.90",
                  "priceCurrency": "USD"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "reviewCount": "13628",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              })
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [{
                  "@type": "Question",
                  "name": "How much does an AI color analysis cost?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "While traditional in-person color analysis can cost up to $300, our professional AI color analysis provides a comprehensive 30-page digital style guide, including your exact 12-season palette and virtual draping, for a small fraction of the cost."
                  }
                }, {
                  "@type": "Question",
                  "name": "How accurate is an AI color analysis quiz?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our AI is trained on the Munsell color system and thousands of professional draping sessions. By extracting the exact hex pixel codes from your uploaded color analysis test photo, the AI bypasses subjective human bias, making it highly objective and accurate compared to traditional styling."
                  }
                }, {
                  "@type": "Question",
                  "name": "Is the analysis free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can start the quiz and upload your photo for free analysis. Unlocking the full professional report with virtual draping and detailed color palettes requires a small one-time fee."
                  }
                }]
              })
            }}
          />
      </main>
      <Footer locale={locale} page={'home'} />
    </>
  )
}

function SimpleMarkdown({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  const paragraphs = text.split('\n');
  return (
    <div className={className}>
      {paragraphs.map((p, index) => {
        if (!p.trim()) return null;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
        let match;
        while ((match = regex.exec(p)) !== null) {
          const matchIndex = match.index;
          const matchText = match[0];
          if (matchIndex > lastIndex) {
            parts.push(p.slice(lastIndex, matchIndex));
          }
          if (matchText.startsWith('**') && matchText.endsWith('**')) {
            parts.push(<strong key={matchIndex}>{matchText.slice(2, -2)}</strong>);
          } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
            parts.push(<em key={matchIndex}>{matchText.slice(1, -1)}</em>);
          }
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < p.length) {
          parts.push(p.slice(lastIndex));
        }
        return (
          <p key={index} className="mb-4 text-[#53433e] leading-relaxed">
            {parts.length > 0 ? parts : p}
          </p>
        );
      })}
    </div>
  );
}


      