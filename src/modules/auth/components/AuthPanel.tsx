import React from "react";

interface AuthPanelProps {
  children: React.ReactNode;
}

export default function AuthPanel({ children }: AuthPanelProps) {
  return (
    <div className="relative w-[420px]">
      <div className="absolute w-[100px] h-[100px] border border-white/30 rounded-full -top-[50px] -left-[50px] z-20" />

      <div className="relative w-[420px] rounded-[20px] bg-white shadow-[0_8px_24px_rgba(27,58,122,0.18)] overflow-hidden font-['Inter']">
        <div className="absolute w-[100px] h-[100px] rounded-full bg-[#9DB2CE] opacity-40 -top-[50px] -left-[50px] z-10" />
        {children}
      </div>
    </div>
  );
}
