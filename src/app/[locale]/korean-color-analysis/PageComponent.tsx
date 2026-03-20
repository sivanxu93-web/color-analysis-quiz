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
         <section className="relative w-full overflow-hidden bg-[#FFFBF7]">
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FFB7B2]/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary-light/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-32 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left w-full">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-light/50 text-primary text-sm font-semibold tracking-wide mb-6">
                        🇰🇷 K-Beauty Standard AI
                    </span>
                    <h1 className="font-serif text-4xl md:text-7xl font-bold text-[#1A1A2E] leading-tight mb-6">
                       {colorLabText.KoreanLanding.h1}
                    </h1>
                    <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto md:mx-0">
                       {colorLabText.KoreanLanding.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full">
                        <Link
                            href={getLinkHref(locale, 'analysis')}
                            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-primary-hover transition-all transform hover:-translate-y-1 w-full sm:w-auto"
                        >
                            {colorLabText.Landing.uploadBtn}
                        </Link>
                        <a href="#features" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-text-primary border border-gray-200 hover:bg-gray-50 transition-all w-full sm:w-auto">
                            How it Works
                        </a>
                    </div>
                    <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-sm text-text-secondary min-h-[32px]">
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
                        <p>{reportCount > 0 ? `Trusted by ${reportCount.toLocaleString()} K-beauty fans` : 'Trusted by thousands of K-beauty fans'}</p>
                    </div>
                </div>
                
                {/* Hero Image / Visual */}
                <div className="flex-1 relative w-full">
                    <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
                        <img 
                            src="/seasonal_color_analysis.jpg" 
                            alt="Korean Personal Color Analysis Quiz - Get your K-idol glow with AI" 
                            className="w-full h-auto object-cover" 
                        />
                    </div>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold text-center p-2 border-4 border-white shadow-xl -rotate-12 z-20">
                        SEOUL TRENDS 2026
                    </div>
                </div>
            </div>
         </section>

         {/* Features for Korean Analysis */}
         <section id="features" className="py-24 w-full bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A1A2E] mb-6">
                        {colorLabText.KoreanLanding.h2}
                    </h2>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                        {colorLabText.KoreanLanding.h2_2}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="p-10 rounded-[2.5rem] bg-[#FFFBF7] border border-[#E8E1D9] hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform relative z-10">✨</div>
                        <h3 className="text-xl font-bold mb-4 relative z-10">{colorLabText.KoreanLanding.feature1Title}</h3>
                        <p className="text-text-secondary leading-relaxed relative z-10">{colorLabText.KoreanLanding.feature1Desc}</p>
                    </div>
                    <div className="p-10 rounded-[2.5rem] bg-[#FFFBF7] border border-[#E8E1D9] hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform relative z-10">📑</div>
                        <h3 className="text-xl font-bold mb-4 relative z-10">{colorLabText.KoreanLanding.feature2Title}</h3>
                        <p className="text-text-secondary leading-relaxed relative z-10">{colorLabText.KoreanLanding.feature2Desc}</p>
                    </div>
                    <div className="p-10 rounded-[2.5rem] bg-[#FFFBF7] border border-[#E8E1D9] hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform relative z-10">💄</div>
                        <h3 className="text-xl font-bold mb-4 relative z-10">{colorLabText.KoreanLanding.feature3Title}</h3>
                        <p className="text-text-secondary leading-relaxed relative z-10">{colorLabText.KoreanLanding.feature3Desc}</p>
                    </div>
                </div>
            </div>
         </section>

         {/* CTA Section */}
         <section className="py-24 w-full bg-background-paper">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A1A2E] mb-8">Ready for Your Tone-Up Reveal?</h2>
                <p className="text-xl text-text-secondary mb-12">Join thousands who have discovered their perfect K-beauty palette.</p>
                <Link
                    href={getLinkHref(locale, 'analysis')}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-12 py-5 text-xl font-bold text-white shadow-2xl hover:bg-primary-hover transition-all transform hover:-translate-y-1"
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
                "name": colorLabText.KoreanLanding.h1,
                "description": colorLabText.KoreanLanding.description,
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app'}/${locale}/korean-color-analysis`,
                "applicationCategory": "LifestyleApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "8.90",
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
