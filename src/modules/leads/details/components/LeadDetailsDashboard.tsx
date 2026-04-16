import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { LeadSummaryCard } from '@/modules/leads/details/components/LeadSummaryCard';
import { LeadHistoryCard } from '@/modules/leads/details/components/LeadHistoryCard';
import { LeadFollowUpCard } from '@/modules/leads/details/components/LeadFollowUpCard';
import { useRouter } from 'next/navigation';

export const LeadDetailsDashboard: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full h-full bg-[#E5ECF4] p-6 lg:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/20">
      <div className="max-w-[1400px] mx-auto w-full">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#1C3A76] flex items-center justify-center text-white mb-8 hover:bg-[#11234D] transition-colors shadow-md"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 auto-rows-min">
          <div className="flex flex-col gap-8">
            <LeadSummaryCard />
            <LeadHistoryCard />
          </div>
          
          <div className="h-full">
            <LeadFollowUpCard />
          </div>
        </div>
      </div>
    </div>
  );
};
