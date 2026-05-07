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
      <div className="flex w-full flex-col gap-5 xl:grid xl:grid-cols-2 xl:items-stretch xl:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3 self-stretch">
          {INTEGRATION_LIST.map((item, index) => (
            <IntegrationCard
              key={`${item.id}-${index}`}
              item={item}
              isActive={activeId === item.id}
              onClick={() => setActiveId(item.id)}
              index={index}
              total={INTEGRATION_LIST.length}
            />
          ))}
        </div>

        <div className="w-full self-stretch">
          {(() => {
            const activeIndex = INTEGRATION_LIST.findIndex(i => i.id === activeId);
            const total = INTEGRATION_LIST.length;
            return (
              <>
                {(activeItem?.iconType === "whatsapp" || activeItem?.iconType === "whatsapp-green") && (
                  <WhatsAppConfigPanel activeIndex={activeIndex} total={total} />
                )}
                {activeItem?.iconType === "fb-insta" && (
                  <FacebookConfigPanel activeIndex={activeIndex} total={total} />
                )}
                {activeItem?.iconType === "google" && (
                  <GoogleConfigPanel activeIndex={activeIndex} total={total} />
                )}
                {activeItem?.iconType === "web" && (
                  <WebsiteConfigPanel activeIndex={activeIndex} total={total} />
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
