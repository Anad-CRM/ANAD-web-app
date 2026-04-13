import React from 'react';
import { Plus } from 'lucide-react';

export const LeadHistoryCard: React.FC = () => {
  const history = [
    { time: '4:30 PM', date: '06 Mar', title: 'New Lead - Assigned', subtitle: 'By test organization', active: false },
    { time: '4:30 PM', date: '24 Jan', title: 'New Lead', subtitle: 'By test organization', active: true },
    { time: '4:30 PM', date: '08 May', title: 'New Lead', subtitle: 'By test organization', active: false },
  ];

  return (
    <div className="bg-[#F8F7F3] rounded-[32px] p-6 shadow-sm border border-black/5 flex flex-col relative min-h-[400px]">
      <h2 className="text-[20px] font-semibold text-black mb-8">History</h2>
      
      <div className="flex flex-col gap-0 relative ml-4">
        <div className="absolute left-[85px] top-2 bottom-6 w-[1.5px] bg-[#E2E8F0]" />
        
        {history.map((item, i) => (
          <div key={i} className="flex gap-8 mb-12 last:mb-0 relative group">
            <div className="flex flex-col items-end w-[70px] pt-1">
              <span className="text-[14px] font-semibold text-black leading-none">{item.time}</span>
              <span className="text-[11px] font-medium text-[#94A3B8] mt-1">{item.date}</span>
            </div>
            
            <div className="relative z-10 pt-1.5">
              <div className={`w-3.5 h-3.5 rounded-full border-[3px] border-white ring-2 ${item.active ? 'bg-[#2563EB] ring-[#2563EB]' : 'bg-black ring-black'}`} />
            </div>

            <div className="flex flex-col pt-0.5">
              <h4 className="text-[15px] font-semibold text-black leading-none">{item.title}</h4>
              <p className="text-[12px] font-medium text-[#94A3B8] mt-1">{item.subtitle}</p>
            </div>

            {item.active && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col gap-1 p-1 bg-white rounded-md shadow-md border border-gray-100">
                  <div className="w-1 h-3 bg-gray-200 rounded-full mx-auto" />
                  <div className="w-1 h-1 bg-gray-200 rounded-full mx-auto" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-all shadow-lg active:scale-95">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};
