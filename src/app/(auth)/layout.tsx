import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#163172] overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none hidden md:block"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M 576 180 Q 576 0 830 0 L 1440 0 L 1440 900 L 830 900 Q 576 900 576 720 Z" 
          fill="#1E56A0"
          filter="url(#shadow)"
        />
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="17"/>
            <feOffset dx="-12" dy="0" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.25"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <g transform="translate(288, 450)">
          <foreignObject x="-90" y="-90" width="150" height="150">
            <div className="w-full h-full flex items-center justify-center">
              <img
                src="/login/login.png"
                alt="Logo"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          </foreignObject>
        </g>
      </svg>
      
      <div className="absolute inset-0 w-full h-full bg-[#1E56A0] z-0 md:hidden block" />

      <div className="relative z-10 w-full max-w-[1440px] h-full flex flex-col md:flex-row items-center justify-center md:justify-end px-5 md:pr-[10%]">
        {children}
      </div>
    </div>
  );
}