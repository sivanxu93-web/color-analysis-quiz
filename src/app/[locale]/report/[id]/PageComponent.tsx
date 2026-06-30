'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { useState, useEffect, useRef } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { useCommonContext } from '~/context/common-context';
import { useRouter, useSearchParams } from 'next/navigation';
import PricingModal from '~/components/PricingModal';
import ColorFan from '~/components/ColorFan';
import Script from 'next/script';

export default function PageComponent({
  locale,
  report,
  status: initialStatus,
  userImage,
  colorLabText,
  sessionId,
  drapingImages: initialDrapingImages,
  rating,
  isOwner = false
}: {
  locale: string;
  report: any; 
  status: string;
  userImage: string | null;
  colorLabText: any;
  sessionId?: string;
  drapingImages?: { best: string | null; worst: string | null };
  rating?: string;
  isOwner?: boolean;
  seoText?: React.ReactNode;
}) {
  const { userData, setShowLoginModal, setShowPricingModal } = useCommonContext();
  const router = useRouter();
  
    const [status, setStatus] = useState(initialStatus);
    const [drapingImages, setDrapingImages] = useState(initialDrapingImages || { best: null, worst: null });
    const [isGeneratingDraping, setIsGeneratingDraping] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const hasTriggeredDraping = useRef(false);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [drapingError, setDrapingError] = useState<string | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // 0. Loading State Management (Tips & Progress)
    useEffect(() => {
        let tipInterval: any;
        let progressInterval: any;

        if (status === 'processing') {
            // Rotate tips
            tipInterval = setInterval(() => {
                setCurrentTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
            }, 3500);

            // Fake progress: Fast at first, slows down near the end
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 30) return prev + 2; // Fast start
                    if (prev < 70) return prev + 1; // Steady middle
                    if (prev < 92) return prev + 0.5; // Slow down
                    return prev; // Stay at 92% until real data hits
                });
            }, 500);
        }

                return () => {
                    clearInterval(tipInterval);
                    clearInterval(progressInterval);
                };
            }, [status]);
            const [viewMode, setViewMode] = useState<'draping' | 'fan'>('draping');    
    // DEMO MODE LOGIC
    const searchParams = useSearchParams();
    const isDemo = searchParams?.get('demo') === 'true';
    const mockStatus = searchParams?.get('mock_status') || 'protected';

    // Sync status when server props update, BUT respect demo mode
    useEffect(() => {
        if (isDemo) {
            setStatus(mockStatus);
        } else if (initialStatus && initialStatus !== status) {
            // Prevent regression: If we are already 'completed', don't revert to 'protected' 
            // just because the server prop is stale (race condition with router.refresh)
            if (status === 'completed' && (initialStatus === 'protected' || initialStatus === 'processing' || initialStatus === 'draft')) {
                return;
            }
            // Fix for infinite loop: Don't revert from processing/protected to draft
            if ((status === 'processing' || status === 'protected') && initialStatus === 'draft') {
                return;
            }
            setStatus(initialStatus);
        }
    }, [initialStatus, isDemo, mockStatus, status]);

    // Feedback State
    const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'good' | 'bad' | 'submitted'>(rating ? 'submitted' : 'idle');
    const [feedbackComment, setFeedbackComment] = useState('');
    const [isMainFeedbackVisible, setIsMainFeedbackVisible] = useState(false);
    const [hasSeenContent, setHasSeenContent] = useState(false);

    const LOADING_TIPS = [
        "Analyzing your skin undertones...",
        "Matching with 12-season color theory...",
        "Simulating fabric reflections...",
        "Finding your perfect power colors...",
        "Consulting the AI stylist...",
    ];

    // 1. Session Claim (Separate Effect to avoid spamming)
    useEffect(() => {
        if (userData?.email && sessionId) {
            fetch('/api/color-lab/session/claim', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ sessionId, email: userData.email })
            }).catch(err => console.error("Session claim failed", err));
        }
    }, [userData?.email, sessionId]);

    // 2. Auto-Trigger Generation & Payment Check
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentSuccess = urlParams.get('payment_success');

        if (paymentSuccess === 'true') {
            // Track Purchase Conversion in Google Ads
            // Using the global ID + specific label from Tag Assistant
            const conversionId = 'AW-17982041169';
            const conversionLabel = 'WwzkCK3GqoAcENHYwP5C';
            
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'purchase', {
                    'send_to': `${conversionId}/${conversionLabel}`,
                    'transaction_id': sessionId,
                    'value': 5.90,
                    'currency': 'USD',
                    'items': [{
                        'item_id': 'color_report_single',
                        'item_name': 'Color Analysis Report',
                        'price': 5.90
                    }]
                });
                console.log("Google Ads Purchase Tracked with Label:", sessionId);
            }

            // Only attempt unlock if user is loaded.
            if (userData?.user_id) {
                window.history.replaceState({}, '', window.location.pathname);
                if (status === 'protected') {
                    handleUnlockClick();
                }
            }
        } else if (status === 'draft') {
            // Auto-start analysis or prompt login
            if (userData?.email) {
                triggerGeneration();
            } else {
                setShowLoginModal(true);
            }
        }
    }, [status, userData?.email, setShowLoginModal, userData?.user_id]);

    const triggerGeneration = async () => {
        if (!sessionId || !userData?.email) return;
        
        setStatus('processing');
        setGenerationError(null);
        sendGAEvent('event', 'start_analysis', { sessionId });

        try {
            const res = await fetch('/api/color-lab/analyze', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sessionId,
                    imageUrl: userImage,
                    email: userData.email
                })
            });

            if (res.status === 402) {
                setStatus('protected');
                // Removed router.push to pricing - stay on page to show the teaser!
                return;
            }

            if (res.status === 409) {
                const data = await res.json();
                setGenerationError("You already have a pending report waiting for you.");
                // Optionally could redirect directly to the pending report if ID was returned
                return;
            }

            if (res.ok) {
                router.refresh(); 
            } else {
                setGenerationError("Analysis failed. Please try again.");
            }
        } catch (e) {
            setGenerationError("Connection error. Please check your network.");
        }
    };

    const handleUnlockClick = async () => {
        if (!userData?.user_id) {
            setShowLoginModal(true);
            return;
        }

        setStatus('processing');

        try {
            const res = await fetch('/api/color-lab/unlock', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sessionId,
                    email: userData.email
                })
            });

            if (res.status === 402) {
                // Insufficient credits -> Show Pricing Modal instead of redirecting
                setStatus('protected');
                setShowPricingModal(true);
                return;
            }

            if (res.ok) {
                // Unlock successful -> Reveal content
                setStatus('completed');
                router.refresh();
                // Draping generation will auto-trigger via existing useEffect
            } else {
                const errorText = await res.text();
                console.error("Unlock failed", res.status, errorText);
                alert("Something went wrong unlocking the report. Please try again.");
                setStatus('protected');
            }
        } catch (e) {
            console.error("Unlock error", e);
            setStatus('protected');
        }
    };

    // 2. Draping Logic
    useEffect(() => {
        if (status === 'completed' && report && !drapingImages.best && !isGeneratingDraping && sessionId && !drapingError && !hasTriggeredDraping.current) {
            handleGenerateDraping();
        }
    }, [status, sessionId, report, drapingImages.best, drapingError]); 
  
  
  
      const handleGenerateDraping = async () => {
  
        // Double check: Only generate if paid
        if (status !== 'completed') return;

        if (!sessionId || !report?.virtual_draping_prompts) return;
  
        // Reset state to trigger loading UI
        setDrapingError(null);
        setIsGeneratingDraping(true);
        hasTriggeredDraping.current = true;
  
        try {
            const [bestRes, worstRes] = await Promise.all([
                fetch('/api/color-lab/draping', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ 
                        sessionId, 
                        prompt: report.virtual_draping_prompts.best_color_prompt, 
                        makeup_prompt: report.virtual_draping_prompts.best_makeup_prompt,
                        type: 'best' 
                    })
                }),
                fetch('/api/color-lab/draping', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ 
                        sessionId, 
                        prompt: report.virtual_draping_prompts.worst_color_prompt, 
                        makeup_prompt: report.virtual_draping_prompts.worst_makeup_prompt,
                        type: 'worst' 
                    })
                })
            ]);
    
            if (!bestRes.ok || !worstRes.ok) {
                console.error("Draping API failed:", !bestRes.ok ? await bestRes.text() : await worstRes.text());
                throw new Error("HIGH_VOLUME_ERROR");
            }
    
            const bestData = await bestRes.json();
            const worstData = await worstRes.json();
            
            setDrapingImages({
                best: bestData.imageUrl,
                worst: worstData.imageUrl
            });
        } catch (error: any) {
            console.error("Draping technical error:", error);
            // Force a friendly, high-volume message regardless of the actual error
            setDrapingError("We're seeing a huge surge in users right now! Our AI is working overtime to style everyone—please try clicking again in a moment.");
            hasTriggeredDraping.current = false; 
        } finally {
            setIsGeneratingDraping(false);
        }
      };
  
  
  
    
  
  

  const handleFeedback = async (rating: 'good' | 'bad') => {
      setFeedbackStatus(rating);
      if (rating === 'good') {
          try { await fetch('/api/color-lab/feedback', { method: 'POST', body: JSON.stringify({ sessionId, rating: 'good' }) }); } catch(e) {}
      }
  };
  const submitComment = async () => {
      try { await fetch('/api/color-lab/feedback', { method: 'POST', body: JSON.stringify({ sessionId, rating: 'bad', comment: feedbackComment }) }); } catch(e) {}
      setFeedbackStatus('submitted');
  };

  // MOCK DATA for Draft View
  const MOCK_REPORT = {
      season: "Deep Winter",
      headline: "The Dark Romantic",
      description: "Your primary characteristic is Deep, and your secondary characteristic is Cool. You shine in colors that are dark, vivid, and cool-toned. Your high contrast features require equally high contrast outfits to look your best.",
      characteristics: {
          skin: "Cool Undertone",
          eyes: "High Contrast",
          hair: "Deep Tone"
      },
      palette: {
          power: {
              colors: [
                { hex: "#2E1A47", name: "Royal Purple" }, { hex: "#0F4C3A", name: "Emerald" },
                { hex: "#8B0000", name: "Deep Red" }, { hex: "#000000", name: "Black" }
              ],
              usage_advice: "Wear these near your face to make your eyes pop and skin look luminous."
          },
          neutrals: {
              colors: [{ hex: "#333333", name: "Charcoal" }, { hex: "#FFFFFF", name: "Pure White" }],
              usage_advice: "These should form the foundation of your investment pieces like coats and suits."
          },
          pastels: {
              colors: [{ hex: "#E6E6FA", name: "Icy Lavender" }, { hex: "#F0FFFF", name: "Icy Blue" }],
              usage_advice: "Use these for a softer look, ideal for summer weight fabrics or casual knits."
          }
      },
      makeup_recommendations: {
          summary: "Opt for cool, deep shades. A bold red lip is your signature look.",
          specific_products: [
              { category: "Lipstick", shade: "Ruby Woo", recommendation: "Perfect matte red" },
              { category: "Blush", shade: "Deep Berry", recommendation: "Apply lightly" }
          ]
      },
      styling: {
          metals: ["Silver", "Platinum"],
          keywords: ["Dramatic", "Bold", "Sharp"],
      },
      worst_colors: [
          { hex: "#DAA520", name: "Goldenrod", reason: "Makes skin look sallow" },
          { hex: "#FF8C00", name: "Dark Orange", reason: "Clashes with cool undertones" }
      ],
      hair_color_recommendations: [
          { color: "Jet Black", desc: "Enhances contrast" },
          { color: "Cool Dark Brown", desc: "Harmonizes with skin" }
      ],
      celebrities: ["Anne Hathaway", "Kendall Jenner", "Lucy Liu"]
  };

  const isLocked = status === 'protected';
  const displayReport = isDemo ? MOCK_REPORT : report;
  
  // Handle User Image for Demo
  const displayUserImage = (isDemo && !userImage) ? '/seasonal_color_analysis.jpg' : userImage;

  // Handle Draping Images for Demo
  const displayDraping = isDemo && status === 'completed' 
      ? { best: displayUserImage, worst: displayUserImage } 
      : (isLocked ? { best: displayUserImage, worst: displayUserImage } : drapingImages);

  // 3. Auto-show login modal if locked and not logged in
  useEffect(() => {
    if (!isDemo && isLocked && !userData?.user_id) {
        setShowLoginModal(true);
    }
  }, [isLocked, userData?.user_id, setShowLoginModal, isDemo]);

  const { 
      season: rawSeason, headline: dHeadline, description: dDescription, characteristics: dCharacteristics, 
      palette: dPalette, makeup_recommendations: dMakeup, styling: dStyling, 
      worst_colors: dWorst, celebrities: dCelebs, hair_color_recommendations: dHair
  } = displayReport || {};

  const handleDownloadPDF = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      // @ts-ignore
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      
      // @ts-ignore
      window.pdfMake = pdfMake;

      // @ts-ignore
      await import('pdfmake/build/vfs_fonts');

      const seasonName = typeof rawSeason === 'string' ? rawSeason : 'My_Color_Analysis';
      const filename = `${seasonName.replace(/\s+/g, '_')}_Report.pdf`;

      // Helper for building colors grid
      const buildColorGrid = (colorsList: any[]) => {
        if (!colorsList || colorsList.length === 0) return [];
        const columnsPerRow = 4;
        const body: any[] = [];
        
        for (let i = 0; i < colorsList.length; i += columnsPerRow) {
          const chunk = colorsList.slice(i, i + columnsPerRow);
          
          const colorRow = chunk.map((color: any) => ({
            text: '',
            fillColor: color.hex,
            margin: [0, 15, 0, 15]
          }));
          
          const textRow = chunk.map((color: any) => ({
            text: `${color.name || ''}\n${color.hex || ''}`,
            style: 'colorLabel',
            margin: [0, 4, 0, 12]
          }));
          
          while (colorRow.length < columnsPerRow) {
            colorRow.push({ text: '', fillColor: '#fff8f5', margin: [0, 15, 0, 15] });
            textRow.push({ text: '', style: 'colorLabel', margin: [0, 4, 0, 12] });
          }
          
          body.push(colorRow);
          body.push(textRow);
        }
        
        return {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: body
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 4,
            paddingRight: () => 4
          }
        };
      };

      // Helper for worst colors
      const buildWorstColorsList = (worstList: any[]) => {
        if (!worstList || worstList.length === 0) return [];
        
        const body = worstList.map((color: any) => {
          return [
            {
              text: '',
              fillColor: color.hex,
              width: 16,
              margin: [0, 4, 0, 4]
            },
            {
              stack: [
                { text: color.name, style: 'worstColorName' },
                { text: color.reason, style: 'worstColorReason' }
              ],
              margin: [8, 1, 0, 1]
            }
          ];
        });
        
        return {
          table: {
            widths: [30, '*'],
            body: body
          },
          layout: 'noBorders'
        };
      };

      // Helper for makeup tables
      const buildMakeupTable = (products: any[]) => {
        if (!products || products.length === 0) return [];
        
        const headerRow = [
          { text: 'Category', style: 'tableHeader' },
          { text: 'Shade / Product', style: 'tableHeader' },
          { text: 'Style Advice', style: 'tableHeader' }
        ];
        
        const bodyRows = products.map((prod: any) => [
          { text: prod.category || '', style: 'tableBodyCategory' },
          { text: prod.shade || '', style: 'tableBodyShade' },
          { text: prod.recommendation || '', style: 'tableBodyText' }
        ]);
        
        return {
          table: {
            headerRows: 1,
            widths: ['25%', '30%', '45%'],
            body: [headerRow, ...bodyRows]
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: (i: number, node: any) => (i === 0 || i === 1) ? '#A46751' : '#E8DCD8',
            paddingTop: (i: number) => i === 0 ? 8 : 10,
            paddingBottom: (i: number) => i === 0 ? 8 : 10,
          }
        };
      };

      // Helper for hair color
      const buildHairTable = (hairList: any[]) => {
        if (!hairList || hairList.length === 0) return [];
        
        const bodyRows = hairList.map((item: any) => [
          { text: item.color || '', style: 'tableBodyShade' },
          { text: item.desc || '', style: 'tableBodyText' }
        ]);
        
        return {
          table: {
            widths: ['35%', '65%'],
            body: bodyRows
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: () => '#E8DCD8',
            paddingTop: () => 8,
            paddingBottom: () => 8,
          }
        };
      };

      // Construct docDefinition
      const docDefinition = {
        content: [
          { text: 'AURA AI COLOR LAB', style: 'brandHeader' },
          { text: 'PERSONAL COLOR ANALYSIS REPORT', style: 'brandSub' },
          {
            table: {
              widths: ['*'],
              body: [
                ['']
              ]
            },
            layout: {
              hLineWidth: (i: number) => i === 1 ? 1.5 : 0,
              vLineWidth: () => 0,
              hLineColor: () => '#A46751',
              paddingTop: () => 0,
              paddingBottom: () => 0
            },
            margin: [0, 8, 0, 20]
          },
          
          { text: 'YOUR SEASONAL TYPE', style: 'sectionLabel' },
          { text: seasonName.toUpperCase(), style: 'seasonTitle' },
          
          dCharacteristics ? {
            columns: Object.entries(dCharacteristics).map(([key, value]) => ({
              text: `${key.toUpperCase()}: ${String(value).toUpperCase()}`,
              style: 'traitBadge',
              width: 'auto',
              margin: [0, 0, 10, 0]
            })),
            margin: [0, 5, 0, 15]
          } : null,

          { text: dHeadline || '', style: 'headline' },
          { text: dDescription || '', style: 'description', margin: [0, 10, 0, 20] },

          { text: 'YOUR POWER PALETTE', style: 'sectionTitle', pageBreak: 'before' },
          { text: 'Shades that maximize your natural contrast and undertones.', style: 'sectionDesc', margin: [0, 0, 0, 15] },

          { text: 'Power Colors', style: 'subSectionTitle' },
          powerPalette.usage_advice ? { text: `"${powerPalette.usage_advice}"`, style: 'usageAdvice' } : null,
          buildColorGrid(powerPalette.colors),

          { text: 'Neutral Foundation Colors', style: 'subSectionTitle', margin: [0, 12, 0, 8] },
          neutralPalette.usage_advice ? { text: `"${neutralPalette.usage_advice}"`, style: 'usageAdvice' } : null,
          buildColorGrid(neutralPalette.colors),

          { text: 'Pastel Highlight Colors', style: 'subSectionTitle', margin: [0, 12, 0, 8] },
          pastelPalette.usage_advice ? { text: `"${pastelPalette.usage_advice}"`, style: 'usageAdvice' } : null,
          buildColorGrid(pastelPalette.colors),

          dWorst && dWorst.length > 0 ? {
            stack: [
              { text: 'COLORS TO AVOID', style: 'sectionTitle', pageBreak: 'before' },
              { text: 'Shades that tend to clash with your undertones or make you look washed out.', style: 'sectionDesc', margin: [0, 0, 0, 15] },
              buildWorstColorsList(dWorst)
            ]
          } : null,

          { text: 'BEAUTY & HAIR STYLING', style: 'sectionTitle', pageBreak: 'before' },
          { text: 'Tailored cosmetic selections that harmonize with your seasonal profile.', style: 'sectionDesc', margin: [0, 0, 0, 15] },
          
          dMakeup?.summary ? { text: `Cosmetics Summary: ${dMakeup.summary}`, style: 'makeupSummary', margin: [0, 0, 0, 12] } : null,
          dMakeup?.specific_products ? {
            stack: [
              { text: 'Recommended Cosmetic Shades', style: 'subSectionTitle', margin: [0, 8, 0, 8] },
              buildMakeupTable(dMakeup.specific_products)
            ]
          } : null,

          dHair && dHair.length > 0 ? {
            stack: [
              { text: 'Recommended Hair Colors', style: 'subSectionTitle', margin: [0, 15, 0, 8] },
              buildHairTable(dHair)
            ]
          } : null,

          dStyling ? {
            stack: [
              { text: 'Styling & Accessories', style: 'subSectionTitle', margin: [0, 15, 0, 8] },
              {
                columns: [
                  {
                    stack: [
                      { text: 'BEST METALS', style: 'stylingLabel' },
                      { text: (dStyling.metals || []).join(', '), style: 'stylingValue' }
                    ]
                  },
                  {
                    stack: [
                      { text: 'STYLE KEYWORDS', style: 'stylingLabel' },
                      { text: (dStyling.keywords || []).join(', '), style: 'stylingValue' }
                    ]
                  }
                ],
                margin: [0, 5, 0, 10]
              }
            ]
          } : null,
        ],
        styles: {
          brandHeader: { fontSize: 10, bold: true, color: '#A46751', characterSpacing: 1.5 },
          brandSub: { fontSize: 8, bold: true, color: '#8E7A75', margin: [0, 2, 0, 0], characterSpacing: 1 },
          sectionLabel: { fontSize: 9, bold: true, color: '#A46751', margin: [0, 8, 0, 4] },
          seasonTitle: { fontSize: 28, bold: true, color: '#2D2926', margin: [0, 0, 0, 8] },
          traitBadge: { fontSize: 8, bold: true, color: '#7b5455', background: '#F2E8E5', margin: [0, 4, 10, 4] },
          headline: { fontSize: 16, bold: true, color: '#884C35', margin: [0, 8, 0, 8], italic: true },
          description: { fontSize: 10.5, color: '#53433e', lineHeight: 1.5 },
          sectionTitle: { fontSize: 20, bold: true, color: '#2D2926', margin: [0, 8, 0, 4] },
          sectionDesc: { fontSize: 9.5, color: '#8E7A75' },
          subSectionTitle: { fontSize: 13, bold: true, color: '#884C35', margin: [0, 8, 0, 4] },
          usageAdvice: { fontSize: 9.5, italic: true, color: '#53433e', margin: [0, 0, 0, 8] },
          colorLabel: { fontSize: 7.5, bold: true, color: '#2D2926', alignment: 'center' },
          worstColorName: { fontSize: 10, bold: true, color: '#2D2926' },
          worstColorReason: { fontSize: 8.5, color: '#8E7A75', lineHeight: 1.2 },
          makeupSummary: { fontSize: 9.5, italic: true, color: '#53433e', lineHeight: 1.3 },
          tableHeader: { fontSize: 9.5, bold: true, color: '#ffffff', fillColor: '#A46751', alignment: 'left', margin: [4, 4, 4, 4] },
          tableBodyCategory: { fontSize: 8.5, bold: true, color: '#2D2926', margin: [4, 4, 4, 4] },
          tableBodyShade: { fontSize: 8.5, bold: true, color: '#884C35', margin: [4, 4, 4, 4] },
          tableBodyText: { fontSize: 8.5, color: '#53433e', lineHeight: 1.25, margin: [4, 4, 4, 4] },
          stylingLabel: { fontSize: 8.5, bold: true, color: '#8E7A75', margin: [0, 0, 0, 3] },
          stylingValue: { fontSize: 10, bold: true, color: '#2D2926' }
        }
      };

      pdfMake.createPdf(docDefinition as any).download(filename);
    } catch (error) {
      console.error('Failed to generate PDF, falling back to print:', error);
      const originalTitle = document.title;
      const seasonName = typeof rawSeason === 'string' ? rawSeason : 'My_Color_Analysis';
      document.title = `${seasonName.replace(/\s+/g, '_')}_Report`;
      window.print();
      document.title = originalTitle;
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // --- LOCKED CONTENT LOGIC ---
  // 1. Mask Season Name (e.g. "Deep Winter" -> "**** Winter")
  const baseSeason = rawSeason?.split(' ').pop();
  const dSeason = isLocked ? (
      <span className="inline-flex items-baseline gap-2">
          <span className="text-[#8b4e37]/40 tracking-widest animate-pulse font-mono text-4xl">****</span> 
          <span>{baseSeason}</span>
          <span className="bg-[#8b4e37]/10 p-1.5 rounded-full ml-2 self-center">
            <svg className="w-4 h-4 text-[#8b4e37]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </span>
      </span>
  ) : rawSeason;

  // --- BACKWARDS COMPATIBILITY LOGIC ---
  const normalizePalette = (group: any) => {
    if (!group) return { colors: [], usage_advice: null };
    if (Array.isArray(group)) return { colors: group, usage_advice: null };
    return { 
        colors: group.colors || [], 
        usage_advice: group.usage_advice || null 
    };
  };

  const fullPowerPalette = normalizePalette(dPalette?.power);
  // 2. Limit Power Colors (Show 1 if locked)
  const powerPalette = isLocked 
    ? { ...fullPowerPalette, colors: fullPowerPalette.colors.slice(0, 1) } 
    : fullPowerPalette;

  const neutralPalette = normalizePalette(dPalette?.neutrals);
  const pastelPalette = normalizePalette(dPalette?.pastels);
  
  // 3. Limit Celebrities (Show 1 if locked)
  const displayCelebs = (isLocked && dCelebs) ? dCelebs.slice(0, 1) : dCelebs;
  // --------------------------------------

  // --- HELPER COMPONENT FOR LOCKING CONTENT ---
  const BlurLock = ({ children, label = "Unlock to View" }: { children: React.ReactNode, label?: string }) => {
      if (!isLocked) return <>{children}</>;
      
      return (
        <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-100/50" onClick={handleUnlockClick}>
            {/* Content Layer - Blurred & Faded */}
            <div className="blur-[6px] select-none pointer-events-none opacity-60 transition-all duration-500 group-hover:blur-[4px]">
                {children}
            </div>
            
            {/* Overlay Layer */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/20 hover:bg-white/10 transition-colors">
                <div className="bg-[#2D2926] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 transform transition-all group-hover:scale-105 ring-4 ring-white/50 hover:bg-black">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs font-bold tracking-wide uppercase">{label}</span>
                </div>
            </div>
        </div>
      );
  };
  // --------------------------------------------

  // Loading View (Processing OR Initializing)
  if (status === 'processing' || (!displayReport && !isDemo)) {
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
          <Header locale={locale} page={'report'} />
          <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFBF7] p-4">
             <div className="relative w-full max-w-lg aspect-square flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative z-10 text-center">
                    {generationError ? (
                        <>
                            <div className="text-5xl mb-6 opacity-80">
                                {generationError.includes("pending report") ? <span className="material-symbols-outlined text-red-500">warning</span> : <span className="material-symbols-outlined text-gray-500">help</span>}
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-[#2D2926] mb-3">
                                {generationError.includes("pending report") ? "One Report at a Time" : "Stylist Interrupted"}
                            </h2>
                            <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto leading-relaxed">
                                {generationError.includes("pending report") 
                                    ? "You have a pending analysis waiting for you. Please unlock or delete it before starting a new one."
                                    : "We hit a small snag connecting to our AI stylist. Don't worry, your credits are safe."}
                            </p>
                            
                            {generationError.includes("pending report") ? (
                                <Link 
                                    href={`/${locale}/profile`}
                                    className="bg-[#2D2926] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-black transition-colors shadow-lg inline-block"
                                >
                                    View My Reports
                                </Link>
                            ) : (
                                <button 
                                    onClick={triggerGeneration}
                                    className="bg-[#2D2926] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-black transition-colors shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Resume Analysis
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Professional Progress Circle */}
                            <div className="relative w-32 h-32 mx-auto mb-10 group">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                                    <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="6" fill="transparent" 
                                            strokeDasharray={377} 
                                            strokeDashoffset={377 - (377 * progress) / 100} 
                                            className="text-primary transition-all duration-700 ease-out" 
                                            strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold font-mono text-[#2D2926]">{Math.floor(progress)}%</span>
                                </div>
                                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse -z-10"></div>
                            </div>

                            <h2 className="text-2xl font-serif font-bold text-[#2D2926] mb-2 tracking-tight">AI Stylist at Work</h2>
                            <p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-8 animate-pulse">Personalizing Your Report</p>
                            
                            {/* Rotating Tip Card */}
                            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 shadow-sm min-h-[100px] flex items-center justify-center transition-all duration-1000">
                                <p className="text-[#2D2926] font-medium leading-relaxed italic text-sm md:text-base">
                                    &quot;{LOADING_TIPS[currentTipIndex]}&quot;
                                </p>
                            </div>
                            <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest">Processing High-Resolution Data • Please Don&apos;t Refresh</p>
                        </>
                    )}
                </div>
             </div>
          </div>
          <Footer locale={locale} page={'report'} />
        </>
      );
  }

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
      <Header locale={locale} page={'report'} />
      <PricingModal locale={locale} page={'report'} />

      {/* Main Content (Blurred if Locked) */}
      <main className={`min-h-screen bg-[#fff8f5] font-sans text-[#1e1b18] pb-20 scroll-smooth transition-all duration-1000`}>

        {/* Sticky Nav */}
        <nav className="sticky top-[72px] lg:top-[80px] z-40 bg-[#fff8f5]/70 backdrop-blur-md border-b border-white/50 py-3 shadow-sm transition-all print:hidden">
            <div className="max-w-6xl mx-auto px-4 flex justify-between items-center gap-4">
                <div className="flex gap-6 md:gap-10 overflow-x-auto no-scrollbar py-1 flex-1 scroll-smooth">
                    <a href="#reveal" className="text-sm font-bold text-[#53433e] hover:text-[#A46751] transition-colors uppercase tracking-widest whitespace-nowrap font-sans">Analysis</a>
                    <a href="#draping" className="text-sm font-bold text-[#53433e] hover:text-[#A46751] transition-colors uppercase tracking-widest whitespace-nowrap font-sans">Draping</a>
                    <a href="#palette" className="text-sm font-bold text-[#53433e] hover:text-[#A46751] transition-colors uppercase tracking-widest whitespace-nowrap font-sans">Palette</a>
                    <a href="#makeup" className="text-sm font-bold text-[#53433e] hover:text-[#A46751] transition-colors uppercase tracking-widest whitespace-nowrap font-sans">Makeup</a>
                    {dHair && <a href="#hair" className="text-sm font-bold text-[#53433e] hover:text-[#A46751] transition-colors uppercase tracking-widest whitespace-nowrap font-sans">Hair</a>}
                    <a href="#styling" className="text-sm font-bold text-[#53433e] hover:text-[#A46751] transition-colors uppercase tracking-widest whitespace-nowrap font-sans">Styling</a>
                </div>
                {!isLocked && (
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isDownloadingPdf}
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-[#A46751] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#884c35] transition-all shadow-sm hover:shadow active:scale-95 shrink-0 ${isDownloadingPdf ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {isDownloadingPdf ? (
                            <>
                                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>PDF</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </nav>

        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-8">

            {/* 1. The Reveal - Soft Magazine Layout */}
            <div id="reveal" className="flex flex-col md:flex-row items-center gap-12 pt-4">
                {/* Left: User Image inside premium glass card */}
                <div className="w-full md:w-1/2 relative">
                    <div className="glass-card rounded-[2rem] p-3 relative overflow-hidden shadow-[0_8px_32px_rgba(192,122,96,0.05)] border border-white/50 bg-white/40">
                        {displayUserImage ? (
                            <div className="relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden">
                                <img src={displayUserImage} alt="User Face" className="w-full h-full object-cover object-top" />
                            </div>
                        ) : (
                            <div className="w-full aspect-[4/5] bg-gray-100 rounded-[1.5rem] flex items-center justify-center text-gray-400">
                                No Image Uploaded
                            </div>
                        )}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-card px-6 py-3 rounded-full flex items-center gap-2 whitespace-nowrap bg-white/60 border border-white/80">
                            <span className="w-3 h-3 rounded-full bg-[#8b4e37] animate-pulse"></span>
                            <span className="font-sans text-xs font-semibold tracking-wider uppercase text-[#1e1b18]">{dSeason}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Analysis Title & Trait Badges */}
                <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left space-y-6">
                    <div className="inline-block px-4 py-1.5 border border-[#A46751]/30 text-[#884c35] text-[10px] font-bold uppercase tracking-[0.2em] w-max rounded-full bg-[#A46751]/5 mx-auto md:mx-0">
                        Personal Analysis
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1e1b18] font-bold leading-[1.15]">
                        You are a<br/>
                        <span className="text-[#884c35] italic font-semibold">{dSeason}</span>
                    </h2>
                    
                    <p className="text-[#53433e] text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0 font-sans opacity-95">
                        &quot;{isLocked ? 'Unlock your full color profile to reveal your customized seasonal undertones and power wardrobe colors.' : (dHeadline || 'Discover your true colors.')}&quot;
                    </p>

                    {/* Traits Badges */}
                    <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                        {dCharacteristics && Object.entries(dCharacteristics).map(([key, value]) => (
                            <span key={key} className="px-4 py-2 rounded-full glass-card bg-white/50 font-sans text-xs font-semibold text-[#7b5455] border border-[#d8c2bb]/50 shadow-sm uppercase tracking-wider">
                                {isLocked ? '••••••' : (value as string)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 1.5 The Profile (Deep Dive) - New Section */}
            <div id="profile" className="max-w-4xl mx-auto px-6 text-center space-y-12 border-t border-[#d8c2bb]/30 pt-16">
                {/* Analysis Text */}
                <BlurLock label="Unlock Full Analysis">
                    <div className="relative">
                        <span className="absolute -top-6 -left-4 text-8xl text-primary/10 font-serif leading-none">&ldquo;</span>
                        <p className="text-xl md:text-2xl text-[#1e1b18] font-serif leading-relaxed italic">
                            {dDescription}
                        </p>
                        <span className="absolute -bottom-12 -right-4 text-8xl text-primary/10 font-serif leading-none rotate-180">&rdquo;</span>
                    </div>
                </BlurLock>

                {/* Celebrity Twins */}
                {displayCelebs && (
                    <div className="border-t border-[#d8c2bb]/30 pt-10">
                        <p className="text-[#53433e] text-xs font-bold uppercase tracking-widest mb-6 font-sans">Celebrity Muse</p>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                            {displayCelebs.map((celeb: string, i: number) => (
                                <div key={i} className="bg-white/50 backdrop-blur border border-white/50 px-6 py-3 rounded-full shadow-sm flex items-center gap-3 glass-card">
                                    <span className="material-symbols-outlined text-xl text-[#A46751] align-middle">auto_awesome</span>
                                    <span className="font-serif text-lg text-gray-900 italic">{celeb}</span>
                                </div>
                            ))}
                            {isLocked && (
                                <div className="bg-white/30 border border-white/40 px-6 py-3 rounded-full shadow-sm flex items-center gap-2 opacity-60 glass-card">
                                    <span className="text-sm font-bold text-[#53433e]">+ 2 others</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 1.8 The Seasonal Matrix */}
            <div className="space-y-6 text-center border-t border-[#d8c2bb]/30 pt-16">
                <span className="text-[#884c35] font-bold tracking-widest uppercase text-xs font-sans">The Seasonal Matrix</span>
                <h3 className="font-serif text-3xl font-bold text-[#1e1b18]">Find Your Place in the Seasons</h3>
                <p className="text-sm text-[#53433e] max-w-xl mx-auto font-sans opacity-85">
                    Our analysis places you in one of the 12 key seasons. Here is how your profile compares across the matrix.
                </p>
                
                <BlurLock label="Unlock Seasonal Matrix">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4">
                        {[
                            { name: "Light Spring", color: "#F3E5AB" },
                            { name: "True Spring", color: "#FAD6A5" },
                            { name: "Bright Spring", color: "#E2C275" },
                            { name: "Light Summer", color: "#E6E6FA" },
                            { name: "True Summer", color: "#B0C4DE" },
                            { name: "Soft Summer", color: "#95B8D1" },
                            { name: "Soft Autumn", color: "#D2B48C" },
                            { name: "True Autumn", color: "#CD853F" },
                            { name: "Deep Autumn", color: "#8B4513" },
                            { name: "Deep Winter", color: "#1A1A1A" },
                            { name: "True Winter", color: "#000080" },
                            { name: "Bright Winter", color: "#FF00FF" }
                        ].map((seasonItem) => {
                            const isCurrent = !isLocked && rawSeason?.toLowerCase().includes(seasonItem.name.toLowerCase());
                            
                            return (
                                <div 
                                    key={seasonItem.name} 
                                    className={`glass-card p-4 rounded-2xl flex flex-col items-center justify-center transition-all ${
                                        isCurrent 
                                            ? 'border-2 border-[#A46751] ring-4 ring-[#A46751]/10 scale-105 bg-white/80 shadow-[0_8px_24px_rgba(192,122,96,0.15)] z-10' 
                                            : 'opacity-55 hover:opacity-80 bg-white/30 border-white/30'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full mb-2.5 shadow-inner border border-white" style={{ backgroundColor: seasonItem.color }} />
                                    <span className={`font-sans text-xs font-semibold tracking-wider ${isCurrent ? 'text-[#884c35] font-bold' : 'text-[#53433e]'}`}>
                                        {seasonItem.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </BlurLock>
            </div>

            {/* 2. Visual Proof */}
            <div id="draping" className="text-center space-y-4 pt-8">
                <span className="text-[#884c35] font-bold tracking-widest uppercase text-xs font-sans">The Transformation</span>
                <h2 className="text-4xl font-serif font-bold text-[#1e1b18]">Virtual Draping</h2>
                <div className="w-24 h-1 bg-[#A46751] mx-auto rounded-full"></div>
                
                {/* View Mode Toggle */}
                {!isLocked && (
                    <div className="flex justify-center mt-6">
                        <div className="bg-white/45 p-1 rounded-full border border-white/50 shadow-sm inline-flex glass-card">
                            <button
                                onClick={() => setViewMode('draping')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'draping' ? 'bg-[#A46751] text-white shadow-md' : 'text-[#53433e] hover:text-[#1e1b18]'}`}
                            >
                                <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">auto_awesome</span> AI Try-On</span>
                            </button>
                            <button
                                onClick={() => setViewMode('fan')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'fan' ? 'bg-[#A46751] text-white shadow-md' : 'text-[#53433e] hover:text-[#1e1b18]'}`}
                            >
                                <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">palette</span> Color Fan</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Draping: If Locked, show mock images. Else show real or loading */}
            {isLocked ? (
                 <div className="relative max-w-5xl mx-auto cursor-pointer group overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20" onClick={handleUnlockClick}>
                    {/* Background Grid */}
                    <div className="grid grid-cols-2 h-[400px] md:h-[500px] relative">
                        {/* Left: Best Match Preview */}
                        <div className="relative overflow-hidden bg-gray-100">
                            <img 
                                src={displayUserImage || ''} 
                                alt="Locked Best" 
                                className="w-full h-full object-cover object-top blur-[6px] scale-105 transition-transform duration-1000 group-hover:scale-100" 
                            />
                            {/* Vibrant Overlay - Good Color */}
                            <div className="absolute inset-0 bg-emerald-900/30 mix-blend-multiply"></div>
                            <div className="absolute top-6 left-0 right-0 text-center z-10">
                                <span className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white/90 shadow-lg tracking-widest uppercase border border-white/10">
                                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#A46751]">auto_awesome</span> Best Match</span>
                                </span>
                            </div>
                        </div>

                        {/* Right: Worst Match Preview */}
                        <div className="relative overflow-hidden bg-gray-100">
                            <img 
                                src={displayUserImage || ''} 
                                alt="Locked Worst" 
                                className="w-full h-full object-cover object-top blur-[6px] scale-105 transition-transform duration-1000 group-hover:scale-100" 
                            />
                            {/* Dull Overlay - Bad Color */}
                            <div className="absolute inset-0 bg-yellow-900/40 mix-blend-multiply"></div>
                            <div className="absolute top-6 left-0 right-0 text-center z-10">
                                <span className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white/90 shadow-lg tracking-widest uppercase border border-white/10">
                                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-sm text-red-500">block</span> To Avoid</span>
                                </span>
                            </div>
                        </div>

                        {/* Central Divider - Soft Light */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
                    </div>

                    {/* Central Floating Lock UI - Enhanced Readability */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                        {/* Radial Shadow for text pop */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.4)_0%,_transparent_70%)] pointer-events-none"></div>
                        
                        <div className="text-center relative z-30 transform transition-transform duration-500 group-hover:scale-105">
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full inline-flex mb-5 ring-1 ring-white/40 shadow-2xl">
                                <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-xl tracking-tight leading-tight">
                                See the Difference
                            </h3>
                            <p className="text-white/90 text-lg mb-8 max-w-md mx-auto drop-shadow-md font-medium leading-relaxed">
                                Don&apos;t guess. Let AI show you exactly what works.
                            </p>
                            
                            <button className="group/btn relative inline-flex items-center gap-3 bg-white text-[#1e1b18] px-10 py-4 rounded-full font-bold text-lg shadow-[0_15px_30px_rgba(192,122,96,0.2)] transition-all overflow-hidden" onClick={handleUnlockClick}>
                                <span className="relative z-10">Unlock Visual Proof</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                                <span className="relative z-10 bg-[#A46751] text-white text-xs px-2 py-0.5 rounded ml-1">1 Credit</span>
                            </button>
                        </div>
                    </div>
                 </div>
            ) : viewMode === 'fan' ? (
                // Color Fan Mode
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    <ColorFan 
                        imageUrl={userImage} 
                        colors={powerPalette.colors || []} 
                        title="Best Matches" 
                    />
                    <ColorFan 
                        imageUrl={userImage} 
                        colors={dWorst || []} 
                        title="Avoid These" 
                    />
                </div>
            ) : (
                // AI Draping Mode (Existing Logic)
                <>
                {!displayDraping.best && !drapingError && (
                    <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] md:aspect-[2/1] bg-white/50 rounded-3xl border border-gray-100/50 flex flex-col items-center justify-center overflow-hidden my-12 shadow-sm backdrop-blur-sm">
                        <div className="relative z-10 text-center px-6 w-full max-w-md">
                            <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                            <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 tracking-tight">AI Stylist at Work</h4>
                            <p className="text-sm text-gray-500 font-medium animate-pulse min-h-[20px] transition-all duration-500 flex items-center justify-center gap-2 mb-4">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                {LOADING_TIPS[currentTipIndex]}
                            </p>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full animate-[progress_15s_ease-out_forwards] w-0"></div>
                            </div>
                        </div>
                    </div>
                )}

                {!displayDraping.best && drapingError && (
                    <div className="relative w-full max-w-3xl mx-auto py-12 px-6 flex flex-col items-center justify-center text-center bg-red-50/50 rounded-3xl border border-red-100 my-12">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-2">Generation Paused</h4>
                        <p className="text-sm text-gray-500 mb-6 max-w-md">{drapingError}</p>
                        <button 
                            onClick={handleGenerateDraping}
                            className="bg-[#2D2926] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {displayDraping.best && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    <div className="group relative">
                        <div className="absolute -inset-4 bg-green-100/50 rounded-[2rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
                        <div className="relative bg-white p-3 shadow-xl rounded-2xl">
                            <div className="w-full rounded-xl overflow-hidden relative bg-gray-50">
                                <img src={displayDraping.best} alt="Best" className="w-full h-auto max-h-[700px] object-contain mx-auto" />
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-green-100">
                                    <p className="text-xs font-bold uppercase tracking-wider text-green-800"><span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#A46751]">auto_awesome</span> Best Match</span></p>
                                </div>
                            </div>
                        </div>
                        <p className="text-center mt-6 font-serif italic text-gray-600">
                            &quot;Notice how your skin looks clearer and your eyes brighter.&quot;
                        </p>
                    </div>

                    <div className="group relative">
                        <div className="absolute -inset-4 bg-red-100/50 rounded-[2rem] rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
                        <div className="relative bg-white p-3 shadow-xl rounded-2xl hover:shadow-2xl transition-all">
                            <div className="w-full rounded-xl overflow-hidden relative bg-gray-50">
                                <img src={displayDraping.worst} alt="Worst" className="w-full h-auto max-h-[700px] object-contain mx-auto" />
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-red-100">
                                    <p className="text-xs font-bold uppercase tracking-wider text-red-800"><span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-sm text-red-500">block</span> To Avoid</span></p>
                                </div>
                            </div>
                        </div>
                        <p className="text-center mt-6 font-serif italic text-gray-600">
                            &quot;Colors that may wash you out or create shadows.&quot;
                        </p>
                    </div>
                </div>
                )}
                </>
            )}

            {/* 3. The Curator's Palette */}
            {dPalette && (
                <div id="palette" className="bg-white/45 backdrop-blur-md p-10 md:p-16 rounded-[3rem] glass-card soft-shadow border border-white/50 relative overflow-hidden scroll-mt-20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#A46751]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    
                    <div className="text-center mb-16 relative z-10">
                        <h2 className="text-4xl font-serif font-bold mb-4 text-[#1e1b18]">Your Power Palette</h2>
                        <p className="text-[#53433e] max-w-xl mx-auto font-sans">
                            A curated selection of shades that harmonize perfectly with your natural coloring.
                        </p>
                    </div>

                    <div className="space-y-16 relative z-10">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="h-px flex-1 bg-[#d8c2bb]/30"></span>
                                <h3 className="font-serif text-2xl font-bold italic text-[#1e1b18]">Power Colors</h3>
                                <span className="h-px flex-1 bg-[#d8c2bb]/30"></span>
                            </div>
                            
                            {powerPalette.usage_advice && (
                                <div className="bg-[#fff8f5] p-6 rounded-2xl border border-[#A46751]/10 mb-8 text-center">
                                    <p className="text-[#1e1b18] font-medium italic leading-relaxed font-sans">
                                        &quot;{powerPalette.usage_advice}&quot;
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
                                {/* Visible Colors (1st one) */}
                                {powerPalette.colors.map((color: any, idx: number) => (
                                    <div key={idx} className="group">
                                        <div className="aspect-square rounded-2xl shadow-md transition-transform group-hover:-translate-y-2 relative overflow-hidden" style={{backgroundColor: color.hex}}>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <div className="text-center mt-3">
                                            <p className="font-bold text-[#2D2926]">{color.name}</p>
                                            <p className="text-xs text-gray-400 uppercase tracking-widest">{color.hex}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Blurred/Locked Colors (Simulated Variety) */}
                                {isLocked && ['#FFB7B2', '#B5EAD7', '#C7CEEA'].map((mockColor, i) => (
                                    <div key={`locked-${i}`} className="opacity-60 blur-[4px] select-none pointer-events-none grayscale-[30%]">
                                        <div className="aspect-square rounded-2xl shadow-sm" style={{backgroundColor: mockColor}}></div>
                                        <div className="text-center mt-3 space-y-2">
                                            <div className="h-4 w-20 bg-gray-200/50 rounded mx-auto"></div>
                                            <div className="h-3 w-12 bg-gray-100/50 rounded mx-auto"></div>
                                        </div>
                                    </div>
                                ))}

                                {isLocked && (
                                     <div className="absolute inset-0 left-[25%] flex items-center justify-center z-10" onClick={handleUnlockClick}>
                                        <div className="bg-[#A46751] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 cursor-pointer hover:bg-[#a5644b] transition-all transform hover:scale-105 ring-4 ring-white/50">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            <span className="text-xs font-bold tracking-wide uppercase font-sans">Unlock Personalized Palette</span>
                                        </div>
                                     </div>
                                )}
                            </div>
                        </div>

                        <BlurLock label="Unlock Full Palette">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="font-serif text-xl font-bold mb-4 text-gray-800 border-b pb-2">Essentials / Neutrals</h3>
                                {neutralPalette.usage_advice && <p className="text-sm text-gray-500 italic mb-6">{neutralPalette.usage_advice}</p>}
                                <div className="space-y-3">
                                    {neutralPalette.colors.map((color: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 group cursor-default">
                                            <div className="w-12 h-12 rounded-full shadow-sm border-2 border-white ring-1 ring-gray-100" style={{backgroundColor: color.hex}}></div>
                                            <div>
                                                <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">{color.name}</p>
                                                <p className="text-xs text-gray-400 uppercase">{color.hex}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-serif text-xl font-bold mb-4 text-gray-800 border-b pb-2">Soft / Pastels</h3>
                                {pastelPalette.usage_advice && <p className="text-sm text-gray-500 italic mb-6">{pastelPalette.usage_advice}</p>}
                                <div className="flex flex-wrap gap-3">
                                    {pastelPalette.colors.map((color: any, idx: number) => (
                                        <div key={idx} className="flex flex-col items-center w-20">
                                            <div className="w-16 h-16 rounded-full shadow-sm border border-gray-100 mb-2" style={{backgroundColor: color.hex}}></div>
                                            <p className="text-[10px] text-center text-gray-500 leading-tight">{color.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        </BlurLock>

                        {dWorst && dWorst.length > 0 && (
                            <div className="mt-16 pt-12 border-t border-dashed border-gray-200">
                                <div className="text-center mb-10">
                                    <h3 className="font-serif text-2xl font-bold text-red-800 flex items-center justify-center gap-2">
                                        <span className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-red-500">block</span> Colors to Avoid</span>
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-2">Shades that may conflict with your natural undertones.</p>
                                </div>
                                <BlurLock label="Unlock to Avoid Mistakes">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {dWorst.map((color: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 bg-red-50/50 p-4 rounded-xl border border-red-100">
                                            <div className="w-12 h-12 rounded-full border border-white shadow-sm shrink-0" style={{backgroundColor: color.hex}}></div>
                                            <div>
                                                <p className="font-bold text-gray-900">{color.name}</p>
                                                <p className="text-xs text-gray-500 leading-tight mt-0.5">{color.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                </BlurLock>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 4. Beauty & Style */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Makeup */}
                <div id="makeup" className="lg:col-span-7 bg-white/45 backdrop-blur-md p-8 md:p-12 rounded-[2rem] glass-card soft-shadow border border-white/50 scroll-mt-20">
                    <h3 className="font-serif text-3xl font-bold mb-6 flex items-center gap-3 text-[#1e1b18]">
                        <span className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-4xl text-[#A46751]">face</span> Makeup Lab</span>
                    </h3>
                    
                    <div className="bg-[#fff8f5] p-6 rounded-xl border border-[#A46751]/10 mb-8">
                        <p className="text-lg text-[#1e1b18] font-medium leading-relaxed italic font-sans">
                            &quot;{dMakeup?.summary || 'Opt for cool, deep shades to complement your high contrast.'}&quot;
                        </p>
                    </div>

                    {/* Curated Cosmetics Colors Grid (Stitch style) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {/* Lips */}
                        <div className="glass-card rounded-2xl p-5 flex flex-col items-center text-center bg-white/50 border border-white/80">
                            <span className="material-symbols-outlined text-2xl text-[#A46751] mb-2 font-sans">face</span>
                            <h4 className="font-sans text-xs font-bold text-[#1e1b18] uppercase tracking-wider mb-2">Lips</h4>
                            <div className="flex gap-2 mb-3">
                                {(displayReport.makeup?.lips || [
                                    { hex: "#6B0D1A" }, { hex: "#8B0000" }, { hex: "#4A0404" }
                                ]).slice(0, 3).map((item: any, idx: number) => (
                                    <div key={idx} className="w-8 h-8 rounded-full border border-white shadow-inner" style={{ backgroundColor: item.hex }} title={item.name} />
                                ))}
                            </div>
                            <p className="text-[11px] text-[#53433e] leading-snug opacity-90">Deep berries, burgundy, and true reds complement your tone.</p>
                        </div>
                        {/* Eyes */}
                        <div className="glass-card rounded-2xl p-5 flex flex-col items-center text-center bg-white/50 border border-white/80">
                            <span className="material-symbols-outlined text-2xl text-[#A46751] mb-2 font-sans">visibility</span>
                            <h4 className="font-sans text-xs font-bold text-[#1e1b18] uppercase tracking-wider mb-2">Eyes</h4>
                            <div className="flex gap-2 mb-3">
                                {(displayReport.makeup?.eyes || [
                                    { hex: "#1A1A1A" }, { hex: "#2F4F4F" }, { hex: "#483D8B" }
                                ]).slice(0, 3).map((item: any, idx: number) => (
                                    <div key={idx} className="w-8 h-8 rounded-full border border-white shadow-inner" style={{ backgroundColor: item.hex }} title={item.name} />
                                ))}
                            </div>
                            <p className="text-[11px] text-[#53433e] leading-snug opacity-90">Charcoal, deep navy, and icy taupe create striking definition.</p>
                        </div>
                        {/* Cheeks */}
                        <div className="glass-card rounded-2xl p-5 flex flex-col items-center text-center bg-white/50 border border-white/80">
                            <span className="material-symbols-outlined text-2xl text-[#A46751] mb-2 font-sans">brush</span>
                            <h4 className="font-sans text-xs font-bold text-[#1e1b18] uppercase tracking-wider mb-2">Cheeks</h4>
                            <div className="flex gap-2 mb-3">
                                {(displayReport.makeup?.blush || [
                                    { hex: "#9E4244" }, { hex: "#C71585" }, { hex: "#800080" }
                                ]).slice(0, 3).map((item: any, idx: number) => (
                                    <div key={idx} className="w-8 h-8 rounded-full border border-white shadow-inner" style={{ backgroundColor: item.hex }} title={item.name} />
                                ))}
                            </div>
                            <p className="text-[11px] text-[#53433e] leading-snug opacity-90">Plum, deep rose, and cool magenta add a natural flush.</p>
                        </div>
                    </div>

                    <BlurLock label="Unlock Makeup Guide">
                    <div className="space-y-6">
                        {dMakeup?.specific_products?.map((prod: any, i: number) => (
                            <div key={i} className="flex items-center gap-5 p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
                                <div className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-xl shrink-0">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{prod.category}</p>
                                    <p className="font-bold text-lg text-gray-900">{prod.shade}</p>
                                    <p className="text-sm text-gray-500 mt-1">{prod.recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Brand Matches Section */}
                    {(displayReport.makeup?.lips || displayReport.makeup?.blush || displayReport.makeup?.eyes) && (
                        <div className="mt-10 pt-8 border-t border-gray-100">
                            <h4 className="font-serif text-xl font-bold mb-6 text-gray-800">Top Brand Picks</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    ...(displayReport.makeup?.lips || []).map((item: any) => ({ ...item, type: 'Lip' })),
                                    ...(displayReport.makeup?.blush || []).map((item: any) => ({ ...item, type: 'Blush' })),
                                    ...(displayReport.makeup?.eyes || []).map((item: any) => ({ ...item, type: 'Eye' }))
                                ].map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm shrink-0" style={{backgroundColor: item.hex}}></div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.type} • {item.name}</p>
                                            <p className="text-sm font-medium text-gray-900 truncate" title={item.brand_hint}>{item.brand_hint}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    </BlurLock>
                </div>

                {/* Styling */}
                <div id="styling" className="lg:col-span-5 space-y-8 scroll-mt-20">
                    {/* Hair Card */}
                    {dHair && (
                        <div id="hair" className="bg-[#2d2926] text-white p-8 rounded-[2rem] shadow-lg relative overflow-hidden scroll-mt-20 border border-white/10">
                            <div className="relative z-10">
                                <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-[#A46751]">face_retouching_natural</span> Hair Color</span>
                                </h3>
                                <BlurLock label="Unlock Hair Colors">
                                <div className="space-y-4">
                                    {dHair.map((hair: any, i: number) => (
                                        <div key={i} className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                                            <p className="font-bold text-[#D4A5A5] mb-1">{hair.color}</p>
                                            <p className="text-sm text-gray-300 leading-snug font-sans">{hair.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                </BlurLock>
                            </div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4A5A5]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        </div>
                    )}

                    {/* Metal Card */}
                    <div className="bg-white/45 backdrop-blur-md text-[#1e1b18] p-8 rounded-[2rem] glass-card soft-shadow border border-white/50 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-serif text-2xl font-bold mb-4">Best Metals</h3>
                            <div className="flex flex-wrap gap-3">
                                {dStyling?.metals?.map((m: string, i: number) => (
                                    <span key={i} className="px-4 py-2 bg-[#F5F0E8] rounded-lg text-sm font-medium border border-white/40 shadow-sm font-sans">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Keywords Card */}
                    <div className="bg-white/45 backdrop-blur-md p-8 rounded-[2rem] glass-card soft-shadow border border-white/50 text-[#1e1b18]">
                        <h3 className="font-serif text-2xl font-bold mb-6">Style Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                            {dStyling?.keywords?.map((k: string, i: number) => (
                                <span key={i} className="px-4 py-2 bg-[#F5F0E8] text-[#53433e] rounded-full text-sm font-medium hover:bg-[#A46751] hover:text-white transition-all cursor-default font-sans">
                                    #{k}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Section - Only for Owner */}
            {isOwner && !isLocked && (
            <div id="main-feedback" className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 text-center">
                <h3 className="text-xl font-serif font-bold text-[#2D2926] mb-6">Was this analysis helpful?</h3>
                
                {feedbackStatus === 'idle' && (
                    <div className="flex justify-center gap-8">
                        <button 
                            onClick={() => handleFeedback('good')} 
                            className="group flex flex-col items-center gap-2 transition-transform hover:scale-110"
                        >
                            <span className="text-4xl bg-green-50 p-4 rounded-full border border-green-100 group-hover:bg-green-100 transition-colors flex items-center justify-center w-16 h-16"><span className="material-symbols-outlined text-3xl text-green-600">thumb_up</span></span>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-green-600">Yes</span>
                        </button>
                        <button 
                            onClick={() => handleFeedback('bad')} 
                            className="group flex flex-col items-center gap-2 transition-transform hover:scale-110"
                            >
                                <span className="text-4xl bg-red-50 p-4 rounded-full border border-red-100 group-hover:bg-red-100 transition-colors flex items-center justify-center w-16 h-16"><span className="material-symbols-outlined text-3xl text-red-600">thumb_down</span></span>
                                <span className="text-xs font-bold text-gray-400 group-hover:text-red-600">No</span>
                            </button>
                        </div>
                    )}

                    {feedbackStatus === 'good' && (
                        <div className="animate-fade-in py-4">
                            <p className="text-green-600 font-bold text-2xl mb-2">Thank you! <span className="material-symbols-outlined text-sm align-middle text-[#A46751]">auto_awesome</span></p>
                            <p className="text-gray-500">We&apos;re glad you liked your results.</p>
                        </div>
                    )}

                    {feedbackStatus === 'bad' && (
                        <div className="animate-fade-in text-left max-w-md mx-auto">
                            <p className="text-gray-700 font-medium mb-3 text-center">We&apos;re sorry to hear that. How can we improve?</p>
                            <textarea 
                                className="w-full p-4 border border-gray-200 rounded-2xl mb-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="E.g., Skin tone analysis was off, Colors don't match..."
                                rows={3}
                                value={feedbackComment}
                                onChange={(e) => setFeedbackComment(e.target.value)}
                            />
                            <div className="text-center">
                                <button 
                                    onClick={submitComment}
                                    className="bg-[#2D2926] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-md"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </div>
                    )}

                    {feedbackStatus === 'submitted' && (
                        <div className="py-6 animate-fade-in">
                            <p className="text-gray-500 font-medium mb-4">Thank you for your feedback!</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a 
                                    href={`https://twitter.com/intent/tweet?text=I%20just%20found%20out%20my%20seasonal%20color%20is%20${report?.season || 'amazing'}!%20Discover%20yours:&url=https://coloranalysisquiz.app`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <span>Share on 𝕏</span>
                                </a>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Link copied!");
                                    }}
                                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors shadow-sm"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                )}

                {/* CTA */}
                <div className="text-center py-16 border-t border-gray-200/50 mt-8">
                    <Link 
                        href={getLinkHref(locale, 'analysis')}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-[#2D2926] text-white rounded-full text-lg font-bold hover:bg-primary transition-colors shadow-xl"
                    >
                        <span>Analyze Another Photo</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

            </div>
        </main>
        <Footer locale={locale} page={'report'} />

        {/* Sticky Bottom Feedback Bar */}
        {isOwner && !isLocked && feedbackStatus === 'idle' && !isMainFeedbackVisible && hasSeenContent && drapingImages.best && (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl animate-slide-up transition-transform duration-500">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2D2926] mr-2">Was this helpful?</span>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleFeedback('good')} 
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2D2926] text-white rounded-full font-bold text-sm hover:bg-primary transition-colors shadow-sm"
                        >
                            <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">thumb_up</span> Yes</span>
                        </button>
                        <button 
                            onClick={() => handleFeedback('bad')} 
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">thumb_down</span> No</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Sticky Unlock Bar (For Locked State) */}
        {isLocked && (
             <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/80 backdrop-blur-md border-t border-white/40 shadow-[0_-8px_30px_rgba(192,122,96,0.1)] animate-slide-up pb-safe">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-[#1e1b18] font-sans">Your analysis is complete!</p>
                        <p className="text-xs text-[#53433e] font-sans">Unlock your personalized palette & style guide.</p>
                    </div>
                    <button 
                        onClick={handleUnlockClick}
                        className="flex-1 md:flex-none bg-[#A46751] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#a5644b] scale-95 hover:scale-100 transition-all shadow-md hover:shadow-[0_8px_20px_rgba(192,122,96,0.2)] flex items-center justify-center gap-2 font-sans"
                    >
                        <span>Unlock full {baseSeason || 'Report'}</span>
                        <span className="text-[#ffdad9] bg-white/10 px-2 py-0.5 rounded ml-1">1 Credit</span>
                    </button>
                </div>
             </div>
        )}
    </>
  )
}