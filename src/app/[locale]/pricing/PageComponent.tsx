'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Pricing from "~/components/PricingComponent";
import {useEffect, useRef, useState, Suspense} from "react";
import TopBlurred from "~/components/TopBlurred";
import {useCommonContext} from "~/context/common-context";
import { useSearchParams } from 'next/navigation';


const PricingPageInner = ({
                         locale,
                       }) => {
  const [pagePath] = useState('pricing');
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const {
    setShowLoadingModal,
    pricingText
  } = useCommonContext();

  const useCustomEffect = (effect, deps) => {
    const isInitialMount = useRef(true);

    useEffect(() => {
      if (process.env.NODE_ENV === 'production' || isInitialMount.current) {
        isInitialMount.current = false;
        return effect();
      }
    }, deps);
  };

  useCustomEffect(() => {
    setShowLoadingModal(false);
    return () => {
    }
  }, []);

  return (
    <>
      <HeadInfo
        locale={locale}
        page={pagePath}
        title={pricingText.title}
        description={pricingText.description}
      />
      <Header
        locale={locale}
        page={pagePath}
      />
      <div className={"mt-8 my-auto min-h-[90vh]"}>
        <TopBlurred/>
        <Pricing
          redirectUrl={redirectParam || `${locale}/pricing`}
          isPricing={true}
        />
      </div>
      <Footer
        locale={locale}
        page={pagePath}
      />
    </>
  )
}

const PageComponent = ({ locale }) => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFBF7]" />}>
      <PricingPageInner locale={locale} />
    </Suspense>
  );
};

export default PageComponent
