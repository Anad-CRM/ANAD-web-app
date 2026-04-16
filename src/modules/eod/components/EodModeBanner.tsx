import React from "react";

export const EodModeBanner = () => {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl px-10 py-2.5 shadow-sm text-center">
      <h3 className="text-[15px] font-bold text-gray-900 leading-tight">Automatic EOD Mode Active</h3>
      <p className="text-[11px] text-gray-600 mt-0.5">EOD reports for all staff are generated automatically. Go to EOD settings switch to manual mode</p>
    </div>
  );
};
