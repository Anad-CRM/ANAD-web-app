import React from "react";

interface EodModeBannerProps {
  mode: 'auto' | 'manual';
}

export const EodModeBanner: React.FC<EodModeBannerProps> = ({ mode }) => {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl px-10 py-2.5 shadow-sm text-center">
      <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
        {mode === 'auto' ? "Automatic EOD Mode Active" : "Manual EOD Mode Active"}
      </h3>
      <p className="text-[11px] text-gray-600 mt-0.5">
        {mode === 'auto' 
          ? "EOD reports for all staff are generated automatically. Go to EOD settings to switch to manual mode." 
          : "Staff are required to submit their EOD reports manually. Go to EOD settings to manage custom fields."}
      </p>
    </div>
  );
};
