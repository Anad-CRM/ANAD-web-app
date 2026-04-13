import React from 'react';
import { Phone, MessageCircle, Mail, Edit2, Trash2, Globe, Flag, Megaphone } from 'lucide-react';

export const LeadSummaryCard: React.FC = () => {
  return (
    <div className="bg-[#F8F7F3] rounded-[32px] p-6 shadow-sm border border-black/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#D9E4F2] flex-shrink-0" />
          <div>
            <h1 className="text-[22px] font-semibold text-black leading-tight">Jesse Pinkman</h1>
            <p className="text-[13px] text-[#64748B] mt-1">Created On 20-3-2026 - 10.38 AM</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {[
            { icon: <Phone className="w-5 h-5" />, label: "Call" },
            { icon: <MessageCircle className="w-5 h-5" />, label: "WhatsApp" },
            { icon: <Mail className="w-5 h-5" />, label: "Email" },
            { icon: <Edit2 className="w-5 h-5" />, label: "Edit" },
            { icon: <Trash2 className="w-5 h-5" />, label: "Delete" }
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <button className="w-10 h-10 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-colors shadow-sm">
                {action.icon}
              </button>
              <span className="text-[11px] font-medium text-[#64748B] tracking-tight">{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="text-[14px] font-semibold text-[#64748B] tracking-wide uppercase">Lead Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4">
          <InfoItem 
            label="Assigned To" 
            value="jagan kid" 
            icon={<div className="w-7 h-7 rounded-full bg-[#D9E4F2]" />} 
          />
          <InfoItem 
            label="Email" 
            value="jagankid@gmail.com" 
            icon={<Mail className="w-4 h-4 text-[#1C3A76]" />} 
          />
          <InfoItem 
            label="Platform" 
            value="Manual" 
            icon={<Globe className="w-4 h-4 text-[#1C3A76]" />} 
          />
          <InfoItem 
            label="Status" 
            value="New Lead" 
            icon={<Flag className="w-4 h-4 text-[#1C3A76]" />} 
          />
          <InfoItem 
            label="Phone" 
            value="6574849394" 
            icon={<Phone className="w-4 h-4 text-[#1C3A76]" />} 
          />
          <InfoItem 
            label="Ad Set" 
            value="Athira feedback campaign" 
            icon={<Megaphone className="w-4 h-4 text-[#1C3A76]" />} 
          />
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[12px] font-medium text-[#64748B]">{label}</span>
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-black/[0.03]">
        {icon}
      </div>
      <span className="text-[14px] font-medium text-black truncate">{value}</span>
    </div>
  </div>
);
