import React, { useState } from 'react';
import { INTEGRATION_LIST } from '../constants';
import { IntegrationCard } from './IntegrationCard';
import { WhatsAppConfigPanel } from './WhatsAppConfigPanel';
import { WebsiteConfigPanel } from './WebsiteConfigPanel';
import { FacebookConfigPanel } from './FacebookConfigPanel';
import { GoogleConfigPanel } from './GoogleConfigPanel';
import { BroadcastPanel } from './BroadcastPanel';
import { AIConfigPanel } from './AIConfigPanel';

export const IntegrationDashboard: React.FC = () => {
  const [activeId, setActiveId] = useState<string>("1");
  const [showBroadcast, setShowBroadcast] = useState(false);

  const activeItem = INTEGRATION_LIST.find(i => i.id === activeId);
  const isWhatsAppActive =
    activeItem?.iconType === 'whatsapp' || activeItem?.iconType === 'whatsapp-green';

  return (
    <div className="w-full font-sans tracking-tight">
      <div className="flex w-full flex-col gap-5 xl:grid xl:grid-cols-2 xl:items-start xl:gap-5">
        {/* Left: Integration cards */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 self-stretch">
          {INTEGRATION_LIST.map((item, index) => (
            <IntegrationCard
              key={`${item.id}-${index}`}
              item={item}
              isActive={activeId === item.id}
              onClick={() => {
                setActiveId(item.id);
                setShowBroadcast(false);
              }}
              index={index}
              total={INTEGRATION_LIST.length}
            />
          ))}
        </div>

        {/* Right: Config panels */}
        <div className="w-full self-stretch flex flex-col gap-4">
          {(() => {
            const activeIndex = INTEGRATION_LIST.findIndex(i => i.id === activeId);
            const total = INTEGRATION_LIST.length;
            return (
              <>
                {isWhatsAppActive && (
                  <>
                    <WhatsAppConfigPanel activeIndex={activeIndex} total={total} />

                    {/* Broadcast toggle */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[13px] font-semibold text-[#64748B]">Broadcast Campaigns</span>
                      <button
                        onClick={() => setShowBroadcast(v => !v)}
                        className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-all ${
                          showBroadcast
                            ? 'bg-[#0D1B3E] text-white'
                            : 'bg-[#E2E8F0] text-[#64748B] hover:bg-[#CBD5E1]'
                        }`}
                      >
                        {showBroadcast ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {showBroadcast && <BroadcastPanel />}
                  </>
                )}
                {activeItem?.iconType === 'fb-insta' && (
                  <FacebookConfigPanel activeIndex={activeIndex} total={total} />
                )}
                {activeItem?.iconType === 'google' && (
                  <GoogleConfigPanel activeIndex={activeIndex} total={total} />
                )}
                {activeItem?.iconType === 'web' && (
                  <WebsiteConfigPanel activeIndex={activeIndex} total={total} />
                )}
                {activeItem?.iconType === 'ai' && (
                  <AIConfigPanel activeIndex={activeIndex} total={total} />
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
