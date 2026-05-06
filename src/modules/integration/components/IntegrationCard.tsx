import React from "react";
import { MessageCircle, Globe, Facebook, Instagram, ChevronRight } from "lucide-react";
import { IntegrationItem } from "../types";

export const IntegrationIcons: Record<string, React.FC<{ active?: boolean }>> = {
  "whatsapp": ({ active }) => (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-white' : 'bg-[#25D366]'}`}>
      <MessageCircle className={`w-6 h-6 ${active ? 'text-[#25D366]' : 'text-white'}`} fill="currentColor" />
    </div>
  ),
  "whatsapp-green": () => (
    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
      <MessageCircle className="w-6 h-6 text-white" fill="currentColor" />
    </div>
  ),
  "fb-insta": () => (
    <div className="flex gap-2">
      <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
        <Facebook className="w-6 h-6 text-white" fill="currentColor" />
      </div>
      <div className="w-10 h-10 rounded-[10px] bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] flex items-center justify-center">
        <Instagram className="w-6 h-6 text-white" />
      </div>
    </div>
  ),
  "google": () => (
    <div className="w-10 h-10 flex items-center justify-center">
      <div className="relative w-8 h-8">
        <div className="absolute left-0 bottom-0 top-1/2 -mt-2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-[#F4B400] rotate-[30deg]"></div>
        <div className="absolute right-0 bottom-0 top-1/2 -mt-2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-[#4285F4] -rotate-[30deg]"></div>
        <div className="absolute left-1/2 -ml-[12px] bottom-0 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-[#0F9D58]"></div>
      </div>
    </div>
  ),
  "web": () => (
    <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
      <Globe className="w-6 h-6 text-white" />
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
    <div 
      onClick={onClick}
      className={`rounded-2xl p-5 cursor-pointer transition-all ${
        isActive ? 'bg-[#2B5299] text-white shadow-md' : 'bg-white text-[#1A1A1A] hover:shadow-sm'
      }`}
    >
      <div className="mb-4">
        <IconComponent active={isActive} />
      </div>
      <p className={`text-[13px] font-medium leading-snug mb-4 ${isActive ? 'text-white/90' : 'text-[#1A1A1A]'} max-w-[90%]`}>
        {item.description}
      </p>
      
      <div className="flex justify-end">
        <button className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-[14px] font-medium ${
          isActive ? '' : 'bg-[#1C3A76] text-white'
        }`}>
          {item.actionText} 
          <ChevronRight className="w-4 h-4 mt-0.5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};
