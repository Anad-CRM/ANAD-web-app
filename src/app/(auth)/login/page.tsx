"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import AuthPanel from "@/modules/auth/components/AuthPanel";
import LoginPanel from "@/modules/auth/components/LoginPanel";
import CategorySelectPanel from "@/modules/auth/components/CategorySelectPanel";
import FullScreenLoader from "@/core/components/ui/FullScreenLoader";

type AuthView = "login" | "category";

export default function LoginPage() {
  const [view, setView] = useState<AuthView>("login");
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/overview");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <>
      {(isLoading || isAuthenticated) && <FullScreenLoader />}
      <AuthPanel>
        {view === "login" ? (
          <LoginPanel onCreateAccount={() => setView("category")} />
        ) : (
          <CategorySelectPanel onBack={() => setView("login")} />
        )}
      </AuthPanel>

      <div className="mt-12 flex items-center justify-center h-[20px] w-full relative">
        <div 
          className={`absolute transition-all duration-300 ease-in-out flex flex-col items-center justify-center w-full ${
            view === "login" 
              ? "opacity-100 translate-y-0 pointer-events-auto" 
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <p 
            className="text-white font-medium text-center m-0 flex items-center"
            style={{ fontSize: '15px', lineHeight: '15px' }}
          >
            To create a new account.
            <button 
              type="button"
              onClick={() => setView("category")} 
              className="underline cursor-pointer ml-[6px] hover:text-white/80 transition-colors bg-transparent border-none p-0 inline font-bold"
              style={{ fontSize: '15px', lineHeight: '15px' }}
            >
              Click here
            </button>
          </p>
        </div>
        
        <div 
          className={`absolute transition-all duration-300 ease-in-out flex flex-col items-center justify-center w-full ${
            view === "category" 
              ? "opacity-100 translate-y-0 pointer-events-auto" 
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <p 
            className="text-white font-medium text-center m-0"
            style={{ fontSize: '15px', lineHeight: '15px' }}
          >
            <button 
              type="button"
              onClick={() => setView("login")} 
              className="underline cursor-pointer hover:text-white/80 transition-colors bg-transparent border-none p-0 inline font-bold"
              style={{ fontSize: '15px', lineHeight: '15px' }}
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </>
  );
}