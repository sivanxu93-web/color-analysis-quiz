'use client'

import React, { useState, useRef, useEffect } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { useCommonContext } from '~/context/common-context';
import { useRouter } from 'next/navigation';
import { getLinkHref } from '~/configs/buildLink';
import imageCompression from 'browser-image-compression';

async function computeSHA256(file: Blob): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function ValidatorPageComponent({
    locale,
    colorLabText
}: {
    locale: string;
    colorLabText: any;
}) {
    const { userData, setShowLoginModal } = useCommonContext();
    const router = useRouter();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStep, setProcessStep] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any | null>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
    const [progress, setProgress] = useState(0);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Simulate progress bar when processing
    useEffect(() => {
        let progressInterval: any;
        if (isProcessing) {
            setProgress(0);
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 30) return prev + 3;
                    if (prev < 70) return prev + 1.5;
                    if (prev < 90) return prev + 0.5;
                    return prev;
                });
            }, 300);
        } else {
            setProgress(0);
        }
        return () => clearInterval(progressInterval);
    }, [isProcessing]);

    // Fetch profiles on mount
    useEffect(() => {
        if (!userData?.user_id) {
            setIsLoadingProfiles(false);
            return;
        }

        const fetchProfiles = async () => {
            try {
                const res = await fetch('/api/color-lab/validator/profiles');
                if (res.ok) {
                    const data = await res.json();
                    if (data.profiles && data.profiles.length > 0) {
                        setProfiles(data.profiles);
                        
                        // Check local storage for previously selected profile
                        const savedProfileId = localStorage.getItem('validator_active_profile');
                        if (savedProfileId && data.profiles.some((p: any) => p.id === savedProfileId)) {
                            setActiveProfileId(savedProfileId);
                        } else if (data.profiles.length === 1) {
                            setActiveProfileId(data.profiles[0].id);
                        }
                    } else {
                         setError("You need to complete your Personal Color Analysis before using the Style Validator.");
                    }
                }
            } catch(e) {
                console.error(e);
            } finally {
                setIsLoadingProfiles(false);
            }
        };

        fetchProfiles();
    }, [userData?.user_id]);

    const handleProfileSelect = (id: string) => {
        setActiveProfileId(id);
        localStorage.setItem('validator_active_profile', id);
        setError(null); // Clear errors like "PROFILE_MISSING" just in case
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!userData?.user_id) {
            setShowLoginModal(true);
            return;
        }

        if (!activeProfileId) {
            setError("Please select a profile first.");
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        // Reset state
        setError(null);
        setResult(null);
        setUploadedImageUrl(null);
        
        // Preview
        const previewUrl = URL.createObjectURL(file);
        setSelectedImage(previewUrl);

        await processAndAnalyze(file, activeProfileId);
    };

    const handleTopUp = async () => {
        if (!userData?.user_id) {
            setShowLoginModal(true);
            return;
        }

        setIsProcessing(true);
        setProcessStep("Connecting to secure checkout...");

        try {
            const res = await fetch('/api/creem/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: 'prod_30XwBuNcwnsBFuf07AgcCS', // The new Validator 20-Pack ID
                    metadata: {
                        user_id: userData.user_id,
                        email: userData.email,
                        plan: 'validator_pack' // Crucial for the webhook to know what to credit
                    },
                    successUrl: `${window.location.origin}/${locale}/validator?payment_success=true`
                })
            });

            if (!res.ok) throw new Error("Failed to init checkout");
            
            const { checkout_url } = await res.json();
            if (checkout_url) {
                window.location.href = checkout_url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (e) {
            console.error(e);
            alert("Payment initialization failed. Please try again.");
            setIsProcessing(false);
            setProcessStep("");
        }
    };

    const continueValidationWithProfile = async (sessionId: string, imageUrl: string) => {
        setIsProcessing(true);
        setError(null);

        try {
            setProcessStep("Creating validation record...");
            const valUploadRes = await fetch('/api/color-lab/validator/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: imageUrl, sessionId: sessionId })
            });

            if (valUploadRes.status === 402) {
                const errorData = await valUploadRes.json();
                throw new Error(errorData.message || "LIMIT_REACHED");
            }

            if (!valUploadRes.ok) throw new Error("Failed to start validation");
            const valUploadData = await valUploadRes.json();

            setProcessStep("AI analyzing harmony...");

            // 4. Analyze
            const analyzeRes = await fetch('/api/color-lab/validator/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outfitId: valUploadData.outfitId })
            });

            if (!analyzeRes.ok) {
                throw new Error("AI Analysis failed");
            }

            const analyzeData = await analyzeRes.json();
            setResult(analyzeData.result);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsProcessing(false);
            setProcessStep("");
        }
    };

    const processAndAnalyze = async (originalFile: File, sessionId: string) => {
        setIsProcessing(true);
        setError(null);

        try {
            setProcessStep("Compressing image...");
            // Compress Image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 800,
                useWebWorker: true
            };
            let uploadBody: Blob | File = originalFile;
            let uploadContentType = originalFile.type;
            let uploadFilename = originalFile.name;

            try {
                const compressed = await imageCompression(originalFile, options);
                uploadBody = compressed;
                uploadContentType = 'image/jpeg';
                uploadFilename = originalFile.name.replace(/\.[^/.]+$/, "") + ".jpg";
            } catch (err) {
                console.error("Compression error, proceeding with original", err);
            }

            setProcessStep("Uploading image...");
            const imageHash = await computeSHA256(uploadBody);
            
            // Generate a dummy session ID for the outfit upload if we don't have one yet
            // The upload API requires a sessionId to organize folders in R2
            const uploadSessionId = crypto.randomUUID();
            
            // 1. Get Presigned URL
            const uploadRes = await fetch('/api/color-lab/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: uploadFilename,
                    contentType: uploadContentType,
                    type: 'outfits',
                    hash: imageHash,
                    sessionId: uploadSessionId // Added missing required field
                })
            });

            if (!uploadRes.ok) throw new Error("Failed to initialize upload");
            
            const uploadData = await uploadRes.json();
            const { uploadUrl, publicUrl } = uploadData;

            if (!uploadData.duplicate && uploadUrl) {
                // 2. Upload to R2
                const s3Res = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: uploadBody,
                    headers: { 'Content-Type': uploadContentType }
                });
                if (!s3Res.ok) throw new Error("Failed to upload image data");
            }

            setUploadedImageUrl(publicUrl);
            setProcessStep("Checking color profile...");
            
            // 3. Create Validator Record using the specific sessionId
            const valUploadRes = await fetch('/api/color-lab/validator/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: publicUrl, sessionId: sessionId })
            });

            if (valUploadRes.status === 403) {
                const errorData = await valUploadRes.json();
                if (errorData.error === 'NO_REPORT_FOUND') {
                    throw new Error("PROFILE_MISSING");
                }
            } else if (valUploadRes.status === 402) {
                const errorData = await valUploadRes.json();
                throw new Error(errorData.message || "LIMIT_REACHED");
            }

            if (!valUploadRes.ok) throw new Error("Failed to start validation");
            const valUploadData = await valUploadRes.json();

            setProcessStep("AI analyzing harmony...");

            // 4. Analyze
            const analyzeRes = await fetch('/api/color-lab/validator/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outfitId: valUploadData.outfitId })
            });

            if (!analyzeRes.ok) {
                throw new Error("AI Analysis failed");
            }

            const analyzeData = await analyzeRes.json();
            setResult(analyzeData.result);

        } catch (err: any) {
            console.error(err);
            if (err.message === "PROFILE_MISSING") {
                setError("You need to complete your Personal Color Analysis before using the Style Validator.");
            } else {
                setError(err.message || "An unexpected error occurred.");
            }
        } finally {
            setIsProcessing(false);
            setProcessStep("");
        }
    };

    return (
        <>
            <Header locale={locale} page={'validator'} />
            <main className="min-h-screen bg-[#FFFBF7] py-12 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <span className="text-primary font-bold tracking-widest uppercase text-xs">Style Validator</span>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#1A1A2E] mt-3 mb-4">
                            Will this look good on me?
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Upload a photo of any clothing item. Our AI will check it against your personal color profile and tell you if it&apos;s a match.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Left: Upload Area / Profile Selection */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E1D9] flex flex-col min-h-[400px]">
                            {isLoadingProfiles ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                                    <p>Loading your style profiles...</p>
                                </div>
                            ) : !activeProfileId && profiles.length > 1 ? (
                                <div className="animate-fade-in flex flex-col h-full justify-center">
                                    <h3 className="font-serif text-2xl font-bold text-[#1A1A2E] mb-2 text-center">Who are we styling?</h3>
                                    <p className="text-gray-500 text-sm mb-6 text-center">Please select a color profile to use for validation.</p>
                                    <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                        {profiles.map((profile: any) => (
                                            <button 
                                                key={profile.id}
                                                onClick={() => handleProfileSelect(profile.id)}
                                                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:border-primary hover:bg-white transition-all text-left group"
                                            >
                                                {profile.image_url ? (
                                                    <img src={profile.image_url} alt="Profile" className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm group-hover:ring-primary/20" />
                                                ) : (
                                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shrink-0 text-2xl shadow-sm">👤</div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-[#1A1A2E] text-lg">{profile.season || 'Unknown Season'}</p>
                                                    <p className="text-sm text-gray-500 truncate">{profile.headline || 'Your Color Profile'}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    {/* Active Profile Indicator */}
                                    {activeProfileId && profiles.length > 1 && (
                                        <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                {profiles.find(p => p.id === activeProfileId)?.image_url ? (
                                                    <img src={profiles.find(p => p.id === activeProfileId)?.image_url} alt="Active" className="w-10 h-10 rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-sm">👤</div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Validating for</p>
                                                    <p className="text-sm font-bold text-[#1A1A2E] leading-tight">
                                                        {profiles.find(p => p.id === activeProfileId)?.season}
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={() => setActiveProfileId(null)} className="text-xs font-bold text-primary hover:text-primary-hover px-3 py-1.5 bg-primary/5 rounded-full">
                                                Change
                                            </button>
                                        </div>
                                    )}

                                    {selectedImage ? (
                                        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 mt-auto">
                                            <img src={selectedImage} alt="Clothing item" className="w-full h-full object-contain" />
                                            
                                            {isProcessing && (
                                                <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-10 p-6">
                                                    <div className="relative w-24 h-24 mb-6 group">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200" />
                                                            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" 
                                                                    strokeDasharray={276} 
                                                                    strokeDashoffset={276 - (276 * progress) / 100} 
                                                                    className="text-primary transition-all duration-300 ease-out" 
                                                                    strokeLinecap="round" />
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-xl font-bold font-mono text-[#1A1A2E]">{Math.floor(progress)}%</span>
                                                        </div>
                                                        <div className="absolute -inset-2 bg-primary/10 rounded-full blur-lg animate-pulse -z-10"></div>
                                                    </div>
                                                    <p className="text-[#1A1A2E] font-serif font-bold text-lg mb-1">{processStep}</p>
                                                    <p className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">Please wait</p>
                                                </div>
                                            )}

                                            {!isProcessing && (
                                                <button 
                                                    onClick={() => { setSelectedImage(null); setResult(null); setError(null); }}
                                                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-[#E8E1D9] hover:border-primary bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-colors group mt-auto"
                                        >
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <h3 className="font-serif text-xl font-bold text-[#1A1A2E] mb-2">Upload Clothing Image</h3>
                                            <p className="text-gray-400 text-sm px-8 text-center">Take a photo or upload a screenshot of an outfit you want to buy.</p>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/jpeg, image/png, image/webp" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleImageSelect}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right: Results Area */}
                        <div className="flex flex-col justify-center h-full">
                            {error ? (
                                error.includes("top-up") || error.includes("LIMIT_REACHED") ? (
                                    <div className="bg-[#1A1A2E] p-8 rounded-3xl border border-[#1A1A2E] text-center shadow-xl text-white transform transition-all hover:scale-105">
                                        <div className="text-5xl mb-4">💎</div>
                                        <h3 className="text-2xl font-serif font-bold mb-3">Time for a Top-up</h3>
                                        <p className="text-gray-300 mb-8 max-w-sm mx-auto leading-relaxed">
                                            {error.includes("top-up") ? error : "You've used all your free Style Validations. Get a scan pack to keep your AI stylist on call."}
                                        </p>
                                        <div className="bg-white/10 p-6 rounded-2xl mb-8 border border-white/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-lg">20 Outfit Scans</span>
                                                <span className="text-2xl font-bold text-accent-gold">$4.90</span>
                                            </div>
                                            <p className="text-left text-xs text-gray-400">That&apos;s just $0.24 per scan to never buy the wrong color again.</p>
                                        </div>
                                        <button 
                                            onClick={handleTopUp}
                                            className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-lg hover:bg-primary-hover transition-colors animate-pulse mb-2"
                                        >
                                            Get 20 Scans Now
                                        </button>
                                        <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1 mb-4">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            Secure checkout powered by Creem
                                        </p>
                                        <button 
                                            onClick={() => { setSelectedImage(null); setResult(null); setError(null); setUploadedImageUrl(null); }}
                                            className="text-xs text-gray-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center animate-fade-in">
                                        <div className="text-4xl mb-4">⚠️</div>
                                        <h3 className="text-lg font-bold text-red-800 mb-2">Analysis Failed</h3>
                                        <p className="text-red-600/80 mb-6">{error}</p>
                                        {error === "You need to complete your Personal Color Analysis before using the Style Validator." ? (
                                            <button 
                                                onClick={() => router.push(getLinkHref(locale, 'analysis'))}
                                                className="bg-[#1A1A2E] text-white px-6 py-2.5 rounded-full font-bold shadow-sm"
                                            >
                                                Start Color Analysis
                                            </button>
                                        ) : (
                                            <div className="flex justify-center gap-4">
                                                {uploadedImageUrl && activeProfileId && (
                                                    <button 
                                                        onClick={() => { setError(null); continueValidationWithProfile(activeProfileId, uploadedImageUrl); }}
                                                        className="bg-[#1A1A2E] text-white px-6 py-2.5 rounded-full font-bold shadow-sm"
                                                    >
                                                        Retry Analysis
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => { setSelectedImage(null); setResult(null); setError(null); setUploadedImageUrl(null); }}
                                                    className="bg-white text-gray-700 border border-gray-200 px-6 py-2.5 rounded-full font-bold shadow-sm hover:bg-gray-50"
                                                >
                                                    Upload Different Photo
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            ) : result ? (
                                <div className={`p-8 rounded-[2rem] shadow-lg border relative overflow-hidden transition-all duration-500 animate-slide-up ${result.is_match ? 'bg-[#F2FCEE] border-green-200' : 'bg-[#FFF5F5] border-red-200'}`}>
                                    
                                    <div className="absolute top-0 right-0 p-6 opacity-20 text-8xl pointer-events-none">
                                        {result.is_match ? '✨' : '🛑'}
                                    </div>

                                    <div className="relative z-10">
                                        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${result.is_match ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            Score: {result.score} / 5
                                        </div>
                                        <h2 className={`font-serif text-3xl font-bold mb-4 ${result.is_match ? 'text-green-900' : 'text-red-900'}`}>
                                            {result.verdict_title}
                                        </h2>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Color Detected</p>
                                                <p className="text-gray-800 font-medium">{result.clothing_color_description}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">The Verdict</p>
                                                <p className="text-gray-700 leading-relaxed">{result.reasoning}</p>
                                            </div>

                                            <div className={`p-4 rounded-xl ${result.is_match ? 'bg-green-100/50' : 'bg-red-100/50'}`}>
                                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Stylist Advice</p>
                                                <p className="text-gray-800 text-sm font-medium">{result.styling_advice}</p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => { setSelectedImage(null); setResult(null); setError(null); }}
                                            className={`mt-8 w-full py-3 rounded-full font-bold text-sm transition-colors border-2 ${result.is_match ? 'border-green-800 text-green-900 hover:bg-green-800 hover:text-white' : 'border-red-800 text-red-900 hover:bg-red-800 hover:text-white'}`}
                                        >
                                            Check Another Item
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden md:flex flex-col items-center justify-center text-center p-8 bg-white/50 rounded-[2rem] border border-dashed border-gray-200 h-full min-h-[300px]">
                                    <div className="text-6xl mb-4 opacity-50 grayscale">👗</div>
                                    <h3 className="font-serif text-xl font-bold text-gray-400 mb-2">Awaiting Image</h3>
                                    <p className="text-gray-400 text-sm max-w-xs">Upload a clothing item to see how it aligns with your seasonal color profile.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer locale={locale} page={'validator'} />
        </>
    );
}
