import React from 'react';
import { Pencil, Clock } from 'lucide-react';

export const LeadFollowUpCard: React.FC = () => {
  return (
    <div className="bg-[#F8F7F3] rounded-[32px] p-6 shadow-sm border border-black/5 flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[20px] font-semibold text-black">Follow Up</h2>
        <button className="w-12 h-12 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-all shadow-lg active:scale-95">
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-70">
        <div className="w-12 h-12 flex items-center justify-center">
           <Clock className="w-10 h-10 text-black stroke-[1.5]" />
        </div>
        <p className="text-[18px] font-medium text-black">No Follow Up</p>
      </div>
    </div>
  );
};
