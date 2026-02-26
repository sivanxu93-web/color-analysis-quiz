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
         
         {/* ... (Hero Section remains same) ... */}
         <section className="relative w-full overflow-hidden bg-background">
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-light rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent-sage/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-32 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left w-full">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-light/50 text-primary text-sm font-semibold tracking-wide mb-6">
                        ✨ #1 AI Color Analysis Tool
                    </span>
                    <h1 className="font-serif text-4xl md:text-7xl font-bold text-text-primary leading-tight mb-6">
                       {colorLabText.Landing.h1}
                    </h1>
                    <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto md:mx-0">
                       {colorLabText.Landing.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full">
                        <Link
                            href={getLinkHref(locale, 'analysis')}
                            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-primary-hover transition-all transform hover:-translate-y-1 w-full sm:w-auto"
                        >
                            {colorLabText.Landing.uploadBtn}
                        </Link>
                        <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-text-primary border border-gray-200 hover:bg-gray-50 transition-all w-full sm:w-auto">
                            Learn More
                        </a>
                    </div>
                    <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-sm text-text-secondary">
                        <div className="flex -space-x-2">
                            {userAvatars.length > 0 ? (
                                userAvatars.slice(0, 3).map((src, i) => (
                                    <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src={src} alt="User"/>
                                ))
                            ) : (
                                <>
                                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt=""/>
                                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt=""/>
                                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64" alt=""/>
                                </>
                            )}
                        </div>
                        <p>Trusted by {reportCount.toLocaleString()} beauties</p>
                    </div>
                </div>
                
                {/* Hero Image / Visual */}
                <div className="flex-1 relative w-full">
                    <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
                        <img 
                            src="/seasonal_color_analysis.jpg" 
                            alt="AI Color Analysis Quiz - Seasonal Palette Results" 
                            className="w-full h-auto object-cover" 
                        />
                    </div>
                </div>
            </div>
         </section>

         {/* Featured Reports (SEO Optimized) */}
         <section className="w-full py-20 bg-[#FFFBF7]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-12">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs">Samples</span>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A2E] mt-2 mb-4">See Real Results</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Explore sample analysis reports generated by our AI. See exactly what you get.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SEO_EXAMPLES.slice(0, 4).map((item) => (
                        <Link 
                            key={item.slug} 
                            href={getLinkHref(locale, `examples/${item.slug}`)}
                            className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#E8E1D9] hover:-translate-y-1"
                        >
                            <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                                <img src={item.imageUrl} alt={item.season} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h3 className="text-2xl font-serif font-bold leading-tight">
                                        {item.season}
                                    </h3>
                                    <div className="inline-block mt-2 px-2 py-0.5 border border-white/30 rounded text-[10px] font-bold uppercase tracking-widest bg-black/20 backdrop-blur-sm">
                                        Verified Sample
                                    </div>
                                </div>
                            </div>
                            <div className="p-5">
                                <p className="text-sm text-gray-500 line-clamp-2 italic">
                                    &quot;{item.headline}&quot;
                                </p>
                                <p className="mt-4 text-primary text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                    View Full Report &rarr;
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <Link 
                        href={getLinkHref(locale, 'examples')}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all"
                    >
                        View All Seasonal Examples
                        <span className="text-xl">&rarr;</span>
                    </Link>
                </div>
            </div>
         </section>

         {/* How It Works */}
         <section id="how-it-works" className="py-24 sm:py-32 w-full bg-background-paper">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
               <div className="mx-auto max-w-2xl lg:text-center mb-16">
                  <h2 className="text-3xl font-serif font-bold tracking-tight text-gray-900 sm:text-4xl">
                      {colorLabText.Landing.h2}
                  </h2>
                  <p className="mt-4 text-lg text-text-secondary">
                      {colorLabText.Landing.h2_2}
                  </p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   {/* Step 1 */}
                   <div className="relative flex flex-col items-center text-center p-8 bg-background rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-50">
                        <div className="absolute -top-6 w-12 h-12 bg-primary text-white text-xl font-bold flex items-center justify-center rounded-full shadow-lg">1</div>
                        <div className="mt-6 mb-4 text-5xl">📸</div>
                        <h3 className="text-xl font-serif font-bold mb-2">{colorLabText.Landing.step1}</h3>
                        <p className="text-text-secondary">{colorLabText.Landing.step1Desc}</p>
                   </div>
                   {/* Step 2 */}
                   <div className="relative flex flex-col items-center text-center p-8 bg-background rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-50">
                        <div className="absolute -top-6 w-12 h-12 bg-primary text-white text-xl font-bold flex items-center justify-center rounded-full shadow-lg">2</div>
                        <div className="mt-6 mb-4 text-5xl">✨</div>
                        <h3 className="text-xl font-serif font-bold mb-2">{colorLabText.Landing.step2}</h3>
                        <p className="text-text-secondary">{colorLabText.Landing.step2Desc}</p>
                   </div>
                   {/* Step 3 */}
                   <div className="relative flex flex-col items-center text-center p-8 bg-background rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-50">
                        <div className="absolute -top-6 w-12 h-12 bg-primary text-white text-xl font-bold flex items-center justify-center rounded-full shadow-lg">3</div>
                        <div className="mt-6 mb-4 text-5xl">🎨</div>
                        <h3 className="text-xl font-serif font-bold mb-2">{colorLabText.Landing.step3}</h3>
                        <p className="text-text-secondary">{colorLabText.Landing.step3Desc}</p>
                   </div>
               </div>
            </div>
         </section>

         {/* SEO Content Section */}
         <section className="w-full py-20 bg-white border-t border-gray-100">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-10 text-center">
                    {colorLabText.Landing.seoContent?.title}
                </h2>
                
                <div className="prose prose-lg mx-auto text-text-secondary">
                    <div className="mb-10">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">{colorLabText.Landing.seoContent?.section1Title}</h3>
                        <p>{colorLabText.Landing.seoContent?.section1Body}</p>
                    </div>
                    
                    <div className="mb-10">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">{colorLabText.Landing.seoContent?.section2Title}</h3>
                        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: colorLabText.Landing.seoContent?.section2Body.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">{colorLabText.Landing.seoContent?.section3Title}</h3>
                        <p>{colorLabText.Landing.seoContent?.section3Body}</p>
                    </div>
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
                  "price": "4.90",
                  "priceCurrency": "USD"
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
                  "name": "How does the Color Analysis Quiz work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Simply upload a photo in natural lighting. Our AI analyzes your skin tone, eye color, and hair to determine your seasonal palette and generate a personalized report."
                  }
                }, {
                  "@type": "Question",
                  "name": "How accurate is AI color analysis?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our AI is trained on professional color theory and thousands of verified seasonal profiles, providing an objective and highly accurate assessment compared to human bias."
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
      