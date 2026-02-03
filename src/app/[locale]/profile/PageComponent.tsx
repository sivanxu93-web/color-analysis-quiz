'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { useCommonContext } from '~/context/common-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function PageComponent({
  locale,
  colorLabText,
}: {
  locale: string;
  colorLabText: any;
}) {
  const { userData, setShowLoginModal, setShowLogoutModal } = useCommonContext();
  const { status } = useSession();
  const [history, setHistory] = useState<any[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' && process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN !== '0') {
        router.push(getLinkHref(locale, ''));
    }

    if (status === 'authenticated' && userData?.email) {
        fetchHistory();
        fetchCredits();
    }
  }, [status, userData?.email]);

  const fetchHistory = async () => {
    try {
        const res = await fetch('/api/color-lab/history', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: userData.email })
        });
        const json = await res.json();
        if (json.success) {
            setHistory(json.data);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const fetchCredits = async () => {
      if (!userData?.user_id) return;
      try {
          const res = await fetch(`/api/user/getAvailableTimes?userId=${userData.user_id}`);
          const json = await res.json();
          setCredits(json.available_times);
      } catch (e) {
          console.error(e);
      }
  };

      const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
          e.preventDefault(); // Prevent navigation
          if (!confirm("Are you sure you want to delete this report?")) return;
  
          try {
              const res = await fetch('/api/color-lab/history/delete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ sessionId, email: userData.email })
              });
              if (res.ok) {
                  setHistory(prev => prev.filter(h => h.sessionId !== sessionId));
              } else {
                  alert("Failed to delete.");
              }
          } catch (error) {
              console.error(error);
          }
      };
  
      return (
      <>
        <Header locale={locale} page={'profile'} />
        <main className="min-h-screen bg-[#FFFBF7] py-12 md:py-20 px-4">
           <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
              
              {/* User Profile Card */}
              <div className="bg-white rounded-[2rem] p-6 md:p-12 shadow-sm border border-[#E8E1D9] flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                  <div className="relative group">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                      {userData?.image ? (
                          <img src={userData.image} alt="User" className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover" />
                      ) : (
                          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center text-4xl">👤</div>
                      )}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left space-y-4 w-full">
                      <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1A2E]">
                          Hello, {userData?.name || 'Guest'}
                      </h1>
                      <p className="text-gray-500 text-sm md:text-base">{userData?.email}</p>
                      
                      <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start pt-2 w-full">
                          <div className="px-6 py-2 bg-primary/5 rounded-full border border-primary/10 text-primary font-bold text-sm md:text-base">
                              💎 {credits !== null ? credits : '-'} Credits Available
                          </div>
                          <button 
                              onClick={() => setShowLogoutModal(true)}
                              className="px-6 py-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors text-sm font-medium w-full md:w-auto"
                          >
                              Log Out
                          </button>
                      </div>
                  </div>
              </div>
  
              {/* History Grid */}
              <div>
                  <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-serif font-bold text-[#1A1A2E]">Your Analysis History</h2>
                      <Link href={getLinkHref(locale, 'analysis')} className="text-primary font-bold hover:underline">
                          + New Analysis
                      </Link>
                  </div>
  
                  {loading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                          {[1,2,3].map(i => (
                              <div key={i} className="aspect-[4/5] bg-white rounded-2xl animate-pulse shadow-sm"></div>
                          ))}
                      </div>
                  ) : history.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                          {history.map((item) => {
                              const isLocked = item.status === 'draft' || item.status === 'protected';
                              return (
                                  <Link 
                                      key={item.sessionId} 
                                      href={getLinkHref(locale, `report/${item.sessionId}`)}
                                      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#E8E1D9] hover:-translate-y-1 relative"
                                  >
                                      {/* Delete Button */}
                                      <button 
                                          onClick={(e) => handleDelete(e, item.sessionId)}
                                          className="absolute top-2 right-2 z-20 p-2 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                                          title="Delete Report"
                                      >
                                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                      </button>
  
                                      <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                                          {item.imageUrl ? (
                                              <img src={item.imageUrl} alt="Analysis" className={`w-full h-full object-cover transition-transform duration-700 ${isLocked ? 'blur-sm grayscale group-hover:grayscale-0 group-hover:blur-0' : 'group-hover:scale-105'}`} />
                                          ) : (
                                              <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                          )}
                                          
                                          <div className={`absolute inset-0 bg-gradient-to-t opacity-60 transition-opacity ${isLocked ? 'from-black/80 to-black/20' : 'from-black/60 to-transparent group-hover:opacity-40'}`}></div>
                                          
                                          {isLocked && (
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                  <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full text-white font-bold text-sm flex items-center gap-2 shadow-lg">
                                                      <span>🔒</span> Unlock Report
                                                  </div>
                                              </div>
                                          )}
  
                                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                              <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">
                                                  {new Date(item.createdAt).toLocaleDateString()}
                                              </p>
                                              <h3 className="text-2xl font-serif font-bold leading-tight">
                                                  {isLocked ? "Analysis Ready" : (item.season || "Unknown Season")}
                                              </h3>
                                          </div>
                                      </div>
                                      <div className="p-4 bg-white">
                                          <p className="text-sm text-gray-500 line-clamp-2">
                                              {isLocked 
                                                  ? "Your personalized report is waiting to be unlocked. Click to view results." 
                                                  : "View your full color analysis report and styling guide."}
                                          </p>
                                          <p className={`mt-3 text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 ${isLocked ? 'text-[#1A1A2E]' : 'text-primary'}`}>
                                              {isLocked ? "Unlock Now →" : "View Report →"}
                                          </p>
                                      </div>
                                  </Link>
                              );
                          })}
                      </div>                ) : (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <div className="text-6xl mb-4">🎨</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No analysis yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Upload your photo to discover your seasonal colors and get personalized style advice.</p>
                        <Link 
                            href={getLinkHref(locale, 'analysis')}
                            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-primary-hover transition-all"
                        >
                            Start Your First Analysis
                        </Link>
                    </div>
                )}
            </div>

         </div>
      </main>
      <Footer locale={locale} page={'profile'} />
    </>
  )
}