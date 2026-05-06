import React from "react";
import { ChevronRight, Facebook, Globe, Instagram, MessageCircle } from "lucide-react";
import { IntegrationItem } from "../types";

export const IntegrationIcons: Record<string, React.FC<{ active?: boolean }>> = {
  "whatsapp": ({ active }) => (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)] ${active ? "bg-white/15" : "bg-white"}`}>
      <MessageCircle className={`w-10 h-10 ${active ? "text-[#25D366]" : "text-[#25D366]"}`} fill="currentColor" />
    </div>
  ),
  "whatsapp-green": () => (
    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
      <MessageCircle className="w-10 h-10 text-[#25D366]" fill="currentColor" />
    </div>
  ),
  "fb-insta": () => (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-[#1877F2] flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
        <Facebook className="w-10 h-10 text-white" fill="currentColor" />
      </div>
      <div className="w-16 h-16 rounded-[18px] bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
        <Instagram className="w-10 h-10 text-white" />
      </div>
    </div>
  ),
  "google": () => (
    <div className="w-16 h-16 flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)] rounded-full bg-white">
      <div className="relative w-11 h-11">
        <div className="absolute left-0 bottom-0 top-1/2 -mt-2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-[#F4B400] rotate-[30deg]"></div>
        <div className="absolute right-0 bottom-0 top-1/2 -mt-2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-[#4285F4] -rotate-[30deg]"></div>
        <div className="absolute left-1/2 -ml-[16px] bottom-0 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-[#0F9D58]"></div>
      </div>
    </div>
  ),
  "web": () => (
    <div className="w-16 h-16 rounded-full bg-[#1D2FE8] flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
      <Globe className="w-10 h-10 text-white" />
    </div>
  )
};

interface Props {
  item: IntegrationItem;
  isActive: boolean;
  onClick: () => void;
}

export const IntegrationCard: React.FC<Props> = ({ item, isActive, onClick }) => {
  const IconComponent = IntegrationIcons[item.iconType] || IntegrationIcons["web"];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[178px] w-full flex-col justify-between overflow-hidden rounded-[28px] border text-left transition-all duration-200 outline-none ${
        isActive
          ? "border-transparent bg-[#2B5299] text-white shadow-[0_18px_30px_rgba(35,58,120,0.16)]"
          : "border-white/80 bg-[#F8FAFE] text-[#1A1A1A] shadow-[0_14px_28px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(15,23,42,0.12)]"
      }`}
    >
      <div className="p-5 lg:p-6">
        <div className="mb-4">
          <IconComponent active={isActive} />
        </div>
        <p className={`max-w-[560px] text-[15px] leading-6 font-medium ${isActive ? "text-white/90" : "text-[#1F2937]"}`}>
          {item.description}
        </p>
      </div>

      <div className="flex justify-end px-5 pb-5 lg:px-6 lg:pb-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#1C3A76] px-5 py-2 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]">
          {item.actionText}
          <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </span>
      </div>
    </button>
  );
};
