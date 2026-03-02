'use client'
import { Fragment, ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  maxWidth?: string;
}

export default function BaseModal({ isOpen, onClose, title, children, icon, maxWidth = "sm:max-w-md" }: BaseModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden rounded-[2rem] bg-[#FFFBF7] px-8 py-10 text-left shadow-2xl transition-all sm:my-8 sm:w-full ${maxWidth} border border-[#E8E1D9]`}>
                <div className="absolute right-6 top-6">
                  <button
                    type="button"
                    className="rounded-full bg-white p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors shadow-sm border border-gray-100"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center">
                  {icon && (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                      {icon}
                    </div>
                  )}
                  
                  {title && (
                    <Dialog.Title as="h3" className="text-2xl font-serif font-bold leading-6 text-[#1A1A2E] mb-4">
                      {title}
                    </Dialog.Title>
                  )}

                  <div className="w-full">
                    {children}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
