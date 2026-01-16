'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { useCommonContext } from '~/context/common-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLinkHref } from '~/configs/buildLink';
import { useRouter } from 'next/navigation';

export default function PageComponent({
  locale,
  colorLabText,
}: {
  locale: string;
  colorLabText: any;
}) {
  const { userData, setShowLoginModal, setShowLogoutModal } = useCommonContext();
  const [history, setHistory] = useState<any[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // If user is definitely not logged in (and checking is done), redirect or show modal
    if (!userData?.email && process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN !== '0') {
       // Wait a bit for auth to settle
       const timer = setTimeout(() => {
           if (!userData?.email) {
               router.push(getLinkHref(locale, ''));
           }
       }, 1000);
       return () => clearTimeout(timer);
    }

    if (userData?.email) {
        fetchHistory();
        fetchCredits();
    }
  }, [userData?.email]);

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
                        {history.map((item) => (
                            <Link 
                                key={item.session_id} 
                                href={getLinkHref(locale, `report/${item.session_id}`)}
                                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#E8E1D9] hover:-translate-y-1"
                            >
                                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.season} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                        <h3 className="text-2xl font-serif font-bold leading-tight">
                                            {item.season}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-4 bg-white">
                                    <p className="text-sm text-gray-500 line-clamp-2">
                                        {item.headline || "Check out your personalized color report."}
                                    </p>
                                    <p className="mt-3 text-primary text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                        View Report →
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
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
