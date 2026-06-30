'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLinkHref } from '~/configs/buildLink';
import { useCommonContext } from '~/context/common-context';
import BaseModal from '~/components/BaseModal';
import { sendGAEvent } from '@next/third-parties/google';
import Script from 'next/script';

// Helper for image compression and HEIC conversion
const compressImage = async (file: File): Promise<{ blob: Blob, width: number, height: number }> => {
    let sourceBlob: Blob | File = file;

    // Handle HEIC/HEIF files
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
        try {
            const heic2any = (await import('heic2any')).default;
            const converted = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
            });
            // heic2any can return Blob or Blob[], we expect single Blob
            sourceBlob = Array.isArray(converted) ? converted[0] : converted;
        } catch (e) {
            console.error("HEIC conversion failed:", e);
            throw new Error("Could not process HEIC image");
        }
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(sourceBlob);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context missing'));

            const MAX_SIZE = 1500;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) resolve({ blob, width, height });
                else reject(new Error('Compression failed'));
            }, 'image/jpeg', 0.85); // 85% quality JPEG
        };
        img.onerror = (e) => reject(e);
    });
};

// Helper for SHA-256 Hash
const computeSHA256 = async (file: File | Blob): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

export default function PageComponent({
  locale,
  colorLabText,
}: {
  locale: string;
  colorLabText: any;
}) {
  const { userData } = useCommonContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0); 
  const [sessionData, setSessionData] = useState<{sessionId: string, publicUrl: string} | null>(null);
  
  // Face API State
  const [faceApi, setFaceApi] = useState<any>(null);
  const [isCheckingFace, setIsCheckingFace] = useState(false);
  
  // Custom Dialog State
  const [alertState, setAlertState] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      type: 'warning' | 'error' | 'info';
      onConfirm?: () => void;
      confirmText?: string;
      showCancel?: boolean;
      onCancel?: () => void;
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
      try {
          setIsCheckingFace(true);
          
          // Convert/Compress first to ensure browser compatibility (HEIC -> JPEG)
          const { blob, width, height } = await compressImage(file);
          const previewUrl = URL.createObjectURL(blob);
          
          // Update Preview immediately
          setPreviewUrl(previewUrl);
          // Store the processed file so we don't need to re-convert in startAnalysis
          // We cast Blob to File for compatibility with state, adding a name property
          const processedFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
          setSelectedFile(processedFile);

          // 2. Run Face Detection Async
          if (faceApi) {
              // Use setTimeout to yield to the main thread so UI renders the preview first
              setTimeout(async () => {
                  try {
                      // Resize for faster detection (Max 600px) - using the already compressed/resized blob
                      const img = new Image();
                      img.src = previewUrl;
                      await new Promise((resolve) => { img.onload = resolve; });

                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                          const MAX_DETECTION_SIZE = 600;
                          let dWidth = img.width;
                          let dHeight = img.height;
                          
                          if (dWidth > dHeight) {
                              if (dWidth > MAX_DETECTION_SIZE) {
                                  dHeight *= MAX_DETECTION_SIZE / dWidth;
                                  dWidth = MAX_DETECTION_SIZE;
                              }
                          } else {
                              if (dHeight > MAX_DETECTION_SIZE) {
                                  dWidth *= MAX_DETECTION_SIZE / dHeight;
                                  dHeight = MAX_DETECTION_SIZE;
                              }
                          }
                          
                          canvas.width = dWidth;
                          canvas.height = dHeight;
                          ctx.drawImage(img, 0, 0, dWidth, dHeight);

                          // Detect on the resized canvas
                          const detections = await faceApi.detectAllFaces(canvas, new faceApi.TinyFaceDetectorOptions());

                          if (!detections || detections.length === 0) {
                              setAlertState({
                                  isOpen: true,
                                  title: "No Face Detected",
                                  message: "We couldn't detect a clear face in this photo. The analysis might fail or be inaccurate. Do you want to continue?",
                                  type: 'warning',
                                  showCancel: true,
                                  confirmText: "Continue Anyway",
                                  onConfirm: () => { /* Already processed */ },
                                  onCancel: () => {
                                      setSelectedFile(null);
                                      setPreviewUrl(null);
                                      if (fileInputRef.current) fileInputRef.current.value = '';
                                  }
                              });
                          }
                      }
                  } catch (e) {
                      console.error("Face detection error", e);
                  } finally {
                      setIsCheckingFace(false);
                  }
              }, 100);
          } else {
              setIsCheckingFace(false);
          }
      } catch (e) {
          console.error("Image processing failed", e);
          setAlertState({
              isOpen: true,
              title: "Image Error",
              message: "Could not process this image. Please try a standard JPG or PNG.",
              type: 'error',
              showCancel: false
          });
          setIsCheckingFace(false);
      } finally {
          // Reset input value to allow selecting the same file again
          event.target.value = '';
      }
    }
  };

    // Step 1: Upload Image & Redirect to Report Page (Draft Mode)
    const startAnalysis = async () => {
      if (!selectedFile) return;
  
      sendGAEvent('event', 'start_upload', { method: 'upload' });
      setAnalyzing(true);
      setStep(1); 
  
      try {
        // 0. Compress Image
        let uploadBody: Blob | File = selectedFile;
        let uploadContentType = selectedFile.type;
        let uploadFilename = selectedFile.name;
  
        try {
            const compressed = await compressImage(selectedFile);
            uploadBody = compressed.blob;
            uploadContentType = 'image/jpeg';
            uploadFilename = selectedFile.name.replace(/\.[^/.]+$/, "") + ".jpg";
        } catch (e) {
            console.warn("Compression skipped:", e);
        }
  
        // Compute Hash for Deduplication
        const imageHash = await computeSHA256(uploadBody);
        const utmSource = typeof window !== 'undefined' ? localStorage.getItem('utm_source') : null;
  
        // 1. Create Session
        const sessionRes = await fetch('/api/color-lab/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ utm_source: utmSource })
        });
        const { sessionId } = await sessionRes.json();
        if (!sessionId) throw new Error("Failed to create session");
  
        // 2. Get Upload URL (or Check Duplicate)
        const uploadRes = await fetch('/api/color-lab/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              filename: uploadFilename,
              contentType: uploadContentType,
              sessionId,
              imageHash // Send hash to check for duplicates
          })
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.duplicate || uploadData.reused) {
            // HIT! Skip upload but still redirect to fresh analysis
            console.log("Image duplicate/reuse found, skipping R2 upload.");
            setSessionData({ sessionId, publicUrl: uploadData.publicUrl });
            router.push(getLinkHref(locale, `report/${sessionId}`));
            return;
        }
  
        const { uploadUrl, publicUrl } = uploadData;
        if (!uploadUrl) throw new Error("Failed to get upload URL");
  
        setStep(2); 
  
        // 3. Upload File to R2 (Only if not duplicate)
        await fetch(uploadUrl, {
          method: 'PUT',
          body: uploadBody,
          headers: { 'Content-Type': uploadContentType }
        });
  
        setSessionData({ sessionId, publicUrl });
        
        // 4. Redirect Immediately to Report Page
        router.push(getLinkHref(locale, `report/${sessionId}`));
  
      } catch (error) {
        console.error(error);
        setAlertState({
            isOpen: true,
            title: "Upload Failed",
            message: "Could not upload your photo. Please try again.",
            type: 'error',
            showCancel: false,
            confirmText: "Okay"
        });
        setAnalyzing(false);
        setStep(0);
      }
    };
  return (
    <>
      <Script id="material-symbols-loader" strategy="afterInteractive">
        {`
          (function() {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
            document.head.appendChild(link);
          })();
        `}
      </Script>
      <Header locale={locale} page={'analysis'} />
      <main className="flex min-h-screen flex-col items-center py-12 md:py-20 px-4 bg-[#fff8f5] relative">
        <style dangerouslySetInnerHTML={{ __html: `
          .iridescent-border {
              position: relative;
              background: rgba(255, 255, 255, 0.45);
              border-radius: 24px;
              z-index: 1;
          }
          .iridescent-border::before {
              content: "";
              position: absolute;
              inset: -2px;
              border-radius: 26px;
              background: linear-gradient(135deg, rgba(212, 165, 165, 0.4), rgba(192, 122, 96, 0.2), rgba(139, 211, 205, 0.3), rgba(212, 165, 165, 0.4));
              z-index: -1;
              filter: blur(2px);
          }
        `}} />
        
        <div className="text-center mb-8 md:mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-[#1e1b18]">
                <span>{colorLabText.Analysis.title}</span>
            </h1>
            <p className="text-[#53433e] max-w-lg mx-auto text-sm md:text-base font-sans">
                <span>{colorLabText.Analysis.description}</span>
            </p>
        </div>
        
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-4">
            {/* Left Column: Upload Dropzone & Action Button */}
            <div className="w-full bg-white/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] glass-card soft-shadow border border-white/50 text-center">
                {!previewUrl ? (
                    <div 
                        className="w-full aspect-[3/4] max-h-[500px] iridescent-border mb-6 group cursor-pointer flex flex-col items-center justify-center p-6 relative overflow-hidden transition-transform duration-300 hover:scale-[1.01]"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {/* Dashed inner border for 'drop' zone feel */}
                        <div className="absolute inset-4 border border-dashed border-[#d8c2bb]/60 rounded-xl pointer-events-none transition-colors duration-300 group-hover:border-[#884c35]/40"></div>
                        <div className="w-16 h-16 rounded-full bg-[#f5ece7]/50 flex items-center justify-center mb-6 backdrop-blur-md group-hover:scale-110 transition-transform">
                            <svg className="h-7 w-7 text-[#884c35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="font-serif text-xl font-bold text-[#1e1b18] mb-2">
                            <span>{colorLabText.Analysis.uploadTitle}</span>
                        </p>
                        <p className="font-sans text-xs text-[#53433e] opacity-70">
                            <span>{colorLabText.Analysis.uploadDesc}</span>
                        </p>
                    </div>
                ) : (
                    <div className="relative rounded-[2rem] overflow-hidden glass-card soft-shadow p-3 mb-6">
                        <div className="relative rounded-[1.5rem] overflow-hidden">
                            <img src={previewUrl} alt="Preview" className="w-full object-cover aspect-[3/4]" />
                        </div>
                        {!analyzing && (
                            <button 
                                type="button"
                                onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                                className="absolute top-6 right-6 z-10 flex items-center justify-center bg-white/80 text-gray-800 p-2 rounded-full hover:bg-white transition-colors shadow-sm backdrop-blur-sm"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        )}
                        {analyzing && (
                            <div className="absolute inset-0 bg-[#fff8f5]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                                <div className="relative w-20 h-20 mb-6 rounded-full overflow-hidden shadow-[0_0_20px_rgba(192,122,96,0.15)] flex items-center justify-center bg-white border border-white/50">
                                    {/* Ambient Aura rotating gradients */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#a46751] via-[#D4A5A5] to-[#fff8f5] opacity-60 filter blur-md animate-spin" style={{ animationDuration: '6s' }} />
                                    <div className="absolute inset-2 bg-gradient-to-bl from-[#D4A5A5] via-[#fff8f5] to-[#a46751] opacity-50 filter blur-sm animate-[spin_8s_linear_infinite_reverse]" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse mix-blend-overlay" />
                                    <div className="absolute inset-2 rounded-full border border-white/20 pointer-events-none z-10" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-[#1e1b18] mb-2">
                                    <span>Uploading...</span>
                                </h3>
                                <p className="text-[#53433e] animate-pulse text-xs font-sans">
                                    <span>Please wait while we secure your photo.</span>
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
                        disabled={!selectedFile || isCheckingFace}
                        className={`w-full rounded-full px-6 py-4 text-base font-semibold text-white transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 ${
                          (!selectedFile || isCheckingFace) 
                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-[#A46751] hover:bg-[#a5644b] hover:shadow-[0_8px_24px_rgba(192,122,96,0.25)]'
                        }`}
                     >
                        <span>{isCheckingFace ? "Checking image..." : colorLabText.Landing.uploadBtn}</span>
                     </button>
                )}

                <p className="mt-6 text-xs text-center text-gray-400 font-sans">
                    <span>{colorLabText.Analysis.privacyNote}</span>
                </p>
            </div>

            {/* Right Column: Photo Guidelines */}
            <div className="w-full bg-white/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] glass-card soft-shadow border border-white/50 text-left">
                <h3 className="font-sans text-xs font-bold tracking-widest uppercase text-[#53433e] mb-6 text-center border-b border-[#d8c2bb]/30 pb-4">
                    Photo Guidelines
                </h3>
                <div className="glass-card rounded-[2rem] p-6 flex flex-col gap-6 border border-white/40 bg-white/30">
                    <div className="w-full h-32 rounded-xl overflow-hidden flex items-center justify-center bg-white/50">
                        <img 
                            alt="Photo guidelines illustrations" 
                            className="w-full h-full object-contain mix-blend-multiply opacity-80" 
                            src="/line_illustrations.jpg" 
                        />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-xl text-[#A46751] mt-0.5">wb_sunny</span>
                            <div>
                                <p className="font-serif text-base font-bold text-[#1e1b18]">Natural Lighting</p>
                                <p className="font-sans text-xs text-[#53433e] opacity-75">Face a window for even, indirect sunlight.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-xl text-[#A46751] mt-0.5">person</span>
                            <div>
                                <p className="font-serif text-base font-bold text-[#1e1b18]">Bare Face</p>
                                <p className="font-sans text-xs text-[#53433e] opacity-75">Remove makeup and glasses for accuracy.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Custom Alert Dialog */}
        <BaseModal 
            isOpen={alertState.isOpen} 
            onClose={closeAlert}
            title={alertState.title}
            icon={<span className="material-symbols-outlined text-3xl text-primary">{alertState.type === 'error' ? 'cancel' : 'warning'}</span>}
        >
            <p className="text-gray-500 mb-8">{alertState.message}</p>
            <div className="flex flex-col sm:flex-row gap-3">
                {alertState.onConfirm && (
                    <button 
                        onClick={() => { alertState.onConfirm?.(); closeAlert(); }}
                        className="flex-1 w-full bg-[#2D2926] text-white py-3 rounded-full font-bold shadow-md hover:bg-black transition-colors"
                    >
                        <span>{alertState.confirmText || "Continue"}</span>
                    </button>
                )}
                {alertState.showCancel ? (
                    <button 
                        onClick={() => { alertState.onCancel?.(); closeAlert(); }}
                        className="flex-1 w-full bg-white text-gray-600 border border-gray-200 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors"
                    >
                        <span>Cancel</span>
                    </button>
                ) : (
                    !alertState.onConfirm && (
                        <button 
                            onClick={closeAlert}
                            className="w-full bg-[#2D2926] text-white py-3 rounded-full font-bold shadow-md"
                        >
                            <span>Okay</span>
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
