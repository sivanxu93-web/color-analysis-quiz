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

  // Capture coupon from URL and persist it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const coupon = params.get('coupon');
      if (coupon) {
        localStorage.setItem('active_coupon', coupon);
        console.log("Coupon captured and saved:", coupon);
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
    } else if (status === 'unauthenticated') {
        setUserData({});
    }
  }, [session, status]);

  return (
    <CommonContext.Provider
      value={{
        userData,
        setUserData,
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
