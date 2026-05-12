"use client";

import { useRouter } from "next/navigation";
import AuthPanel from "@/modules/auth/components/AuthPanel";
import ForgotPasswordPanel from "@/modules/auth/components/ForgotPasswordPanel";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <>
      <AuthPanel>
        <ForgotPasswordPanel />
      </AuthPanel>

      <div className="mt-8 sm:mt-12 flex items-center justify-center h-[20px] w-full relative">
        <div 
          className="absolute transition-all duration-300 ease-in-out flex flex-col items-center justify-center w-full opacity-100 translate-y-0 pointer-events-auto"
        >
          <p 
            className="text-white font-medium text-center m-0"
            style={{ fontSize: '15px', lineHeight: '15px' }}
          >
            <button 
              type="button"
              onClick={() => router.push("/login")} 
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
