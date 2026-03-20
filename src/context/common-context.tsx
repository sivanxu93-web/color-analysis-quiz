'use client';
import {createContext, useContext, useState, useEffect} from "react";
import {useSession} from "next-auth/react";

const CommonContext = createContext(undefined);

export const CommonProvider = ({
                                 children,
                                 commonText,
                                 authText,
                                 menuText,
                                 pricingText
                               }) => {

  const {data: session, status} = useSession();
  const [userData, setUserData] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [availableTimes, setAvailableTimes] = useState({
    available_times: 0,
    subscription_credits: 0,
    permanent_credits: 0,
    subscription_status: 'none',
    subscription_plan: null,
    subscription_billing_cycle: null,
    current_period_end: null,
    validator_times: 0,
  });

  const refreshAvailableTimes = async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/user/getAvailableTimes?userId=${userId}`);
      const data = await response.json();
      setAvailableTimes(data);
    } catch (e) {
      console.error("Error fetching credits", e);
    }
  };

  // Capture coupon and UTMs from URL and persist them
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      const coupon = params.get('coupon');
      if (coupon) {
        localStorage.setItem('active_coupon', coupon);
      }

      // Capture Google Ads and UTM parameters
      const gclid = params.get('gclid');
      const utm_source = params.get('utm_source');
      
      if (gclid) {
        localStorage.setItem('utm_source', 'google_ads_gclid');
      } else if (utm_source) {
        localStorage.setItem('utm_source', utm_source);
      }
    }
  }, []);

  // Sync userData with Session
  useEffect(() => {
    // @ts-ignore
    const sessionUserId = session?.user?.user_id || session?.user?.id;

    if (status === 'authenticated' && sessionUserId) {
      const newUserData = {
        user_id: sessionUserId,
        name: session?.user?.name,
        email: session?.user?.email,
        image: session?.user?.image,
      };
      
      // Only update if data actually changed to avoid infinite loops (optional but good practice)
      // For now, just set it.
      setUserData(newUserData);
      
      // Auto-close login modal if it was open
      if (showLoginModal) setShowLoginModal(false);

      // Fetch available times
      refreshAvailableTimes(sessionUserId);
    } else if (status === 'unauthenticated') {
        setUserData({});
        setAvailableTimes({
          available_times: 0,
          subscription_credits: 0,
          permanent_credits: 0,
          subscription_status: 'none',
          subscription_plan: null,
          subscription_billing_cycle: null,
          current_period_end: null,
          validator_times: 0,
        });
    }
  }, [session, status]);

  return (
    <CommonContext.Provider
      value={{
        userData,
        setUserData,
        availableTimes,
        refreshAvailableTimes,
        showLoginModal,
        setShowLoginModal,
        showLogoutModal,
        setShowLogoutModal,
        showLoadingModal,
        setShowLoadingModal,
        showGeneratingModal,
        setShowGeneratingModal,
        showPricingModal,
        setShowPricingModal,
        commonText,
        authText,
        menuText,
        pricingText,
      }}
    >
      {children}
    </CommonContext.Provider>
  );

}

export const useCommonContext = () => useContext(CommonContext)
