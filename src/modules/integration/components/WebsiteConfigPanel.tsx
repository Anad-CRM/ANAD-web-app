import React from 'react';
import { Rocket, Copy } from 'lucide-react';

export const WebsiteConfigPanel: React.FC = () => {
  return (
    <div className="bg-[#2B5299] rounded-r-3xl rounded-l-none p-5 lg:p-6 flex flex-col shadow-sm h-full">
      <div className="flex items-start gap-4 mb-5">
        <Rocket className="w-10 h-10 text-white mt-1 shrink-0" strokeWidth={2} />
        <div>
          <h2 className="text-white text-[17px] font-semibold leading-tight mb-2 tracking-wide">
            Connect Your Website in<br />2 Simple Steps
          </h2>
          <div className="text-white/80 text-[13px] font-medium space-y-1 tracking-wide">
             <p>1. Copy your unique key below</p>
             <p>2. Share it with your website developer</p>
          </div>
        </div>
      </div>

      <div className="w-full h-[180px] flex items-center justify-center relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-12 bg-[#1C3A76] rounded-xl flex items-center justify-end px-4 shadow-xl cursor-pointer hover:bg-[#152a57] transition-colors border border-white/10">
            <Copy className="w-4 h-4 text-white" strokeWidth={2.5} />
         </div>
      </div>
    </div>
  );
};
