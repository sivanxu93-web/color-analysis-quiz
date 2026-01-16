'use client'
import React from 'react'
import BaseModal from './BaseModal';
import {useCommonContext} from "~/context/common-context";
import {signOut} from "next-auth/react";

export default function LogoutModal({
  logoutModalDesc,
  confirmButtonText,
  cancelButtonText,
  redirectPath
}) {
  const {showLogoutModal, setShowLogoutModal} = useCommonContext();

  const handleLogout = async () => {
    await signOut({ callbackUrl: redirectPath || '/' });
    setShowLogoutModal(false);
  }

  return (
    <BaseModal 
      isOpen={showLogoutModal} 
      onClose={() => setShowLogoutModal(false)}
      title="Log Out?"
      icon={<span className="text-3xl">👋</span>}
    >
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            {logoutModalDesc || "Are you sure you want to log out? You can always sign back in to access your reports."}
        </p>
        <div className="flex flex-col gap-3">
            <button
                type="button"
                className="w-full rounded-full bg-red-50 px-6 py-3.5 text-base font-bold text-red-600 shadow-sm border border-red-100 hover:bg-red-100 hover:shadow-md transition-all duration-200"
                onClick={handleLogout}
            >
                {confirmButtonText || "Yes, Log Out"}
            </button>
            <button
                type="button"
                className="w-full rounded-full bg-white px-6 py-3.5 text-base font-bold text-gray-600 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowLogoutModal(false)}
            >
                {cancelButtonText || "Cancel"}
            </button>
        </div>
    </BaseModal>
  )
}