'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { useCommonContext } from '~/context/common-context';

export default function PageComponent({
  locale,
  colorLabText,
}: {
  locale: string;
  colorLabText: any;
}) {

  return (
    <>
      <Header locale={locale} page={'home'} />
      <main className="flex min-h-screen flex-col items-center">
         
         {/* Hero Section */}
         <section className="relative w-full overflow-hidden bg-background">
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-light rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent-sage/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 sm:py-32 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-light/50 text-primary text-sm font-semibold tracking-wide mb-6">
                        ✨ #1 AI Color Analysis Tool
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-text-primary leading-tight mb-6">
                       {colorLabText.Landing.h1}
                    </h1>
                    <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-10 max-w-2xl">
                       {colorLabText.Landing.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Link
                            href={getLinkHref(locale, 'analysis')}
                            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-primary-hover transition-all transform hover:-translate-y-1"
                        >
                            {colorLabText.Landing.uploadBtn}
                        </Link>
                        <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-text-primary border border-gray-200 hover:bg-gray-50 transition-all">
                            Learn More
                        </a>
                    </div>
                    <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-sm text-text-secondary">
                        <div className="flex -space-x-2">
                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt=""/>
                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt=""/>
                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64" alt=""/>
                        </div>
                        <p>Trusted by 350k+ beauties</p>
                    </div>
                </div>
                
                {/* Hero Image / Visual */}
                <div className="flex-1 relative">
                    <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
                        <img 
                            src="/seasonal_color_analysis.jpg" 
                            alt="Seasonal Color Analysis" 
                            className="w-full h-auto object-cover" 
                        />
                    </div>
                </div>
            </div>
         </section>

         {/* Logos */}
         <section className="w-full py-10 bg-white border-b border-gray-100">
             <div className="max-w-7xl mx-auto px-6 text-center">
                 <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-6">As seen in</p>
                 <div className="flex justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                     <span className="text-xl font-serif font-bold">VOGUE</span>
                     <span className="text-xl font-serif font-bold">ELLE</span>
                     <span className="text-xl font-serif font-bold">InStyle</span>
                     <span className="text-xl font-serif font-bold">COSMOPOLITAN</span>
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
                "name": "Free AI Color Analysis Quiz",
                "url": "https://coloranalysisquiz.app",
                "applicationCategory": "LifestyleApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
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
                  "name": "Is this color analysis quiz free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, our AI color analysis quiz is completely free to start. You can upload your photo and get your seasonal results instantly."
                  }
                }, {
                  "@type": "Question",
                  "name": "How accurate is AI color analysis?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our AI is trained on professional color theory and thousands of verified seasonal profiles, making it highly accurate and objective compared to human bias."
                  }
                }, {
                  "@type": "Question",
                  "name": "Do I need to sign up?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can take the quiz without signing up. We only ask for login if you wish to save your detailed report for future reference."
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
      