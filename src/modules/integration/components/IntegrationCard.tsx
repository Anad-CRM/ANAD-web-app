import React from "react";
import { ChevronRight } from "lucide-react";
import { IntegrationItem } from "../types";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

export const IntegrationIcons: Record<string, React.FC<{ active?: boolean }>> = {
  "whatsapp": ({ active }) => (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)] ${active ? "bg-white/15" : "bg-white"}`}>
      <img src="/whatsapp.png" alt="WhatsApp" className="w-10 h-10 object-contain" />
    </div>
  ),
  "whatsapp-green": () => (
    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
      <img src="/whatsapp.png" alt="WhatsApp" className="w-10 h-10 object-contain" />
    </div>
  ),
  "fb-insta": () => (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
        <img src="/fb.png" alt="Facebook" className="w-9 h-9 object-contain" />
      </div>
      <div className="w-16 h-16 rounded-[18px] bg-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
        <img src="/instagram.png" alt="Instagram" className="w-10 h-10 object-contain" />
      </div>
    </div>
  ),
  "google": () => (
    <div className="w-16 h-16 flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)] rounded-full bg-white text-[#0D1B3E]">
      <img src="/ads.png" alt="Google Ads" className="w-11 h-11 object-contain" />
    </div>
  ),
  "web": () => (
    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
      <img src="/website.png" alt="Website" className="w-10 h-10 object-contain" />
    </div>
  ),
  "ai": ({ active }) => (
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_24px_rgba(124,58,237,0.25)] ${active ? 'bg-white/15' : ''}`}
      style={active ? undefined : { background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill={active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)'} />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none" />
        <path d="M8 12.5C8 10.57 9.57 9 11.5 9S15 10.57 15 12.5 13.43 16 11.5 16 8 14.43 8 12.5z" fill="white" opacity="0.9"/>
        <path d="M16 8l-1.5 1.5M8 8l1.5 1.5M12 6V4M16 16l-1.5-1.5M8 16l1.5-1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <circle cx="11.5" cy="12.5" r="1.5" fill={active ? 'rgba(124,58,237,0.8)' : '#7c3aed'}/>
      </svg>
    </div>
  ),
};

interface Props {
  item: IntegrationItem;
  isActive: boolean;
  onClick: () => void;
  index: number;
  total: number;
}

export const IntegrationCard: React.FC<Props> = ({ item, isActive, onClick, index, total }) => {
  const IconComponent = IntegrationIcons[item.iconType] || IntegrationIcons["web"];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[178px] w-full flex-col justify-between overflow-hidden text-left outline-none rounded-tl-[28px] rounded-bl-[28px] ${
        isActive
          ? `border-none text-white shadow-[-12px_18px_30px_rgba(35,58,120,0.16)] z-10 relative xl:-mr-[50px] xl:w-[calc(100%+50px)] ${
              index === 0 ? "rounded-tr-[28px]" : "rounded-tr-0"
            } ${index === total - 1 ? "rounded-br-[28px]" : "rounded-br-0"}`
          : "border-white/80 bg-[#F8FAFE] text-[#0D1B3E] shadow-[0_14px_28px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(15,23,42,0.12)] rounded-tr-[28px] rounded-br-[28px]"
      }`}
      style={{ 
        backgroundColor: isActive ? COLORS.primary : undefined,
        transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(isActive ? { clipPath: 'inset(-100px 0 -100px -100px)' } : {}) 
      }}
    >
      <div className="p-5 lg:p-6">
        <div className="mb-4">
          <IconComponent active={isActive} />
        </div>
        <Text 
          className={isActive ? "text-white/90" : "text-[#0D1B3E]"}
          size="custom"
          weight="medium"
          style={{ fontSize: '15px', lineHeight: '1.5rem' }}
        >
          {item.description}
        </Text>
      </div>

      <div className="flex justify-end px-5 pb-5 lg:px-6 lg:pb-6">
        <Text 
          as="span"
          className="inline-flex items-center gap-2 rounded-full bg-[#163172] px-5 py-2 text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
          size="custom"
          weight="semibold"
          style={{ fontSize: '15px' }}
        >
          {item.actionText}
          <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </Text>
      </div>
    </button>
  );
};
