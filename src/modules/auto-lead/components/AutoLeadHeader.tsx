import React, { useState } from 'react';
import { Search, Globe, Users } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';

export const AutoLeadHeader: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'team'>('global');

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full mb-5">
      <div className="flex bg-[#8FA7CC] rounded-full p-1 w-full max-w-[400px]">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-[14px] sm:text-[15px] font-semibold transition-all ${
            activeTab === 'global' ? 'bg-[#1C3A76] text-white shadow-md shadow-[#1C3A76]/20' : 'text-white/90 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" /> Global
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-[14px] sm:text-[15px] font-semibold transition-all ${
            activeTab === 'team' ? 'bg-[#1C3A76] text-white shadow-md shadow-[#1C3A76]/20' : 'text-white/90 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Team Based
        </button>
      </div>

      <div className="relative w-full lg:w-auto">
        <input
          type="text"
          className="w-full lg:w-[300px] bg-white rounded-full py-2.5 px-4 pr-10 text-sm focus:outline-none border border-transparent shadow-sm text-black"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
          <Search className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};
