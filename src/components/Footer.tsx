'use client'
import Link from "next/link";
import {getLinkHref} from "~/configs/buildLink";
import {useCommonContext} from "~/context/common-context";
import {GoogleAnalytics} from "@next/third-parties/google";

export default function Footer({
                                 locale,
                                 page,
                               }) {
  const {
    userData,
    setShowLoadingModal,
    commonText,
    menuText,
  } = useCommonContext();

  const manageSubscribe = async () => {
    if (!userData?.user_id) {
      return
    }
    const user_id = userData?.user_id;
    const requestData = {
      user_id: user_id
    }
    setShowLoadingModal(true);
    const responseData = await fetch(`/api/stripe/create-portal-link`, {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    const result = await responseData.json();
    setShowLoadingModal(false);
    if (result.url) {
      window.location.href = result.url;
    }
  }

  const checkPageAndLoading = (toPage) => {
    if (page != toPage) {
      setShowLoadingModal(true);
    }
  }

  return (
    <footer aria-labelledby="footer-heading" className="bg-[#1A1A2E]">
      <div id="footer-heading" className="sr-only">
        Footer
      </div>
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link
              href={getLinkHref(locale, '')}
              className="flex items-center gap-2"
            >
               <span className="font-serif text-2xl font-bold text-white tracking-tight">
                Color Analysis <span className="text-primary-light">Quiz</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              {commonText.footerDescText}
            </p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <div className="text-sm font-semibold leading-6 text-white"></div>
                <ul role="list" className="mt-6 space-y-4">

                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <div className="text-sm font-semibold leading-6 text-white"></div>
                <ul role="list" className="mt-6 space-y-4">
                  <span className="text-sm leading-6 text-gray-500">
                    &copy; {new Date().getFullYear()} Color Analysis Quiz. All rights reserved.
                  </span>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <div
                  className="text-sm font-semibold leading-6 text-white">
                  {process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME == '0' ? '' : menuText.footerSupport}
                </div>
                <ul role="list" className="mt-6 space-y-4">
                  {
                    process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME != '0' ?
                      <li>
                        <Link
                          href={getLinkHref(locale, 'pricing')}
                          className="text-sm leading-6 text-gray-300 hover:text-[#2d6ae0]"
                          onClick={()=>checkPageAndLoading('pricing')}
                        >
                          {menuText.footerSupport0}
                        </Link>
                      </li>
                      :
                      null
                  }
                  {
                    userData && process.env.NEXT_PUBLIC_CHECK_AVAILABLE_TIME != '0' ?
                      <li>
                        <a
                          onClick={() => manageSubscribe()}
                          className="cursor-pointer text-sm leading-6 text-gray-300 hover:text-[#2d6ae0]">
                          {menuText.footerSupport1}
                        </a>
                      </li>
                      :
                      null
                  }
                  <li>
                    <a
                      href="mailto:support@coloranalysisquiz.app"
                      className="text-sm leading-6 text-gray-300 hover:text-[#2d6ae0]"
                    >
                      Contact: support@coloranalysisquiz.app
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <div className="text-sm font-semibold leading-6 text-white">{menuText.footerLegal}</div>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link
                      href={getLinkHref(locale, 'privacy-policy')}
                      className="text-sm leading-6 text-gray-300 hover:text-[#2d6ae0]"
                      onClick={()=>checkPageAndLoading('privacy-policy')}
                    >
                      {menuText.footerLegal0}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={getLinkHref(locale, 'terms-of-service')}
                      className="text-sm leading-6 text-gray-300 hover:text-[#2d6ae0]"
                      onClick={()=>checkPageAndLoading('terms-of-service')}
                    >
                      {menuText.footerLegal1}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <>
        {
          process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ?
            <>
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}/>
            </>
            :
            null
        }
      </>
    </footer>
  )
}
