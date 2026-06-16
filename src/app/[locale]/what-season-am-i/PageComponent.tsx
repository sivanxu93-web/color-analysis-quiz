'use client'
import { useState } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import Image from 'next/image';

const QUESTIONS = [
  {
    id: 1,
    question: "1. The Undertone Test: How does your skin react to direct sun?",
    options: [
      { text: "I burn easily, turn red, and rarely tan", value: "cool" },
      { text: "I tan easily, rarely burn, and golden up quickly", value: "warm" },
      { text: "I burn first, but it turns into a nice tan later", value: "neutral" }
    ]
  },
  {
    id: 2,
    question: "2. The Metal Test: Which jewelry color makes your skin look healthier?",
    options: [
      { text: "Cool Silver or Platinum - makes me look clear and awake", value: "cool" },
      { text: "Warm Yellow Gold - gives me an instant healthy glow", value: "warm" },
      { text: "Both look equally great on me", value: "neutral" }
    ]
  },
  {
    id: 3,
    question: "3. The Fabric Contrast Test: Stark White vs. Ivory Cream?",
    options: [
      { text: "Stark pure white looks clean; cream washes me out", value: "cool" },
      { text: "Cream/ivory makes me glow; stark white looks harsh", value: "warm" },
      { text: "Both look okay, but I prefer muted heather grey", value: "neutral" }
    ]
  },
  {
    id: 4,
    question: "4. Contrast Level: Describe the natural contrast in your features",
    options: [
      { text: "High contrast (e.g., very dark eyes/hair + fair skin)", value: "bright" },
      { text: "Low contrast (e.g., overall sandy blonde, soft eyes, light skin)", value: "muted" },
      { text: "Medium contrast (balanced brown hair/eyes and golden skin)", value: "medium" }
    ]
  }
];

export default function PageComponent({ locale }: { locale: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const handleSelectOption = (val: string) => {
    const updatedAnswers = [...answers, val];
    setAnswers(updatedAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate Result
      calculateResult(updatedAnswers);
    }
  };

  const calculateResult = (finalAnswers: string[]) => {
    let coolCount = 0;
    let warmCount = 0;
    let neutralCount = 0;
    let contrast = "medium";

    finalAnswers.forEach((ans, index) => {
      if (index < 3) {
        if (ans === "cool") coolCount++;
        else if (ans === "warm") warmCount++;
        else neutralCount++;
      } else {
        contrast = ans; // The 4th question is contrast
      }
    });

    let season = "";
    if (coolCount > warmCount) {
      season = contrast === "bright" ? "True/Deep Winter" : "Soft/Light Summer";
    } else if (warmCount > coolCount) {
      season = contrast === "bright" ? "Bright Spring" : "True/Soft Autumn";
    } else {
      // Neutral leanings
      if (contrast === "bright") {
        season = "Bright Spring / Clear Winter (Neutral-Cool/Warm)";
      } else if (contrast === "muted") {
        season = "Soft Summer / Soft Autumn (Neutral Muted)";
      } else {
        season = "True Spring / True Summer (Neutral Balance)";
      }
    }

    setResult(season);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fff8f5] text-[#2D2926] font-sans">
      <Header locale={locale} page="what-season-am-i" />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-gray-100">
            <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-[#C07A60]/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
                <span className="font-mono text-[10px] md:text-xs font-black text-[#C5A059] uppercase tracking-[0.3em] bg-[#C5A059]/10 px-4 py-1.5 rounded-full">
                    The Ultimate Color Guide
                </span>
                <h1 className="text-5xl md:text-[5.5rem] font-serif font-bold italic leading-tight tracking-tighter text-[#2D2926]">
                    What Season Am I?
                </h1>
                <p className="text-lg md:text-xl text-gray-500 font-serif italic max-w-2xl mx-auto leading-relaxed">
                    Stop guessing your color palette. Our studio-grade AI extracts your precise facial Hex color codes to map your season with 99.8% stylist accuracy.
                </p>
                <div className="pt-8 space-y-4">
                    <Link 
                        href={getLinkHref(locale, 'analysis')}
                        className="inline-block px-12 py-5 bg-[#2D2D2D] text-white rounded-full font-black text-xs md:text-sm uppercase tracking-[0.3em] shadow-[0_20px_40px_-15px_rgba(45,45,45,0.4)] hover:shadow-[0_30px_60px_-15px_rgba(45,45,45,0.6)] hover:-translate-y-1 transition-all active:scale-95"
                    >
                        Start Professional AI Scan
                    </Link>
                    <div className="flex justify-center items-center gap-4 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                        <span>Takes 90 seconds</span>
                        <span>•</span>
                        <span>Munsell Color Science</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            100% Private & Secure
                        </span>
                    </div>
                </div>
            </div>
        </section>

        {/* Interactive Self-Test Section */}
        <section className="py-20 bg-white border-b border-gray-50">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12 space-y-4">
              <span className="font-mono text-[10px] font-black text-[#C07A60] uppercase tracking-[0.3em]">Quick Evaluation</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold italic text-[#2D2926]">
                Don&apos;t want to upload a photo? Take the Quick 60-Second Self-Test
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Answer 4 simple draping questions to see which seasonal color family you likely belong to.
              </p>
            </div>

            <div className="bg-[#fff8f5] border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden min-h-[350px] flex flex-col justify-between">
              
              {!result ? (
                <>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200/60 rounded-full h-1.5 mb-8">
                    <div 
                      className="bg-[#C07A60] h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-[#2D2926] leading-relaxed">
                      {QUESTIONS[currentStep].question}
                    </h3>

                    <div className="grid grid-cols-1 gap-4 pt-4">
                      {QUESTIONS[currentStep].options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(opt.value)}
                          className="w-full text-left p-5 bg-white border border-gray-200/60 rounded-2xl hover:border-[#C07A60] hover:bg-[#C07A60]/5 transition-all text-sm md:text-base font-medium text-gray-700 hover:text-[#2D2926] shadow-sm transform hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center text-xs text-gray-400 font-mono">
                    <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
                    <span>No personal data collected</span>
                  </div>
                </>
              ) : (
                <div className="space-y-8 py-4 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C07A60]/15 text-[#C07A60] rounded-full mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <div className="space-y-3">
                    <span className="text-xs font-mono uppercase tracking-widest text-gray-400">Your Preliminary Season Matches</span>
                    <h3 className="text-3xl md:text-4xl font-serif font-bold italic text-[#2D2926]">
                      {result}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                      Based on your answers, you lean towards the {result.includes("Winter") || result.includes("Summer") ? "Cool" : "Warm"} color family. However, human eyes are easily tricked by bad bathroom lighting.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link 
                      href={getLinkHref(locale, 'analysis')}
                      className="px-8 py-4 bg-[#2D2926] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#2D2D2D] hover:scale-105 transition-all shadow-md w-full sm:w-auto"
                    >
                      Verify with 99.8% AI Precision Scan
                    </Link>
                    <button 
                      onClick={resetQuiz}
                      className="px-8 py-4 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-100 text-gray-600 w-full sm:w-auto"
                    >
                      Retake Test
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* The 4 Main Seasons at a Glance */}
        <section className="py-24 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-[#2D2926]">The 4 Main Seasons at a Glance</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Which of these four primary categories aligns best with your natural features?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Spring */}
                    <div className="bg-[#fff8f5] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-serif font-bold italic text-[#2D2926]">Spring</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#C07A60] mt-1">Warm & Bright</p>
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
                    <div className="bg-[#fff8f5] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-serif font-bold italic text-[#2D2926]">Summer</h3>
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
                    <div className="bg-[#fff8f5] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-serif font-bold italic text-[#2D2926]">Autumn</h3>
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
                    <div className="bg-[#fff8f5] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-serif font-bold italic text-[#2D2926]">Winter</h3>
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
        <section className="py-24 bg-[#2D2926] text-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold italic">The 12-Season Matrix</h2>
                    <p className="text-white/60 max-w-2xl mx-auto">The 4 seasons are too broad. Professional color analysis uses 12 specific sub-categories for pinpoint accuracy.</p>
                </div>
                
                <div className="overflow-x-auto pb-8">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-[#C07A60]">Sub-Season</th>
                                <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-[#C07A60]">Primary Trait</th>
                                <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-[#C07A60]">Secondary Trait</th>
                                <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-[#C07A60]">Avoid</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">Light Spring</td><td className="p-4">Light (Value)</td><td className="p-4">Warm (Hue)</td><td className="p-4 text-white/50">Dark, heavy colors (Black, Burgundy)</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">True Spring</td><td className="p-4">Warm (Hue)</td><td className="p-4">Clear (Chroma)</td><td className="p-4 text-white/50">Muted, dusty cool tones (Dusty Mauve)</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">Bright Spring</td><td className="p-4">Clear (Chroma)</td><td className="p-4">Warm (Hue)</td><td className="p-4 text-white/50">Soft, dusty, gray-based shades</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">Light Summer</td><td className="p-4">Light (Value)</td><td className="p-4">Cool (Hue)</td><td className="p-4 text-white/50">Warm, earthy colors (Mustard, Rust)</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">True Summer</td><td className="p-4">Cool (Hue)</td><td className="p-4">Soft (Chroma)</td><td className="p-4 text-white/50">Bright, highly saturated warm tones (Orange)</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">Soft Summer</td><td className="p-4">Soft (Chroma)</td><td className="p-4">Cool (Hue)</td><td className="p-4 text-white/50">Saturated bright primaries and stark black/white</td>
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
                                <td className="p-4 py-6 font-serif italic text-lg">Deep Winter</td><td className="p-4">Deep (Value)</td><td className="p-4">Cool (Hue)</td><td className="p-4 text-white/50">Warm, golden earthy tones (Camel)</td>
                            </tr>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">True Winter</td><td className="p-4">Cool (Hue)</td><td className="p-4">Clear (Chroma)</td><td className="p-4 text-white/50">Muted, dusty warm tones (Golden Brown)</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="p-4 py-6 font-serif italic text-lg">Bright Winter</td><td className="p-4">Clear (Chroma)</td><td className="p-4">Cool (Hue)</td><td className="p-4 text-white/50">Warm, earthy, muted autumn tones (Mustard, Rust)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        {/* How Our AI Determines Your Season */}
        <section className="py-24 bg-[#fff8f5]">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <span className="font-mono text-[10px] font-black text-[#C5A059] uppercase tracking-[0.3em]">The Science</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-[#2D2926]">How AI Solves the &quot;What Season Am I&quot; Problem</h2>
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

        {/* AI Precision vs. In-Person Consultant (Value Match) */}
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <span className="font-mono text-[10px] font-black text-[#C5A059] uppercase tracking-[0.3em]">Value Comparison</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-[#2D2926]">Studio Analysis vs. Professional AI Scan</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Why thousands of style-conscious clients are switching from physical consultants to pixel-level algorithms.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* In-Person */}
                    <div className="bg-[#fff8f5] p-8 md:p-12 rounded-[2.5rem] border border-gray-100 space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-200/60 pb-6">
                            <h3 className="text-2xl font-serif font-bold italic text-[#2D2926]">Physical Consultation</h3>
                            <span className="text-sm font-mono text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">$300 - $500</span>
                        </div>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <span className="text-red-500 mt-0.5">✕</span>
                                <div><strong>Subjective Bias:</strong> Strongly influenced by the stylist&apos;s personal taste and mood.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-500 mt-0.5">✕</span>
                                <div><strong>Environmental Flaws:</strong> Bathroom or studio lighting alters skin tone readings.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-500 mt-0.5">✕</span>
                                <div><strong>High Friction:</strong> Requires booking weeks in advance and a 2-hour session.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-500 mt-0.5">✕</span>
                                <div><strong>Static Deliverable:</strong> A physical card or pamphlet that is easily lost.</div>
                            </li>
                        </ul>
                    </div>

                    {/* AI Scan */}
                    <div className="bg-[#2D2926] text-white p-8 md:p-12 rounded-[2.5rem] space-y-6 shadow-[0_20px_45px_rgba(26,26,46,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#C07A60]/10 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-6">
                            <h3 className="text-2xl font-serif font-bold italic text-white">Professional AI Scan</h3>
                            <span className="text-sm font-mono text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full">Premium Accuracy</span>
                        </div>
                        <ul className="space-y-4 text-sm text-white/80">
                            <li className="flex items-start gap-3">
                                <span className="text-green-400 mt-0.5">✓</span>
                                <div><strong>100% Objective:</strong> Calibrated against the Munsell system using raw pixel values.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-400 mt-0.5">✓</span>
                                <div><strong>Instant Result:</strong> Complete analysis in 90 seconds from any device.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-400 mt-0.5">✓</span>
                                <div><strong>Dynamic Report:</strong> High-definition wardrobe cards, makeup filters, and lifetime updates.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-400 mt-0.5">✓</span>
                                <div><strong>Continuous Matching:</strong> Lifetime access to the Style Validator for checking clothing.</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* Premium Privacy Protection */}
        <section className="py-24 bg-[#fff8f5] border-t border-gray-100">
            <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2D2926] text-white rounded-full shadow-lg mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold italic text-[#2D2926]">Strict Privacy & Face-Data Protection</h2>
                <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    We understand that your face data is deeply personal. Our system processes your photo locally using ephemeral computer vision APIs. We do not store, distribute, or train AI models with your selfies. Once the 90-second scanning cycle finishes, your original photo is completely purged from our processing memory.
                </p>
                <div className="flex justify-center items-center gap-6 pt-4 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                    <span>GDPR Compliant Processing</span>
                    <span>•</span>
                    <span>Zero Image Retention</span>
                </div>
            </div>
        </section>

        {/* Real Examples */}
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-[#2D2926] mb-12">Real Seasonal Examples</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href={getLinkHref(locale, 'examples/soft-autumn-analysis')} className="px-6 py-3 border border-gray-200 rounded-full text-sm font-bold hover:border-[#C07A60] hover:text-[#C07A60] transition-colors">Soft Autumn</Link>
                    <Link href={getLinkHref(locale, 'examples/true-winter-analysis')} className="px-6 py-3 border border-gray-200 rounded-full text-sm font-bold hover:border-[#C07A60] hover:text-[#C07A60] transition-colors">True Winter</Link>
                    <Link href={getLinkHref(locale, 'examples/warm-spring-analysis')} className="px-6 py-3 border border-gray-200 rounded-full text-sm font-bold hover:border-[#C07A60] hover:text-[#C07A60] transition-colors">Warm Spring</Link>
                    <Link href={getLinkHref(locale, 'examples/light-summer-analysis')} className="px-6 py-3 border border-gray-200 rounded-full text-sm font-bold hover:border-[#C07A60] hover:text-[#C07A60] transition-colors">Light Summer</Link>
                    <Link href={getLinkHref(locale, 'examples')} className="px-6 py-3 bg-[#fff8f5] text-[#2D2926] rounded-full text-sm font-bold hover:bg-gray-100 transition-colors">View All 12 Seasons →</Link>
                </div>
            </div>
        </section>

        {/* FAQs */}
        <section className="py-24 bg-[#2D2926] text-white">
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
            <h2 className="text-4xl md:text-6xl font-serif font-bold italic tracking-tighter text-[#2D2926] mb-10">Stop Asking, Start Knowing.</h2>
            <Link 
                href={getLinkHref(locale, 'analysis')}
                className="inline-block px-12 py-5 bg-[#C07A60] text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-xl hover:bg-[#884C35] hover:scale-105 transition-all active:scale-95"
            >
                Take The Quiz Now
            </Link>
        </section>

      </main>

      <Footer locale={locale} page="what-season-am-i" />
    </div>
  );
}