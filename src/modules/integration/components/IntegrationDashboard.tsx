import React, { useState } from 'react';
import { INTEGRATION_LIST } from '../constants';
import { IntegrationCard } from './IntegrationCard';
import { WhatsAppConfigPanel } from './WhatsAppConfigPanel';
import { WebsiteConfigPanel } from './WebsiteConfigPanel';
import { FacebookConfigPanel } from './FacebookConfigPanel';
import { GoogleConfigPanel } from './GoogleConfigPanel';

export const IntegrationDashboard: React.FC = () => {
  const [activeId, setActiveId] = useState<string>("1"); 

  const activeItem = INTEGRATION_LIST.find(i => i.id === activeId);

  return (
    <div className="w-full font-sans tracking-tight">
      <div className="flex w-full flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(420px,460px)] xl:items-stretch xl:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3 self-stretch">
          {INTEGRATION_LIST.map((item, index) => (
            <IntegrationCard
              key={`${item.id}-${index}`}
              item={item}
              isActive={activeId === item.id}
              onClick={() => setActiveId(item.id)}
            />
          ))}
        </div>

        <div className="w-full self-stretch">
          {(activeItem?.iconType === "whatsapp" || activeItem?.iconType === "whatsapp-green") && <WhatsAppConfigPanel />}
          {activeItem?.iconType === "fb-insta" && <FacebookConfigPanel />}
          {activeItem?.iconType === "google" && <GoogleConfigPanel />}
          {activeItem?.iconType === "web" && <WebsiteConfigPanel />}
        </div>
      </div>
    </div>
  );
};
