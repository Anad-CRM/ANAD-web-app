import React from 'react';
import { Rocket, Copy } from 'lucide-react';

interface Props {
  activeIndex: number;
  total: number;
}

export const WebsiteConfigPanel: React.FC<Props> = ({ activeIndex, total }) => {
  return (
    <div 
      className={`bg-[#233A78] p-5 lg:p-6 flex h-full w-full flex-col shadow-sm transition-all xl:pl-[40px] animate-slide-up-fade ${
        activeIndex === 0 ? "rounded-tr-[28px] rounded-bl-[28px] rounded-br-[28px] rounded-tl-0" : 
        activeIndex === total - 1 ? "rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] rounded-bl-0" : 
        "rounded-[28px]"
      }`}
      style={{ transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
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
