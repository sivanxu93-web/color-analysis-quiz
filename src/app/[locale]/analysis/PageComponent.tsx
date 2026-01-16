'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLinkHref } from '~/configs/buildLink';
import { useCommonContext } from '~/context/common-context';
import BaseModal from '~/components/BaseModal';

export default function PageComponent({
  locale,
  colorLabText,
}: {
  locale: string;
  colorLabText: any;
}) {
  const { userData, setShowLoginModal, setShowPricingModal } = useCommonContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0); 
  const [sessionData, setSessionData] = useState<{sessionId: string, publicUrl: string} | null>(null);
  
  // Face API State
  const [faceApi, setFaceApi] = useState<any>(null);
  
  // Custom Dialog State
  const [alertState, setAlertState] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      type: 'warning' | 'error' | 'info';
      onConfirm?: () => void;
      confirmText?: string;
      showCancel?: boolean;
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load Face API
  useEffect(() => {
    (async () => {
        try {
            const api = await import('@vladmandic/face-api');
            await api.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
            setFaceApi(api);
        } catch (e) {
            console.error("Failed to load FaceAPI", e);
        }
    })();
  }, []);

  const closeAlert = () => setAlertState(prev => ({ ...prev, isOpen: false }));

  const processFile = (file: File) => {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Face Detection Logic
      if (faceApi) {
          try {
              const img = await faceApi.bufferToImage(file);
              const detections = await faceApi.detectAllFaces(img, new faceApi.TinyFaceDetectorOptions());
              if (!detections || detections.length === 0) {
                  setAlertState({
                      isOpen: true,
                      title: "No Face Detected",
                      message: "We couldn't detect a clear face in this photo. The analysis might fail or be inaccurate. Do you want to continue?",
                      type: 'warning',
                      showCancel: true,
                      confirmText: "Continue Anyway",
                      onConfirm: () => processFile(file)
                  });
                  if (event.target) event.target.value = ''; // Reset input
                  return;
              }
          } catch (e) {
              console.error("Face detection error", e);
          }
      }
      processFile(file);
    }
  };

  const runAnalysis = async (sessionId: string, imageUrl: string, email: string) => {
    setAnalyzing(true);
    setStep(3);

    try {
      const analyzeRes = await fetch('/api/color-lab/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            sessionId: sessionId, 
            imageUrl: imageUrl,
            email: email 
        })
      });

      if (analyzeRes.status === 402) {
          setAlertState({
              isOpen: true,
              title: "Beta Limit Reached",
              message: "You have used your free analysis credit. Stay tuned for the full release!",
              type: 'info',
              showCancel: false,
              confirmText: "Got it"
          });
          setAnalyzing(false);
          setStep(0);
          return;
      }

      if (!analyzeRes.ok) throw new Error("Analysis failed");
      
      const { reportId } = await analyzeRes.json();

      router.push(getLinkHref(locale, `report/${reportId}`));

    } catch (error) {
        console.error(error);
        setAlertState({
            isOpen: true,
            title: "Analysis Failed",
            message: "Something went wrong during the analysis. Please try again.",
            type: 'error',
            showCancel: false
        });
        setAnalyzing(false);
        setStep(0);
    }
  };

  // Step 1: Upload Image & Prepare Session
  const startAnalysis = async () => {
    if (!selectedFile) return;

    if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN !== '0' && !userData?.email) {
        // Save pending session logic could go here if needed, but LoginModal handles it usually?
        // Actually, we moved logic to AFTER upload in previous turns.
        // Let's stick to the latest logic: Upload -> Check Login/Credit -> Analyze
        // But wait, the previous logic had the login check *inside* startAnalysis but *after* upload?
        // Ah, in previous turns I removed the early check. I will keep it removed.
    }

    setAnalyzing(true);
    setStep(1); 

    try {
      // 1. Create Session
      const sessionRes = await fetch('/api/color-lab/session', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const { sessionId } = await sessionRes.json();
      if (!sessionId) throw new Error("Failed to create session");

      // 2. Get Upload URL
      const uploadRes = await fetch('/api/color-lab/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            filename: selectedFile.name,
            contentType: selectedFile.type,
            sessionId
        })
      });
      const { uploadUrl, publicUrl } = await uploadRes.json();
      if (!uploadUrl) throw new Error("Failed to get upload URL");

      setStep(2); 

      // 3. Upload File to R2
      await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type }
      });

      setSessionData({ sessionId, publicUrl });
      
      // LOGIN CHECK - Post Upload (Restored from previous turn logic)
      if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN !== '0' && !userData?.email) {
          localStorage.setItem('color_lab_pending_session', JSON.stringify({ sessionId, publicUrl }));
          setAnalyzing(false); 
          setShowLoginModal(true);
          return;
      }
      
      // 4. Run Analysis Directly
      runAnalysis(sessionId, publicUrl, userData?.email || "");

    } catch (error) {
      console.error(error);
      setAlertState({
          isOpen: true,
          title: "Upload Failed",
          message: "Something went wrong during upload. Please try again.",
          type: 'error',
          showCancel: false
      });
      setAnalyzing(false);
      setStep(0);
    }
  };

  // Resume analysis after login (Restored from previous turn)
  useEffect(() => {
      const storedSession = localStorage.getItem('color_lab_pending_session');
      if (userData?.email && storedSession) {
          try {
              const { sessionId, publicUrl } = JSON.parse(storedSession);
              setPreviewUrl(publicUrl); 
              setAnalyzing(true);
              setStep(3);
              runAnalysis(sessionId, publicUrl, userData.email);
              localStorage.removeItem('color_lab_pending_session');
          } catch (e) {
              console.error("Failed to parse pending session", e);
              localStorage.removeItem('color_lab_pending_session');
          }
      }
  }, [userData?.email]);

  return (
    <>
      <Header locale={locale} page={'analysis'} />
      <main className="flex min-h-screen flex-col items-center py-12 md:py-20 px-4 bg-background relative">
        
        <div className="text-center mb-8 md:mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-text-primary">{colorLabText.Analysis.title}</h1>
            <p className="text-text-secondary max-w-lg mx-auto text-sm md:text-base">
                {colorLabText.Analysis.description}
            </p>
        </div>
        
        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
            {!previewUrl ? (
                <div 
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 md:p-12 text-center cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-all duration-300 group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="mx-auto h-14 w-14 md:h-16 md:w-16 bg-primary-light/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="h-7 w-7 md:h-8 md:w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="mt-2 text-base md:text-lg font-medium text-gray-900">{colorLabText.Analysis.uploadTitle}</p>
                    <p className="mt-1 text-xs md:text-sm text-gray-500">{colorLabText.Analysis.uploadDesc}</p>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden shadow-md">
                    <img src={previewUrl} alt="Preview" className="w-full object-cover aspect-[3/4]" />
                    {!analyzing && (
                        <button 
                            onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                            className="absolute top-3 right-3 bg-white/80 text-gray-800 p-2 rounded-full hover:bg-white transition-colors shadow-sm backdrop-blur-sm"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                    {analyzing && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{colorLabText.Analysis.loadingTitle}</h3>
                            <p className="text-text-secondary animate-pulse">
                                {step === 1 && colorLabText.Analysis.step1}
                                {step === 2 && colorLabText.Analysis.uploading}
                                {step === 3 && colorLabText.Analysis.step3}
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />

            {!analyzing && (
                 <button
                    onClick={startAnalysis}
                    disabled={!selectedFile}
                    className={`mt-6 w-full rounded-full px-6 py-4 text-base font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${!selectedFile ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary-hover'}`}
                 >
                    {colorLabText.Landing.uploadBtn}
                 </button>
            )}
            
            <p className="mt-6 text-xs text-center text-gray-400">
                {colorLabText.Analysis.privacyNote}
            </p>
        </div>

        {/* Custom Alert Dialog */}
        <BaseModal 
            isOpen={alertState.isOpen} 
            onClose={closeAlert}
            title={alertState.title}
            icon={<span className="text-3xl">{alertState.type === 'error' ? '❌' : '⚠️'}</span>}
        >
            <p className="text-gray-500 mb-8">{alertState.message}</p>
            <div className="flex flex-col sm:flex-row gap-3">
                {alertState.onConfirm && (
                    <button 
                        onClick={() => { alertState.onConfirm?.(); closeAlert(); }}
                        className="flex-1 w-full bg-[#1A1A2E] text-white py-3 rounded-full font-bold shadow-md hover:bg-black transition-colors"
                    >
                        {alertState.confirmText || "Continue"}
                    </button>
                )}
                {alertState.showCancel ? (
                    <button 
                        onClick={closeAlert}
                        className="flex-1 w-full bg-white text-gray-600 border border-gray-200 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                ) : (
                    !alertState.onConfirm && (
                        <button 
                            onClick={closeAlert}
                            className="w-full bg-[#1A1A2E] text-white py-3 rounded-full font-bold shadow-md"
                        >
                            Okay
                        </button>
                    )
                )}
            </div>
        </BaseModal>

      </main>
      <Footer locale={locale} page={'analysis'} />
    </>
  )
}