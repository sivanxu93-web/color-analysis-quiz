'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import Image from 'next/image';

export default function PageComponent({ locale }: { locale: string }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#2D2D2D] font-sans">
      <Header locale={locale} page="what-season-am-i" />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-gray-100">
            <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-[#E88D8D]/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
                <span className="font-mono text-[10px] md:text-xs font-black text-[#C5A059] uppercase tracking-[0.3em] bg-[#C5A059]/10 px-4 py-1.5 rounded-full">
                    The Ultimate Color Guide
                </span>
                <h1 className="text-5xl md:text-[5.5rem] font-serif font-bold italic leading-tight tracking-tighter text-[#1A1A2E]">
                    What Season Am I?
                </h1>
                <p className="text-lg md:text-xl text-gray-500 font-serif italic max-w-2xl mx-auto leading-relaxed">
                    Stop guessing your color palette. Discover if you are a Spring, Summer, Autumn, or Winter in seconds using medical-grade AI vision.
                </p>
                <div className="pt-8">
                    <Link 
                        href={getLinkHref(locale, 'analysis')}
                        className="inline-block px-12 py-5 bg-[#2D2D2D] text-white rounded-full font-black text-xs md:text-sm uppercase tracking-[0.3em] shadow-[0_20px_40px_-15px_rgba(45,45,45,0.4)] hover:shadow-[0_30px_60px_-15px_rgba(45,45,45,0.6)] hover:-translate-y-1 transition-all active:scale-95"
                    >
                        Start Free AI Scan
                    </Link>
                    <p className="mt-4 text-[10px] text-gray-400 font-mono uppercase tracking-widest">Takes 90 seconds • Instant Results</p>
                </div>
            </div>
        </section>

        {/* The 4 Main Seasons at a Glance */}
        <section className="py-24 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-[#1A1A2E]">The 4 Main Seasons at a Glance</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Which of these four primary categories aligns best with your natural features?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Spring */}
                    <div className="bg-[#FAF9F6] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-serif font-bold italic text-[#1A1A2E]">Spring</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#E88D8D] mt-1">Warm & Bright</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-green-400 opacity-80"></div>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 mb-6">
                            <li className="flex gap-2"><span>•</span> <strong>Undertone:</strong> Warm (Golden/Peachy)</li>
                            <li className="flex gap-2"><span>•</span> <strong>Contrast:</strong> Medium to High</li>
                            <li className="flex gap-2"><span>•</span> <strong>Best Colors:</strong> Coral, Turquoise, Golden Yellow</li>
                        </ul>
                    </div>

                    {/* Summer */}
                    <div className="bg-[#FAF9F6] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-serif font-bold italic text-[#1A1A2E]">Summer</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#C5A059] mt-1">Cool & Soft</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-pink-300 opacity-80"></div>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 mb-6">
                            <li className="flex gap-2"><span>•</span> <strong>Undertone:</strong> Cool (Pink/Blueish)</li>
                            <li className="flex gap-2"><span>•</span> <strong>Contrast:</strong> Low to Medium</li>
                            <li className="flex gap-2"><span>•</span> <strong>Best Colors:</strong> Dusty Rose, Slate Blue, Lavender</li>
                        </ul>
                    </div>

                    {/* Autumn */}
                    <div className="bg-[#FAF9F6] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-serif font-bold italic text-[#1A1A2E]">Autumn</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mt-1">Warm & Soft</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-yellow-600 opacity-80"></div>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 mb-6">
                            <li className="flex gap-2"><span>•</span> <strong>Undertone:</strong> Warm (Golden/Earthy)</li>
                            <li className="flex gap-2"><span>•</span> <strong>Contrast:</strong> Low to Medium</li>
                            <li className="flex gap-2"><span>•</span> <strong>Best Colors:</strong> Rust, Olive Green, Mustard</li>
                        </ul>
                    </div>

                    {/* Winter */}
                    <div className="bg-[#FAF9F6] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-serif font-bold italic text-[#1A1A2E]">Winter</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-800 mt-1">Cool & Bright</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-800 to-purple-800 opacity-80"></div>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 mb-6">
                            <li className="flex gap-2"><span>•</span> <strong>Undertone:</strong> Cool (Blue/Icy)</li>
                            <li className="flex gap-2"><span>•</span> <strong>Contrast:</strong> High</li>
                            <li className="flex gap-2"><span>•</span> <strong>Best Colors:</strong> Pure Black, Ruby Red, Emerald</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* The Full 12-Season Breakdown */}
        <section className="py-24 bg-[#1A1A2E] text-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold italic">The 12-Season Matrix</h2>
                    <p className="text-white/60 max-w-2xl mx-auto">The 4 seasons are too broad. Professional color analysis uses 12 specific sub-categories for pinpoint accuracy.</p>
                </div>
                
                <div className="overflow-x-auto pb-8">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-[#E88D8D]">Sub-Season</th>
                                <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-[#E88D8D]">Primary Trait</th>
                                <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-[#E88D8D]">Secondary Trait</th>
                                <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-[#E88D8D]">Avoid</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">Light Spring</td><td className="p-4">Light (Value)</td><td className="p-4">Warm (Hue)</td><td className="p-4 text-white/50">Dark, heavy colors (Black, Burgundy)</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">True Spring</td><td className="p-4">Warm (Hue)</td><td className="p-4">Clear (Chroma)</td><td className="p-4 text-white/50">Muted, dusty cool tones</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">Light Summer</td><td className="p-4">Light (Value)</td><td className="p-4">Cool (Hue)</td><td className="p-4 text-white/50">Warm, earthy colors (Mustard, Rust)</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">True Summer</td><td className="p-4">Cool (Hue)</td><td className="p-4">Soft (Chroma)</td><td className="p-4 text-white/50">Bright, highly saturated warm tones</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">Soft Autumn</td><td className="p-4">Soft (Chroma)</td><td className="p-4">Warm (Hue)</td><td className="p-4 text-white/50">Stark black and pure white</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">True Autumn</td><td className="p-4">Warm (Hue)</td><td className="p-4">Soft (Chroma)</td><td className="p-4 text-white/50">Icy pastels and bright fuchsia</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">Deep Autumn</td><td className="p-4">Deep (Value)</td><td className="p-4">Warm (Hue)</td><td className="p-4 text-white/50">Light, cool pastels (Baby blue)</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">Deep Winter</td><td className="p-4">Deep (Value)</td><td className="p-4">Cool (Hue)</td><td className="p-4 text-white/50">Warm, golden earthy tones</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">True Winter</td><td className="p-4">Cool (Hue)</td><td className="p-4">Clear (Chroma)</td><td className="p-4 text-white/50">Muted, dusty warm tones (Camel)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        {/* How Our AI Determines Your Season */}
        <section className="py-24 bg-[#FAF9F6]">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <span className="font-mono text-[10px] font-black text-[#C5A059] uppercase tracking-[0.3em]">The Science</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-[#1A1A2E]">How AI Solves the &quot;What Season Am I&quot; Problem</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-4 text-center shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto font-bold text-xl mb-6">1</div>
                        <h3 className="font-bold text-lg">Pixel Extraction</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Our AI isolates the hexadecimal color codes of your skin, hair, and eyes, bypassing human bias and bad lighting.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-4 text-center shadow-sm">
                        <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto font-bold text-xl mb-6">2</div>
                        <h3 className="font-bold text-lg">Contrast Mapping</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">It calculates the delta (difference) in lightness between your features to determine your exact contrast ratio.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-4 text-center shadow-sm">
                        <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto font-bold text-xl mb-6">3</div>
                        <h3 className="font-bold text-lg">Munsell Alignment</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Finally, it plots your data against the Munsell color system to precisely categorize you into 1 of the 12 sub-seasons.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Real Examples */}
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-[#1A1A2E] mb-12">Real Seasonal Examples</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href={getLinkHref(locale, 'examples/soft-autumn-analysis')} className="px-6 py-3 border border-gray-200 rounded-full text-sm font-bold hover:border-[#E88D8D] hover:text-[#E88D8D] transition-colors">Soft Autumn</Link>
                    <Link href={getLinkHref(locale, 'examples/true-winter-analysis')} className="px-6 py-3 border border-gray-200 rounded-full text-sm font-bold hover:border-[#E88D8D] hover:text-[#E88D8D] transition-colors">True Winter</Link>
                    <Link href={getLinkHref(locale, 'examples/warm-spring-analysis')} className="px-6 py-3 border border-gray-200 rounded-full text-sm font-bold hover:border-[#E88D8D] hover:text-[#E88D8D] transition-colors">Warm Spring</Link>
                    <Link href={getLinkHref(locale, 'examples/light-summer-analysis')} className="px-6 py-3 border border-gray-200 rounded-full text-sm font-bold hover:border-[#E88D8D] hover:text-[#E88D8D] transition-colors">Light Summer</Link>
                    <Link href={getLinkHref(locale, 'examples')} className="px-6 py-3 bg-[#FAF9F6] text-[#2D2D2D] rounded-full text-sm font-bold hover:bg-gray-100 transition-colors">View All 12 Seasons →</Link>
                </div>
            </div>
        </section>

        {/* FAQs */}
        <section className="py-24 bg-[#1A1A2E] text-white">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold italic">F.A.Q</h2>
                </div>
                <div className="space-y-8">
                    <div className="border-b border-white/10 pb-8">
                        <h3 className="text-xl font-bold mb-3">Can my season change if I get a tan?</h3>
                        <p className="text-white/60 leading-relaxed">No. Your season is determined by your genetic undertone and natural contrast levels. A tan may deepen your overtone, but it does not change your core season (e.g., a Soft Summer remains a Soft Summer even with a tan).</p>
                    </div>
                    <div className="border-b border-white/10 pb-8">
                        <h3 className="text-xl font-bold mb-3">What if I dye my hair?</h3>
                        <p className="text-white/60 leading-relaxed">Dyeing your hair can throw off your natural harmony if the dye color belongs to a different season. This is why our AI requires you to state your natural hair color during the quiz to ensure accurate analysis.</p>
                    </div>
                    <div className="pb-8">
                        <h3 className="text-xl font-bold mb-3">Is the AI better than a human consultant?</h3>
                        <p className="text-white/60 leading-relaxed">AI is objective. It doesn&apos;t get tricked by yellow lighting in your bathroom or subjective preferences. While human consultants offer a great in-person experience, AI provides mathematical precision for a fraction of the cost.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 bg-white text-center px-6">
            <h2 className="text-4xl md:text-6xl font-serif font-bold italic tracking-tighter text-[#1A1A2E] mb-10">Stop Asking, Start Knowing.</h2>
            <Link 
                href={getLinkHref(locale, 'analysis')}
                className="inline-block px-12 py-5 bg-[#E88D8D] text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-xl hover:bg-[#D67474] hover:scale-105 transition-all active:scale-95"
            >
                Take The Quiz Now
            </Link>
        </section>

      </main>

      <Footer locale={locale} page="what-season-am-i" />
    </div>
  );
}