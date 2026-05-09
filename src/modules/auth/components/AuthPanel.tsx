import React from "react";

interface AuthPanelProps {
  children: React.ReactNode;
}

export default function AuthPanel({
  children,
}: AuthPanelProps) {
  return (
    <div 
      className="relative w-[560px] h-[355px] rounded-[10px] overflow-hidden flex items-center justify-center transform transition-all duration-300 shadow-2xl"
      style={{
        background: 'linear-gradient(90deg, #1E56A0 0%, #D6E4F0 100%)',
        boxShadow: '0px 13px 43px 0px #78787838'
      }}
    >
      <div className="relative z-10 w-full px-10 py-6">
        {children}
      </div>
    </div>
  );
}