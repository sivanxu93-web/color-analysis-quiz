'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { useCommonContext } from '~/context/common-context';
import { useState, useEffect } from 'react';
import { SEO_EXAMPLES } from '~/libs/examples';

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
         <section className="relative w-full overflow-hidden bg-[#faf9f6]">
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-slate-200 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-32 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left w-full">
                    <span className="inline-block py-1 px-3 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold tracking-wide mb-6">
                        👔 Professional Image Analysis
                    </span>
                    <h1 className="font-serif text-4xl md:text-7xl font-bold text-[#1A1A2E] leading-tight mb-6">
                       {colorLabText.MenLanding.h1}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto md:mx-0">
                       {colorLabText.MenLanding.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full">
                        <Link
                            href={getLinkHref(locale, 'analysis')}
                            className="inline-flex items-center justify-center rounded-full bg-[#1A1A2E] px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-black transition-all transform hover:-translate-y-1 w-full sm:w-auto"
                        >
                            {colorLabText.Landing.uploadBtn}
                        </Link>
                        <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-[#1A1A2E] border border-gray-200 hover:bg-gray-50 transition-all w-full sm:w-auto">
                            Learn More
                        </a>
                    </div>
                    <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500 min-h-[32px]">
                        <div className="flex -space-x-2">
                            {userAvatars.length > 0 ? (
                                userAvatars.slice(0, 3).map((src, i) => (
                                    <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src={src} alt="User avatar"/>
                                ))
                            ) : (
                                <div className="flex -space-x-2 animate-pulse">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 ring-2 ring-white"></div>
                                    <div className="h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white"></div>
                                    <div className="h-8 w-8 rounded-full bg-gray-50 ring-2 ring-white"></div>
                                </div>
                            )}
                        </div>
                        <p>{reportCount > 0 ? `Trusted by ${reportCount.toLocaleString()} stylish men` : 'Trusted by thousands of stylish men'}</p>
                    </div>
                </div>
                
                {/* Hero Image / Visual */}
                <div className="flex-1 relative w-full">
                    <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white grayscale-[20%] hover:grayscale-0 transition-all duration-500">
                        {/* Note: Using the same image for now but with a more masculine border/style */}
                        <img 
                            src="/seasonal_color_analysis.jpg" 
                            alt="Men's AI Color Analysis Quiz - Professional Palette Guide for Males" 
                            className="w-full h-auto object-cover" 
                        />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold text-center p-4 border-4 border-white shadow-xl rotate-12 z-20">
                        AI STYLIST FOR MEN
                    </div>
                </div>
            </div>
         </section>

         {/* Features for Men */}
         <section className="py-24 w-full bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A1A2E] mb-6">
                        {colorLabText.MenLanding.h2}
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        {colorLabText.MenLanding.h2_2}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-[#1A1A2E] text-white rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">💼</div>
                        <h3 className="text-xl font-bold mb-4">{colorLabText.MenLanding.feature1Title}</h3>
                        <p className="text-slate-600 leading-relaxed">{colorLabText.MenLanding.feature1Desc}</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-[#1A1A2E] text-white rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🧔</div>
                        <h3 className="text-xl font-bold mb-4">{colorLabText.MenLanding.feature2Title}</h3>
                        <p className="text-slate-600 leading-relaxed">{colorLabText.MenLanding.feature2Desc}</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-[#1A1A2E] text-white rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🧥</div>
                        <h3 className="text-xl font-bold mb-4">{colorLabText.MenLanding.feature3Title}</h3>
                        <p className="text-slate-600 leading-relaxed">{colorLabText.MenLanding.feature3Desc}</p>
                    </div>
                </div>
            </div>
         </section>

         {/* How It Works */}
         <section id="how-it-works" className="py-24 w-full bg-[#faf9f6]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
               <div className="mx-auto max-w-2xl lg:text-center mb-16">
                  <h2 className="text-3xl font-serif font-bold tracking-tight text-gray-900 sm:text-4xl">
                      {colorLabText.Landing.howItWorks}
                  </h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   <div className="relative flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                        <div className="absolute -top-6 w-12 h-12 bg-slate-800 text-white text-xl font-bold flex items-center justify-center rounded-full shadow-lg">1</div>
                        <div className="mt-6 mb-4 text-5xl">🤳</div>
                        <h3 className="text-xl font-bold mb-2">{colorLabText.Landing.step1}</h3>
                        <p className="text-slate-500">{colorLabText.Landing.step1Desc}</p>
                   </div>
                   <div className="relative flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                        <div className="absolute -top-6 w-12 h-12 bg-slate-800 text-white text-xl font-bold flex items-center justify-center rounded-full shadow-lg">2</div>
                        <div className="mt-6 mb-4 text-5xl">🤖</div>
                        <h3 className="text-xl font-bold mb-2">{colorLabText.Landing.step2}</h3>
                        <p className="text-slate-500">{colorLabText.Landing.step2Desc}</p>
                   </div>
                   <div className="relative flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                        <div className="absolute -top-6 w-12 h-12 bg-slate-800 text-white text-xl font-bold flex items-center justify-center rounded-full shadow-lg">3</div>
                        <div className="mt-6 mb-4 text-5xl">📊</div>
                        <h3 className="text-xl font-bold mb-2">{colorLabText.Landing.step3}</h3>
                        <p className="text-slate-500">{colorLabText.Landing.step3Desc}</p>
                   </div>
               </div>

               <div className="mt-20 text-center">
                    <Link
                        href={getLinkHref(locale, 'analysis')}
                        className="inline-flex items-center justify-center rounded-full bg-[#1A1A2E] px-12 py-5 text-xl font-bold text-white shadow-2xl hover:bg-black transition-all transform hover:-translate-y-1"
                    >
                        {colorLabText.Landing.uploadBtn}
                    </Link>
               </div>
            </div>
         </section>

         <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": colorLabText.MenLanding.h1,
                "description": colorLabText.MenLanding.description,
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app'}/${locale}/men`,
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
