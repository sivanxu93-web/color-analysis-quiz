'use client'
import Link from "next/link";
import {getLinkHref} from "~/configs/buildLink";
import {useCommonContext} from "~/context/common-context";

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
    <footer aria-labelledby="footer-heading" className="bg-[#2D2926]">
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
            <div className="flex flex-col gap-1 text-sm text-gray-400">
                <span className="font-semibold text-white">Need Help?</span>
                <a href="mailto:support@coloranalysisquiz.app" className="hover:text-primary transition-colors">
                    support@coloranalysisquiz.app
                </a>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <a href="https://findly.tools/color-analysis-quiz?utm_source=color-analysis-quiz" target="_blank" rel="noopener noreferrer" className="inline-block opacity-70 hover:opacity-100 transition-opacity">
                <img src="https://findly.tools/badges/findly-tools-badge-light.svg" alt="Featured on Findly.tools" width="150" height="47" loading="lazy" decoding="async" />
              </a>
              <a href="https://theresanaiforthat.com/ai/ai-color-analysis-quiz/?ref=featured&v=7972629" target="_blank" rel="nofollow" className="inline-block opacity-70 hover:opacity-100 transition-opacity">
                <img src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600" alt="Featured on TheresAnAIForThat" width="150" height="51" loading="lazy" decoding="async" />
              </a>
              <a href="https://turbo0.com/item/color-analysis-quiz" target="_blank" rel="noopener noreferrer" className="inline-block opacity-70 hover:opacity-100 transition-opacity">
                <img src="https://img.turbo0.com/badge-listed-light.svg" alt="Listed on Turbo0" width="150" height="54" loading="lazy" decoding="async" className="h-[54px] w-auto" />
              </a>
              <a href="https://www.toolpilot.ai" target="_blank" rel="noopener noreferrer" className="inline-block opacity-70 hover:opacity-100 transition-opacity">
                <img src="https://www.toolpilot.ai/cdn/shop/files/toolpilot-badge-w.png" alt="Featured on ToolPilot" width="150" height="51" loading="lazy" decoding="async" className="h-[51px] w-auto" />
              </a>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <div className="text-sm font-semibold leading-6 text-white">{menuText.header4} & {menuText.header5}</div>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link
                      href={getLinkHref(locale, 'blog')}
                      className="text-sm leading-6 text-gray-300 hover:text-primary"
                    >
                      {menuText.header4}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={getLinkHref(locale, 'examples')}
                      className="text-sm leading-6 text-gray-300 hover:text-primary"
                    >
                      {menuText.header5}
                    </Link>
                  </li>
                </ul>
              </div>
            <div className="mt-10 md:mt-0">
                <div className="text-sm font-semibold leading-6 text-white">© {new Date().getFullYear()}</div>
                <div className="mt-6">
                  <p className="text-sm leading-6 text-gray-400">
                    Color Analysis Quiz. All rights reserved.
                  </p>
                </div>
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
                          className="text-sm leading-6 text-gray-300 hover:text-primary"
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
                          className="cursor-pointer text-sm leading-6 text-gray-300 hover:text-primary">
                          {menuText.footerSupport1}
                        </a>
                        </li>
                        :
                        null
                        }
                        </ul>
                        </div>
                        <div className="mt-10 md:mt-0">
                        <div className="text-sm font-semibold leading-6 text-white">{menuText.footerLegal}</div>
                        <ul role="list" className="mt-6 space-y-4">
                        <li>
                        <Link
                        href={getLinkHref(locale, 'privacy-policy')}
                        className="text-sm leading-6 text-gray-300 hover:text-primary"
                        >
                        {menuText.footerLegal0}
                        </Link>
                        </li>
                        <li>
                        <Link
                        href={getLinkHref(locale, 'terms-of-service')}
                        className="text-sm leading-6 text-gray-300 hover:text-primary"
                        >
                        {menuText.footerLegal1}
                        </Link>                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
