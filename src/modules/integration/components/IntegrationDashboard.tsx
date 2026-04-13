import React, { useState } from 'react';
import { INTEGRATION_LIST } from '../constants';
import { IntegrationCard } from './IntegrationCard';
import { WhatsAppConfigPanel } from './WhatsAppConfigPanel';
import { WebsiteConfigPanel } from './WebsiteConfigPanel';

export const IntegrationDashboard: React.FC = () => {
  const [activeId, setActiveId] = useState<string>("1"); 

  return (
    <div className="flex w-full h-full font-sans tracking-tight">
      <div className="w-[380px] lg:w-[420px] shrink-0 h-full overflow-y-auto custom-scrollbar flex flex-col gap-4 py-6 pl-6 pr-3">
        {INTEGRATION_LIST.map((item, index) => (
          <IntegrationCard 
            key={`${item.id}-${index}`} 
            item={item} 
            isActive={activeId === item.id}
            onClick={() => setActiveId(item.id)}
          />
        ))}
      </div>

      <div className="flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col gap-6 py-6 pr-6 pl-3">
        <WhatsAppConfigPanel />
        <WebsiteConfigPanel />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.1);
        }
      `}} />
    </div>
  );
};
