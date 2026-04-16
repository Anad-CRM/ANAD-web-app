import React from 'react';
import { Rocket, Copy } from 'lucide-react';

export const WebsiteConfigPanel: React.FC = () => {
  return (
    <div className="bg-[#2B5299] rounded-3xl p-6 lg:p-8 flex flex-col shadow-sm">
      <div className="flex items-start gap-4 mb-6">
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

      <div className="bg-[#D8D8D8] rounded-3xl w-full h-[220px] flex items-center justify-center relative shadow-inner">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-16 bg-[#B5B5B5] rounded-xl flex items-center justify-end px-4 shadow-sm cursor-pointer hover:bg-[#A5A5A5] transition-colors">
            <Copy className="w-5 h-5 text-black" strokeWidth={2.5} />
         </div>
      </div>
    </div>
  );
};
