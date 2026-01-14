'use client'
import React, {Fragment, useState} from 'react'
import {Dialog, Transition} from '@headlessui/react'
import {FcGoogle} from 'react-icons/fc'
import {blackLoadingSvg} from './svg'
import {useCommonContext} from "~/context/common-context";
import {signInUseAuth} from "~/libs/nextAuthClient";

const LoginModal = ({
                      loadingText,
                      redirectPath,
                      loginModalDesc,
                      loginModalButtonText,
                    }: {
                        loadingText: string,
                        redirectPath: string,
                        loginModalDesc: string,
                        loginModalButtonText: string
                    }) => {

  const [loadGoogle, setLoadGoogle] = useState(false)
  const {showLoginModal, setShowLoginModal} = useCommonContext();


  return (
    <Transition.Root show={showLoginModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setShowLoginModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"/>
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="relative transform overflow-hidden rounded-[2rem] bg-[#FFFBF7] px-8 py-10 text-left shadow-2xl transition-all sm:w-full sm:max-w-sm border border-[#E8E1D9]"
              >
                <div className="flex flex-col items-center text-center">
                  
                  {/* Decorative Icon Background */}
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  <Dialog.Title as="h3" className="text-2xl font-serif font-bold text-[#1A1A2E] mb-2">
                    Save Your Results
                  </Dialog.Title>
                  
                  {/* Promotional Offer Card */}
                  <div className="my-5 w-full rounded-2xl bg-gradient-to-br from-orange-50 to-[#FFFBF7] p-5 border border-orange-100 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-full blur-2xl -mr-8 -mt-8"></div>
                      
                      <div className="relative z-10">
                          <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full border border-orange-200">
                                  ✨ Early Access Gift
                              </span>
                          </div>
                          <div className="flex items-baseline justify-center gap-3">
                              <span className="text-gray-400 line-through text-lg decoration-gray-400/50 decoration-1">$19.90</span>
                              <span className="text-3xl font-bold text-orange-600 font-serif">FREE</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-2 font-medium">
                              Login now to claim <span className="text-orange-700 font-bold">1 Full Analysis</span> on us.
                          </p>
                      </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-[260px]">
                    {loginModalDesc || "Sign in to secure this offer and save your results permanently."}
                  </p>

                  <div className="w-full space-y-3">
                    {
                      loadGoogle ? (
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-base font-bold text-gray-400 shadow-sm border border-gray-100 cursor-not-allowed"
                          disabled
                        >
                          {blackLoadingSvg}
                          <span>{loadingText}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="group flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-base font-bold text-[#1A1A2E] shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                          onClick={async () => {
                            setLoadGoogle(true)
                            await signInUseAuth({
                              redirectPath: redirectPath
                            })
                          }}
                        >
                          <FcGoogle className='text-2xl group-hover:scale-110 transition-transform'/>
                          <span>{loginModalButtonText || "Continue with Google"}</span>
                        </button>
                      )
                    }
                  </div>

                  <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                    Secure & Private
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default LoginModal
