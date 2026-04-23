import React from 'react';
import { Phone, MessageCircle, Mail, Edit2, Trash2, Globe, Flag, Megaphone } from 'lucide-react';
import { Lead } from '@/modules/leads/types/lead.types';
import { Text } from '@/core/components/ui/Text';
import { AvatarCircle } from '@/modules/staffs/components/AvatarCircle';
import { COLORS } from '@/core/components/theme/colors';

export const LeadSummaryCard: React.FC<{ lead: Lead }> = ({ lead }) => {
  const leadName = lead.userName || 'Unknown';
  
  const createdDate = lead.createdAt 
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }).format(new Date(lead.createdAt)).replace(',', ' -')
    : 'N/A';

  const assignedName = lead.assignedUser?.userName || 'Not Assigned';
  const source = lead.source || (lead.ad as any)?.platform || 'Unknown';
  const adName = lead.ad?.adName || 'Unknown';
  const status = lead.status || 'Unknown';
  const phoneNumber = lead.mobileNumber || 'N/A';
  const email = lead.email || 'N/A';

  return (
    <div className="bg-[#F8F7F3] rounded-[32px] p-6 shadow-sm border border-black/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-2xl text-white shadow-sm" style={{ backgroundColor: COLORS.primary }}>
            {leadName.charAt(0).toUpperCase()}
          </div>
          <div>
            <Text size="custom" weight="bold" className="text-[22px] text-black leading-tight">
              {leadName}
            </Text>
            <Text size="sm" weight="medium" className="text-[#64748B] mt-1">
              Created On {createdDate}
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {[
            { icon: <Phone className="w-4 h-4" />, label: "Call", color: COLORS.primary },
            { icon: <MessageCircle className="w-4 h-4" />, label: "WhatsApp", color: "#22C55E" },
            { icon: <Mail className="w-4 h-4" />, label: "Email", color: "#3B82F6" },
            { icon: <Edit2 className="w-4 h-4" />, label: "Edit", color: COLORS.primary },
            { icon: <Trash2 className="w-4 h-4" />, label: "Delete", color: "#EF4444" }
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer group">
              <button 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shadow-sm active:scale-95 hover:opacity-90"
                style={{ backgroundColor: action.color }}
              >
                {action.icon}
              </button>
              <Text as="span" size="custom" weight="medium" className="text-[11px] text-[#64748B] tracking-tight group-hover:text-black transition-colors">
                {action.label}
              </Text>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Text as="h3" size="custom" weight="semibold" className="text-[13px] text-[#64748B] tracking-wide uppercase">
          Lead Information
        </Text>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
          <InfoItem 
            label="Assigned To" 
            value={assignedName} 
            icon={
              lead.assignedUser ? (
                <AvatarCircle avatar={lead.assignedUser.avatar} size={28} />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200" />
              )
            } 
          />
          <InfoItem 
            label="Email" 
            value={email} 
            icon={<Mail className="w-4 h-4 text-[#1C3A76]" />} 
          />
          <InfoItem 
            label="Platform" 
            value={source} 
            icon={<Globe className="w-4 h-4 text-[#1C3A76]" />} 
          />
          <InfoItem 
            label="Status" 
            value={status} 
            icon={<Flag className="w-4 h-4 text-[#1C3A76]" />} 
            valueColor={status.toLowerCase() === 'enrolled' || status.toLowerCase() === 'closed' ? '#16A34A' : '#1C3A76'}
          />
          <InfoItem 
            label="Phone" 
            value={phoneNumber.replace('p:', '')} 
            icon={<Phone className="w-4 h-4 text-[#1C3A76]" />} 
          />
          <InfoItem 
            label="Ad Set" 
            value={adName} 
            icon={<Megaphone className="w-4 h-4 text-[#1C3A76]" />} 
          />
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string; icon: React.ReactNode; valueColor?: string }> = ({ label, value, icon, valueColor }) => (
  <div className="flex flex-col gap-1.5 overflow-hidden">
    <Text as="span" size="custom" weight="medium" className="text-[12px] text-[#64748B]">
      {label}
    </Text>
    <div className="flex items-center gap-2.5 overflow-hidden">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-black/[0.03] shrink-0">
        {icon}
      </div>
      <Text as="span" size="custom" weight="semibold" className="text-[14px] truncate" style={{ color: valueColor || 'black' }}>
        {value}
      </Text>
    </div>
  </div>
);
