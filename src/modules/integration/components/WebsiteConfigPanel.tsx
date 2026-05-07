import React from 'react';
import { Rocket, Copy } from 'lucide-react';

export const WebsiteConfigPanel: React.FC = () => {
  return (
    <div className="bg-[#233A78] rounded-[28px] p-5 lg:p-6 flex h-full w-full flex-col shadow-sm">
      <div className="flex items-start gap-4 mb-5">
        <Rocket className="w-10 h-10 text-white mt-1 shrink-0" strokeWidth={2} />
        <div>
          <h2 className="text-white text-[17px] font-bold leading-tight mb-2 tracking-wide">
            Connect Your Website in<br />2 Simple Steps
          </h2>
          <div className="text-white/80 text-[13px] font-medium space-y-1 tracking-wide">
             <p>1. Copy your unique key below</p>
             <p>2. Share it with your website developer</p>
          </div>
        </div>
      </div>

      <div className="w-full flex-1 flex items-center justify-center relative bg-[#E2E8F0] rounded-[24px] p-8">
          <div className="w-56 h-12 bg-[#233A78] rounded-xl flex items-center justify-end px-4 shadow-xl cursor-pointer hover:opacity-90 transition-all border border-white/10">
             <Copy className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
      </div>
    </div>
  );
};
