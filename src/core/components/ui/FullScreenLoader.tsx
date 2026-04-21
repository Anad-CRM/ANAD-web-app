import React from "react";

export default function FullScreenLoader() {
  return (
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
  );
}
