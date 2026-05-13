import React from "react";
import DecorativeSphere from "./DecorativeSphere";

interface AuthPanelProps {
  children: React.ReactNode;
  className?: string;
  hideSphere?: boolean;
  allowOverflow?: boolean;
}

export default function AuthPanel({
  children,
  className,
  hideSphere = false,
  allowOverflow = false,
}: AuthPanelProps) {
  const sizeClasses = className
    ? className
    : "w-full max-w-[560px] h-auto min-h-[300px] sm:h-[355px]";

  return (
    <div 
      className={`relative rounded-[10px] ${allowOverflow ? "" : "overflow-hidden"} flex items-center justify-center transform transition-all duration-300 shadow-2xl ${sizeClasses}`}
      style={{
        background: 'linear-gradient(90deg, #1E56A0 0%, #D6E4F0 100%)',
        boxShadow: '0px 13px 43px 0px #78787838'
      }}
    >
      {!hideSphere && (
        <DecorativeSphere 
          size="132px" 
          className="top-[-66px] left-[-66px] hidden sm:block" 
          color="linear-gradient(0deg, rgba(94, 94, 94, 0.1), rgba(94, 94, 94, 0.1)), linear-gradient(90deg, #D6E4F0 0%, #1E56A0 100%)"
          backdropBlur="7px"
        />
      )}

      <div className="relative z-10 w-full px-5 py-5 sm:px-10 sm:py-6">
        {children}
      </div>
    </div>
  );
}