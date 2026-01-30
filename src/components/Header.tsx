'use client'
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Link from "next/link";
import { languages } from "~/i18n/config";
import { useCommonContext } from '~/context/common-context'
import LoadingModal from "./LoadingModal";
import GeneratingModal from "~/components/GeneratingModal";
import LoginButton from './LoginButton';
import LoginModal from './LoginModal';
import LogoutModal from "./LogoutModal";
import { getLinkHref } from "~/configs/buildLink";
import { usePathname } from 'next/navigation';

export default function Header({
  locale,
  page
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const {
    userData,
    commonText,
    authText,
    menuText
  } = useCommonContext();

  const pathname = usePathname();

  const checkLocalAndLoading = (lang) => {
    setMobileMenuOpen(false);
  }

  const checkPageAndLoading = (toPage) => {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFBF7]/90 backdrop-blur-lg border-b border-[#E8E1D9]">
      <LoadingModal loadingText={commonText.loadingText} />
      <GeneratingModal generatingText={commonText.generateText} />
      <LoginModal
        loadingText={commonText.loadingText}
        redirectPath={pathname}
        loginModalTitle={authText.loginModalTitle}
        loginModalDesc={authText.loginModalDesc}
        loginModalButtonText={authText.loginModalButtonText}
      />
      <LogoutModal
        logoutModalDesc={authText.logoutModalDesc}
        confirmButtonText={authText.confirmButtonText}
        cancelButtonText={authText.cancelButtonText}
        redirectPath={pathname}
      />
      
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4" aria-label="Global">
        {/* Logo - Centered or Left aligned based on preference, sticking to left for standard nav */}
        <div className="flex lg:flex-1">
          <Link
            href={getLinkHref(locale, '')}
            className="-m-1.5 p-1.5 flex items-center gap-2 active:opacity-70 transition-opacity"
            onClick={() => checkPageAndLoading('')}>
            <span className="font-serif text-2xl font-bold text-[#1A1A2E] tracking-tight">
              Color Analysis <span className="text-primary">Quiz</span>
            </span>
          </Link>
        </div>

        {/* Mobile Menu Button - Larger touch target */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-full p-2.5 text-[#1A1A2E] hover:bg-[#F5F0EB] transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop Nav - Hidden on mobile */}
        <div className="hidden lg:flex lg:gap-x-10">
          <Link
            href={getLinkHref(locale, '')}
            onClick={() => checkPageAndLoading('')}
            className="text-sm font-medium leading-6 text-gray-600 hover:text-primary transition-colors">
            {menuText.header0}
          </Link>
          <Link
            href={getLinkHref(locale, 'validator')}
            onClick={() => checkPageAndLoading('validator')}
            className="text-sm font-medium leading-6 text-gray-600 hover:text-primary transition-colors">
            {menuText.header1}
          </Link>
           {
            userData.email ?
            <Link
                href={getLinkHref(locale, 'analysis')} 
                onClick={() => checkPageAndLoading('analysis')}
                className="text-sm font-medium leading-6 text-gray-600 hover:text-primary transition-colors">
                {menuText.header2}
            </Link> : null
           }
          <Link
            href={getLinkHref(locale, 'pricing')}
            onClick={() => checkPageAndLoading('pricing')}
            className="text-sm font-medium leading-6 text-gray-600 hover:text-primary transition-colors">
            {menuText.header3}
          </Link>
        </div>

        {/* Desktop Right - Login/Lang */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-4 items-center">
             {/* Language Switcher Hidden
             <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                <GlobeAltIcon className="w-4 h-4" />
                {locale == 'default' ? 'EN' : locale.toUpperCase()}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                  <div className="py-1">
                    {languages.map((item) => (
                      <Menu.Item key={item.lang}>
                        <Link
                          href={`/${item.lang}${page ? `/${page}` : ''}`}
                          onClick={() => checkLocalAndLoading(item.lang)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#FFFBF7] hover:text-primary"
                        >
                          {item.language}
                        </Link>
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            */}
            
            {process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0' && (
               <div className="ml-4">
                  <LoginButton buttonType={userData.email ? 1 : 0} loginText={authText.loginText} />
               </div>
            )}
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay with Soft Transitions */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#FFFBF7] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <Link href={getLinkHref(locale, '')} className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
               <span className="font-serif text-2xl font-bold text-[#1A1A2E]">
                Color Analysis <span className="text-primary">Quiz</span>
              </span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-full p-2.5 text-gray-700 hover:bg-[#F5F0EB] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-7 w-7" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-[#E8E1D9]">
              <div className="space-y-4 py-6">
                <Link
                  href={getLinkHref(locale, '')}
                  className="block rounded-xl px-4 py-3 text-lg font-serif font-medium text-[#1A1A2E] hover:bg-white hover:shadow-sm transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {menuText.header0}
                </Link>
                <Link
                  href={getLinkHref(locale, 'validator')}
                  className="block rounded-xl px-4 py-3 text-lg font-serif font-medium text-[#1A1A2E] hover:bg-white hover:shadow-sm transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {menuText.header1}
                </Link>
                 {
                  userData.email ?
                    <Link
                      href={getLinkHref(locale, 'profile')}
                      className="block rounded-xl px-4 py-3 text-lg font-serif font-medium text-[#1A1A2E] hover:bg-white hover:shadow-sm transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {menuText.header2}
                    </Link> : null
                 }
                 <Link
                  href={getLinkHref(locale, 'pricing')}
                  className="block rounded-xl px-4 py-3 text-lg font-serif font-medium text-[#1A1A2E] hover:bg-white hover:shadow-sm transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {menuText.header3}
                </Link>
              </div>
              <div className="py-6 space-y-4">
                 {/* Language Switcher Hidden
                 <div className="flex items-center justify-between px-4">
                    <span className="text-sm font-medium text-gray-500">Language</span>
                    <div className="flex gap-3">
                        {languages.map((item) => (
                            <Link
                                key={item.lang}
                                href={`/${item.lang}${page ? `/${page}` : ''}`}
                                onClick={() => checkLocalAndLoading(item.lang)}
                                className={`text-sm font-medium ${locale === item.lang ? 'text-primary' : 'text-gray-400'}`}
                            >
                                {item.language}
                            </Link>
                        ))}
                    </div>
                 </div>
                 */}
                 {process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0' && (
                     <div className="pt-2">
                        <LoginButton buttonType={userData.email ? 1 : 0} loginText={authText.loginText} />
                     </div>
                 )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}