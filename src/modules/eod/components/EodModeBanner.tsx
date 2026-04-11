import React from "react";

export const EodModeBanner = () => {
  return (
    <div className="flex justify-center w-full mb-8 px-4 font-sans">
      <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl px-12 py-3 shadow-sm text-center">
        <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Automatic EOD Mode Active</h3>
        <p className="text-[12px] text-gray-600 mt-0.5">EOD reports for all staff are generated automatically. Go to EOD settings switch to manual mode</p>
      </div>
    </div>
  );
};
