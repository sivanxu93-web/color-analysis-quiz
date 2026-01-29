'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLinkHref } from '~/configs/buildLink';
import { useCommonContext } from '~/context/common-context';
import BaseModal from '~/components/BaseModal';
import { sendGAEvent } from '@next/third-parties/google';

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
            filename: uploadFilename,
            contentType: uploadContentType,
            sessionId
        })
      });
      const { uploadUrl, publicUrl } = await uploadRes.json();
      if (!uploadUrl) throw new Error("Failed to get upload URL");

      setStep(2); 

      // 3. Upload File to R2
      await fetch(uploadUrl, {
        method: 'PUT',
        body: uploadBody,
        headers: { 'Content-Type': uploadContentType }
      });

      // 4. Redirect Immediately to Report Page
      // The backend has already created a 'draft' report during the upload API call
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
      <Header locale={locale} page={'analysis'} />
      <main className="flex min-h-screen flex-col items-center py-12 md:py-20 px-4 bg-background relative">
        
        <div className="text-center mb-8 md:mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-text-primary">
                <span>{colorLabText.Analysis.title}</span>
            </h1>
            <p className="text-text-secondary max-w-lg mx-auto text-sm md:text-base">
                <span>{colorLabText.Analysis.description}</span>
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
                    <p className="mt-2 text-base md:text-lg font-medium text-gray-900">
                        <span>{colorLabText.Analysis.uploadTitle}</span>
                    </p>
                    <p className="mt-1 text-xs md:text-sm text-gray-500">
                        <span>{colorLabText.Analysis.uploadDesc}</span>
                    </p>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden shadow-md">
                    <img src={previewUrl} alt="Preview" className="w-full object-cover aspect-[3/4]" />
                    {!analyzing && (
                        <button 
                            type="button"
                            onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                            className="absolute top-3 right-3 z-10 flex items-center justify-center bg-white/80 text-gray-800 p-2 rounded-full hover:bg-white transition-colors shadow-sm backdrop-blur-sm"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    )}
                    {analyzing && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
                                <span>Uploading...</span>
                            </h3>
                            <p className="text-text-secondary animate-pulse">
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
                    className={`mt-6 w-full rounded-full px-6 py-4 text-base font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${(!selectedFile || isCheckingFace) ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary-hover'}`}
                 >
                    <span>{isCheckingFace ? "Checking image..." : colorLabText.Landing.uploadBtn}</span>
                 </button>
            )}
            
            <div className="mt-6 bg-blue-50/50 rounded-xl p-4 border border-blue-100 text-left">
                <div className="flex gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                        <p className="text-sm font-bold text-blue-900 mb-1">For Best Results:</p>
                        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                            <li>Use natural daylight (face a window)</li>
                            <li>Avoid heavy makeup or filters</li>
                            <li>Wear neutral colors if possible</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <p className="mt-6 text-xs text-center text-gray-400">
                <span>{colorLabText.Analysis.privacyNote}</span>
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
                            className="w-full bg-[#1A1A2E] text-white py-3 rounded-full font-bold shadow-md"
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
