"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import FullScreenLoader from "@/core/components/ui/FullScreenLoader";

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
      
      {isLoading && <FullScreenLoader />}

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
