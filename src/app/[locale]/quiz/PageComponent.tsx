'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { useRouter } from 'next/navigation';
import { getLinkHref } from '~/configs/buildLink';
import Webcam from "react-webcam";

// Helper for SHA-256 Hash
const computeSHA256 = async (file: File | Blob): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

type QuizData = {
  gender?: string;
  goal?: string;
  skinType?: string;
  sunReaction?: string;
  eyeColor?: string;
  hairColor?: string;
  veins?: string;
  jewelry?: string;
  lipstickMatch?: string;
  neutralPreference?: string;
  contrast?: string;
  ageRange?: string;
  struggleMatch?: string;
  timeSpent?: string;
  image?: string;
  sessionId?: string;
};

export default function QuizPageComponent({ locale }: { locale: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<QuizData>({});
  const [isUploading, setIsUploading] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const totalSteps = 16;

  const handleAnswer = (key: keyof QuizData, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setStep(prev => prev + 1);
  };

  const processFile = async (file: File | Blob) => {
      setIsUploading(true);
      try {
          const sessionRes = await fetch('/api/color-lab/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ utm_source: 'quiz' })
          });
          const { sessionId } = await sessionRes.json();
          if (!sessionId) throw new Error("Failed to create session");

          const imageHash = await computeSHA256(file);
          
          const uploadFile = file instanceof File ? file : new File([file], "webcam_capture.jpg", { type: "image/jpeg" });

          const uploadRes = await fetch('/api/color-lab/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: uploadFile.name, contentType: uploadFile.type, sessionId, imageHash })
          });
          const uploadData = await uploadRes.json();

          let publicUrl = uploadData.publicUrl;
          if (!uploadData.duplicate && !uploadData.reused && uploadData.uploadUrl) {
              const putRes = await fetch(uploadData.uploadUrl, { method: 'PUT', headers: { 'Content-Type': uploadFile.type }, body: uploadFile });
              if (!putRes.ok) throw new Error("Failed to upload image");
          }

          await fetch('/api/color-lab/session/quiz', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, quizData: answers })
          });

          setAnswers(prev => ({ ...prev, image: publicUrl, sessionId: sessionId }));
          setStep(prev => prev + 1);
      } catch (err) { 
          console.error(err); alert("Upload failed. Please try again."); 
      } finally { setIsUploading(false); setIsCameraOpen(false); }
  };

  const capture = useCallback(() => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
          fetch(imageSrc)
              .then(res => res.blob())
              .then(blob => processFile(blob));
      }
  }, [webcamRef]);

  const ANALYSIS_STAGES = [
    "Initializing Munsell Color Engine...",
    "Scanning 124,000 skin pixel coordinates...",
    "Analyzing eye-to-hair contrast ratios...",
    "Determining hemoglobin vs. carotene balance...",
    "Cross-referencing with 16-season chromatic models...",
    "Mapping optimal textile reflectance...",
    "Synthesizing your personalized style manifesto...",
    "Preparing your comprehensive report..."
  ];

  useEffect(() => {
    if (step > totalSteps && answers.image) {
      const interval = setInterval(() => {
        setAnalysisStage(prev => {
          if (prev < ANALYSIS_STAGES.length - 1) return prev + 1;
          clearInterval(interval);
          setTimeout(() => {
             router.push(getLinkHref(locale, `quiz/paywall/${answers.sessionId}`));
          }, 1500);
          return prev;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [step, answers.image, locale, answers.sessionId]);

  const renderStep = () => {
    switch(step) {
      case 1: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 01</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold italic leading-[1.1]">Let&apos;s start with <br/>your identity.</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { id: 'Woman', label: 'Woman', img: '/quiz/identity_woman.jpg' },
              { id: 'Man', label: 'Man', img: '/quiz/identity_man.jpg' }
            ].map(opt => (
              <button key={opt.id} onClick={() => handleAnswer('gender', opt.id)} className="group space-y-4">
                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden shadow-xl group-hover:scale-105 transition-transform border-[6px] border-white relative">
                  <img src={opt.img} className="w-full h-full object-cover" alt={opt.label} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <span className="block font-bold text-sm uppercase tracking-widest text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 02</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">What is your primary <br/>goal?</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {answers.gender === 'Man' ? (
                [
                  { id: 'professional', label: 'Professional', desc: 'Look authoritative', img: '/quiz/goal_pro.jpg', position: 'object-top' },
                  { id: 'wardrobe', label: 'Wardrobe', desc: 'Shop smarter', img: '/quiz/goal_wardrobe.jpg', position: 'object-center' },
                  { id: 'dating', label: 'Dating/Social', desc: 'Look my best', img: '/quiz/goal_makeup.jpg', position: 'object-center' },
                  { id: 'glow', label: 'Radiance', desc: 'Stop looking tired', img: '/quiz/goal_glow.jpg', position: 'object-[center_20%]' }
                ].map(opt => (
                  <button key={opt.id} onClick={() => handleAnswer('goal', opt.id)} className="group relative overflow-hidden rounded-[2rem] aspect-square shadow-md border-4 border-white hover:shadow-2xl hover:scale-105 transition-all text-left flex flex-col justify-end p-4 md:p-6">
                    <img src={opt.img} className={`absolute inset-0 w-full h-full object-cover ${opt.position} group-hover:scale-110 transition-transform duration-700`} alt={opt.label} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="relative z-10">
                      <span className="block font-serif italic text-white text-xl md:text-2xl">{opt.label}</span>
                      <span className="block text-white/80 text-[9px] md:text-xs uppercase tracking-widest mt-1">{opt.desc}</span>
                    </div>
                  </button>
                ))
            ) : (
                [
                  { id: 'professional', label: 'Professional', desc: 'Look authoritative', img: '/quiz/goal_pro.jpg', position: 'object-top' },
                  { id: 'wardrobe', label: 'Wardrobe', desc: 'Shop smarter', img: '/quiz/goal_wardrobe.jpg', position: 'object-center' },
                  { id: 'makeup', label: 'Makeup', desc: 'Perfect shades', img: '/quiz/goal_makeup.jpg', position: 'object-center' },
                  { id: 'glow', label: 'Radiance', desc: 'Stop looking tired', img: '/quiz/goal_glow.jpg', position: 'object-[center_20%]' }
                ].map(opt => (
                  <button key={opt.id} onClick={() => handleAnswer('goal', opt.id)} className="group relative overflow-hidden rounded-[2rem] aspect-square shadow-md border-4 border-white hover:shadow-2xl hover:scale-105 transition-all text-left flex flex-col justify-end p-4 md:p-6">
                    <img src={opt.img} className={`absolute inset-0 w-full h-full object-cover ${opt.position} group-hover:scale-110 transition-transform duration-700`} alt={opt.label} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="relative z-10">
                      <span className="block font-serif italic text-white text-xl md:text-2xl">{opt.label}</span>
                      <span className="block text-white/80 text-[9px] md:text-xs uppercase tracking-widest mt-1">{opt.desc}</span>
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 03</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">Your skin tone is...</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'fair', label: 'Porcelain / Fair', img: '/quiz/skin_fair.jpg' },
              { id: 'light', label: 'Light / Beige', img: '/quiz/skin_light.jpg' },
              { id: 'medium', label: 'Medium / Tan', img: '/quiz/skin_medium.jpg' },
              { id: 'deep', label: 'Rich / Deep', img: '/quiz/skin_deep.jpg' }
            ].map(opt => (
              <button key={opt.id} onClick={() => handleAnswer('skinType', opt.id)} className="group space-y-3">
                <div className="aspect-square rounded-[2rem] overflow-hidden shadow-lg group-hover:scale-105 transition-transform border-[4px] border-white relative">
                  <img src={opt.img} className="w-full h-full object-cover" alt={opt.label} />
                </div>
                <span className="block font-bold text-[10px] md:text-xs uppercase tracking-widest text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 04</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">In the sun, you...</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md border-4 border-white relative">
               <img src="/quiz/sun_burn.jpg" className="w-full h-full object-cover object-top" alt="Burn" />
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md border-4 border-white relative">
               <img src="/quiz/sun_tan.jpg" className="w-full h-full object-cover object-top" alt="Tan" />
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { id: 'burn', label: 'Burn quickly, never tan' },
              { id: 'burn_then_tan', label: 'Burn first, then tan slowly' },
              { id: 'tan', label: 'Tan easily, rarely burn' },
              { id: 'darken', label: 'Skin darkens without burning' }
            ].map(opt => (
              <button key={opt.id} onClick={() => handleAnswer('sunReaction', opt.id)} className="p-5 md:p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-[#2D2D2D] hover:shadow-md text-left font-medium transition-all">{opt.label}</button>
            ))}
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 05</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">Your natural eye color?</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'cool_blue', label: 'Icy Blue / Grey', img: '/quiz/eye_blue.jpg' },
              { id: 'warm_green', label: 'Warm Green / Hazel', img: '/quiz/eye_green.jpg' },
              { id: 'deep_brown', label: 'Deep Black / Brown', img: '/quiz/eye_brown.jpg' },
              { id: 'amber', label: 'Golden Amber / Honey', img: '/quiz/eye_amber.jpg' }
            ].map(opt => (
              <button key={opt.id} onClick={() => handleAnswer('eyeColor', opt.id)} className="group space-y-3">
                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg group-hover:scale-105 transition-transform border-[4px] border-white relative">
                  <img src={opt.img} className="w-full h-full object-cover" alt={opt.label} />
                </div>
                <span className="block font-bold text-[10px] uppercase tracking-widest text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
      case 6: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 06</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">Natural hair color?</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'ash', label: 'Ashy Blonde', img: '/quiz/hair_blonde.jpg' },
              { id: 'golden', label: 'Golden Brown', img: '/quiz/hair_brown.jpg' },
              { id: 'red', label: 'Copper / Red', img: '/quiz/hair_red.jpg' },
              { id: 'black', label: 'Jet Black', img: '/quiz/hair_black.jpg' }
            ].map(opt => (
              <button key={opt.id} onClick={() => handleAnswer('hairColor', opt.id)} className="group space-y-3">
                <div className="aspect-square rounded-[2rem] overflow-hidden shadow-lg group-hover:scale-105 transition-transform border-[4px] border-white relative">
                  <img src={opt.img} className="w-full h-full object-cover object-top" alt={opt.label} />
                </div>
                <span className="block font-bold text-[10px] uppercase tracking-widest text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 07</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic">Gold or Silver?</h2>
            <p className="text-gray-400 italic">Which metal makes your complexion look healthier?</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <button onClick={() => handleAnswer('jewelry', 'gold')} className="group space-y-6">
              <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl group-hover:scale-105 transition-transform border-[8px] border-white relative">
                 <img src="/quiz/gold.jpg" className="w-full h-full object-cover" alt="Gold" />
                 <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="block font-black text-[10px] uppercase tracking-widest">Gold (Warm)</span>
            </button>
            <button onClick={() => handleAnswer('jewelry', 'silver')} className="group space-y-6">
              <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl group-hover:scale-105 transition-transform border-[8px] border-white relative">
                 <img src="/quiz/silver.jpg" className="w-full h-full object-cover" alt="Silver" />
                 <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="block font-black text-[10px] uppercase tracking-widest">Silver (Cool)</span>
            </button>
          </div>
        </div>
      );
      case 8: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 08</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">Your wrist veins are...</h2>
          </div>
          <div className="relative rounded-[2.5rem] overflow-hidden mb-8 h-48 md:h-64 shadow-xl border-4 border-white">
             <img src="/quiz/veins.jpg" className="w-full h-full object-cover" alt="Veins" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                <span className="text-white text-xs uppercase tracking-widest font-bold">Check under natural light</span>
             </div>
          </div>
          <div className="grid gap-3">
            {['Blue or Purple (Cool)', 'Green or Olive (Warm)', 'Blue-Green (Neutral)'].map(opt => (
              <button key={opt} onClick={() => handleAnswer('veins', opt)} className="p-5 md:p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-[#2D2D2D] hover:shadow-md text-left font-medium transition-all">{opt}</button>
            ))}
          </div>
        </div>
      );
      case 9: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 09</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">
              {answers.gender === 'Man' ? 'Go-to Shirt Color?' : 'Lipstick choice?'}
            </h2>
            <p className="text-gray-400 italic text-center">
              {answers.gender === 'Man' ? 'Which shade do you feel most confident wearing?' : 'Which shade usually receives more compliments?'}
            </p>
          </div>
          {answers.gender === 'Man' ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'navy_blue', label: 'Navy Blue', img: '/quiz/shirt_navy.jpg' },
                  { id: 'white_grey', label: 'Pure White', img: '/quiz/shirt_white.jpg' },
                  { id: 'olive_khaki', label: 'Olive Green', img: '/quiz/shirt_olive.jpg' },
                  { id: 'black', label: 'Solid Black', img: '/quiz/shirt_black.jpg' }
                ].map(opt => (
                  <button key={opt.id} onClick={() => handleAnswer('lipstickMatch', opt.id)} className="group space-y-3">
                    <div className="aspect-square rounded-[2rem] overflow-hidden shadow-lg group-hover:scale-105 transition-transform border-[4px] border-white relative">
                      <img src={opt.img} className="w-full h-full object-cover object-top" alt={opt.label} />
                    </div>
                    <span className="block font-bold text-[10px] md:text-xs uppercase tracking-widest text-center">{opt.label}</span>
                  </button>
                ))}
              </div>
          ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'fuchsia', label: 'Fuchsia / Berry', img: '/quiz/lip_fuchsia.jpg' },
                  { id: 'coral', label: 'Coral / Peach', img: '/quiz/lip_coral.jpg' },
                  { id: 'brick', label: 'Brick / Earthy', img: '/quiz/lip_brick.jpg' },
                  { id: 'nude', label: 'Pale Nude', img: '/quiz/lip_nude.jpg' }
                ].map(opt => (
                  <button key={opt.id} onClick={() => handleAnswer('lipstickMatch', opt.id)} className="group space-y-3">
                    <div className="aspect-square rounded-[2rem] overflow-hidden shadow-lg group-hover:scale-105 transition-transform border-[4px] border-white relative">
                      <img src={opt.img} className="w-full h-full object-cover object-top" alt={opt.label} />
                    </div>
                    <span className="block font-bold text-[10px] md:text-xs uppercase tracking-widest text-center">{opt.label}</span>
                  </button>
                ))}
              </div>
          )}
        </div>
      );
      case 10: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 10</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">Neutral preference?</h2>
            <p className="text-gray-400 italic text-center">Which basics dominate your wardrobe?</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'black_white', label: 'True Black & White', img: '/quiz/neutral_bw.jpg' },
              { id: 'brown_cream', label: 'Earthy Brown & Cream', img: '/quiz/neutral_brown.jpg' }
            ].map(opt => (
              <button key={opt.id} onClick={() => handleAnswer('neutralPreference', opt.id)} className="group space-y-3">
                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden shadow-lg group-hover:scale-105 transition-transform border-[4px] border-white relative">
                  <img src={opt.img} className="w-full h-full object-cover" alt={opt.label} />
                </div>
                <span className="block font-bold text-[10px] md:text-xs uppercase tracking-widest text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
      case 11: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 11</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">Visual Contrast</h2>
            <p className="text-gray-400 italic text-center">Observe your face in a mirror.</p>
          </div>
          <div className="grid gap-4">
            {[
              { id: 'high', label: 'High', desc: 'Eyes/Hair pop against skin' },
              { id: 'medium', label: 'Medium', desc: 'Balanced features' },
              { id: 'low', label: 'Low', desc: 'Soft, blended look' }
            ].map(opt => (
              <button key={opt.id} onClick={() => handleAnswer('contrast', opt.id)} className="p-6 md:p-8 bg-white border border-gray-100 rounded-[2rem] hover:border-[#2D2D2D] hover:shadow-md text-left transition-all">
                <span className="block font-serif italic text-2xl mb-1">{opt.label}</span>
                <span className="block text-gray-400 text-xs uppercase tracking-widest">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      );
      case 12: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 12</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic">Age range?</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['Under 20', '20-30', '30-45', '45+'].map(opt => (
              <button key={opt} onClick={() => handleAnswer('ageRange', opt)} className="py-8 px-4 bg-white border border-gray-100 rounded-[2rem] hover:border-[#2D2D2D] hover:shadow-md font-black text-sm tracking-widest uppercase transition-all">{opt}</button>
            ))}
          </div>
        </div>
      );
      case 13: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 13</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">Do you struggle with finding colors that match your skin tone?</h2>
          </div>
          <div className="grid gap-3">
            {[
              { id: 'yes_often', label: 'Yes, often. I usually buy the wrong shades.' },
              { id: 'sometimes', label: 'Sometimes, it\'s hit or miss.' },
              { id: 'no_rarely', label: 'Rarely, I know what works.' }
            ].map(opt => (
              <button key={opt.id} onClick={() => handleAnswer('struggleMatch', opt.id)} className="p-6 md:p-8 bg-white border border-gray-100 rounded-[2rem] hover:border-[#2D2D2D] hover:shadow-md text-left font-medium transition-all">{opt.label}</button>
            ))}
          </div>
        </div>
      );
      case 14: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Diagnostic 14</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight text-center">How much time do you spend choosing outfits in the morning?</h2>
          </div>
          <div className="grid gap-3">
            {[
              { id: 'too_much', label: 'Way too much. I stare at my closet.' },
              { id: 'average', label: 'A reasonable amount.' },
              { id: 'quick', label: 'I just grab and go.' }
            ].map(opt => (
              <button key={opt.id} onClick={() => handleAnswer('timeSpent', opt.id)} className="p-6 md:p-8 bg-white border border-gray-100 rounded-[2rem] hover:border-[#2D2D2D] hover:shadow-md text-left font-medium transition-all">{opt.label}</button>
            ))}
          </div>
        </div>
      );
      case 15: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#C5A059] uppercase italic">Step 15 / {totalSteps}</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight">Ready for Calibration</h2>
            <p className="text-gray-400 italic max-w-sm mx-auto">We&apos;ve gathered your trait data. Now we need to sync it with your facial pixel coordinates.</p>
          </div>
          <div className="relative rounded-[2.5rem] overflow-hidden mb-8 h-48 md:h-64 shadow-xl border-4 border-white">
             <img src="/quiz/struggle_bg.jpg" className="w-full h-full object-cover grayscale opacity-40" alt="Ready" />
             <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={() => setStep(step + 1)} className="px-12 py-5 bg-[#2D2D2D] text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all">Start Face Scan</button>
             </div>
          </div>
        </div>
      );
      case 16: {
        const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        };

        return (
          <div className="space-y-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
              <span className="text-[10px] font-black tracking-[0.3em] text-[#E88D8D] uppercase italic">Phase 03: Final Calibration</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold italic leading-tight">Sync Face Pixel Data</h2>
              <p className="text-gray-400 italic max-w-sm mx-auto">Capturing skin reflectance and pigment density for the final 16-season mapping.</p>
            </div>
            
            <div className="relative max-w-sm mx-auto group">
              <div className="flex flex-col items-center justify-center aspect-[3/4] bg-white border-2 border-dashed border-gray-200 rounded-[4rem] transition-all overflow-hidden group-hover:shadow-[0_60px_100px_-20px_rgba(232,141,141,0.15)] relative p-8">
                
                {isCameraOpen ? (
                    <div className="absolute inset-0 bg-black z-20 flex flex-col">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 px-6">
                            <button onClick={() => setIsCameraOpen(false)} className="px-6 py-4 bg-white/20 backdrop-blur-md text-white rounded-full font-bold text-xs hover:bg-white/40 transition-all">Cancel</button>
                            <button onClick={capture} className="px-8 py-4 bg-white text-[#2D2D2D] rounded-full font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Snap Photo</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <img src="/quiz/face_scan_bg.jpg" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" alt="Scan Hint" />
                        
                        {isUploading ? (
                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <div className="w-16 h-16 border-2 border-gray-100 border-t-[#E88D8D] rounded-full animate-spin"></div>
                            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#E88D8D]">Extracting Chromatic Data...</span>
                        </div>
                        ) : (
                        <div className="relative z-10 w-full flex flex-col gap-4">
                            {/* Take Photo Option (Opens Webcam) */}
                            <button onClick={() => setIsCameraOpen(true)} className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl cursor-pointer hover:bg-white hover:shadow-xl transition-all w-full border border-gray-100 group/btn">
                                <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#E88D8D] shadow-inner shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <span className="font-black text-xs uppercase tracking-[0.2em] text-[#2D2D2D] group-hover/btn:text-[#E88D8D] transition-colors text-left leading-tight">Take Photo</span>
                            </button>

                            {/* Upload File Option */}
                            <label className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl cursor-pointer hover:bg-white hover:shadow-xl transition-all w-full border border-gray-100 group/btn">
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#E88D8D] shadow-inner shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </div>
                                <span className="font-black text-xs uppercase tracking-[0.2em] text-[#2D2D2D] group-hover/btn:text-[#E88D8D] transition-colors text-left leading-tight">Upload File</span>
                            </label>

                            <div className="text-center mt-6">
                            <p className="text-[9px] text-[#2D2D2D] font-bold px-4 leading-relaxed uppercase tracking-widest bg-white/50 backdrop-blur-sm rounded-xl py-2 shadow-sm inline-block">No makeup • natural lighting • looking forward</p>
                            </div>
                        </div>
                        )}
                    </>
                )}
              </div>
            </div>
          </div>
        );
      }
      default: return (
        <div className="space-y-20 text-center py-20">
          <div className="relative w-64 h-64 mx-auto">
            <div className="absolute inset-0 border-[1px] border-[#E88D8D]/10 rounded-full scale-150 animate-ping"></div>
            <div className="absolute inset-0 border-4 border-gray-50 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#E88D8D] rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-8 rounded-full overflow-hidden grayscale opacity-20 shadow-inner ring-1 ring-white/50">
              <img src={answers.image} className="w-full h-full object-cover scale-110" alt="Processing" />
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-serif italic text-[#2D2D2D] transition-all duration-1000 min-h-[1.5em]">
                {ANALYSIS_STAGES[analysisStage]}
              </h2>
              <p className="font-mono text-[9px] text-[#C5A059] uppercase tracking-[0.5em]">Synchronizing Trait Matrix</p>
            </div>
            <div className="flex justify-center gap-2">
              {ANALYSIS_STAGES.map((_, i) => (
                <div key={i} className={`h-0.5 rounded-full transition-all duration-1000 ${i <= analysisStage ? 'w-10 bg-[#E88D8D]' : 'w-2 bg-gray-100'}`}></div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D2D2D] flex flex-col font-sans overflow-hidden">
      <Header locale={locale} page="quiz" />
      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] select-none pointer-events-none">
            <h1 className="text-[45vw] font-serif font-black italic">MUSE</h1>
        </div>
        <div className="w-full max-w-2xl relative z-10">
          {step <= totalSteps && (
            <div>
              <div className="flex justify-between items-end mb-6">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-300 italic">Diagnostic Progress</span>
                <span className="font-serif italic text-3xl text-[#E88D8D]">{Math.round((step / totalSteps) * 100)}%</span>
              </div>
              <div className="h-px bg-gray-100 w-full relative">
                <div className="absolute h-px bg-[#E88D8D] transition-all duration-1000 shadow-[0_0_15px_rgba(232,141,141,0.5)]" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
              </div>
            </div>
          )}
          <div className="min-h-[550px] flex flex-col justify-center">
            {renderStep()}
          </div>
        </div>
      </main>
      <Footer locale={locale} page="quiz" />
    </div>
  );
}
