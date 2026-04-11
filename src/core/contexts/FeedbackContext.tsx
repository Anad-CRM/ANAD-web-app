"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  message: string;
  type: ToastType;
}

interface FeedbackContextProps {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
  showToast: (message: string, type?: ToastType) => void;
}

const FeedbackContext = createContext<FeedbackContextProps | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <FeedbackContext.Provider value={{ isLoading, showLoader, hideLoader, showToast }}>
      {children}
      
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 pointer-events-auto transition-opacity duration-300">
          <div className="backdrop-blur-[10px] bg-black/60 border border-white/10 p-8 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <svg
              className="animate-spin h-[50px] w-[50px] text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none transition-all duration-300 ease-in-out opacity-100 translate-y-0">
          <div className={`px-6 py-3 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.2)] text-white font-medium text-[14px] flex items-center gap-3 transition-colors ${
            toast.type === "success" ? "bg-black" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"
          }`}>
            {toast.type === "success" && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
            {toast.type === "error" && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            {toast.message}
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
};
