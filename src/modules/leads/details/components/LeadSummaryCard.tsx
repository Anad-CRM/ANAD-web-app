import React from 'react';
import { Phone, Mail, Edit2, Trash2, Globe, Flag, Megaphone } from 'lucide-react';
import { Whatsapp } from '@thesvg/react';
import { Lead } from '@/modules/leads/types/lead.types';
import { Text } from '@/core/components/ui/Text';
import { AvatarCircle } from '@/modules/staffs/components/AvatarCircle';
import { COLORS } from '@/core/components/theme/colors';
import { activityService } from '@/modules/activities/services/activityService';
import { getUser } from '@/core/utils/auth';
import { WhatsAppTemplateModal } from './WhatsAppTemplateModal';

export const LeadSummaryCard: React.FC<{ lead: Lead; onRefresh?: () => void }> = ({ lead, onRefresh }) => {
  const [showWhatsApp, setShowWhatsApp] = React.useState(false);

  const leadName = lead.userName || 'Unknown';

  const createdDate = lead.createdAt
    ? new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(new Date(lead.createdAt)).replace(',', ' -')
    : 'N/A';

  const assignedName = lead.assignedUser?.userName || 'Not Assigned';
  const source = (lead.source || (lead.ad as { platform?: string } | null)?.platform || 'Unknown') as string;
  const adName = lead.ad?.adName || 'Unknown';
  const status = lead.status || 'Unknown';
  const phoneNumber = lead.mobileNumber || 'N/A';
  const email = lead.email || 'N/A';

  const handleCall = async () => {
    try {
      const userId = getUser<{ id: string }>()?.id || '';
      await activityService.createActivity(lead.id, {
        title: 'Phone Call',
        description: 'Phone Call',
        userId,
      });
      onRefresh?.();
    } catch (e) {
      console.error(e);
    }
    const cleanPhone = phoneNumber.replace('p:', '');
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleEmail = async () => {
    try {
      const userId = getUser<{ id: string }>()?.id || '';
      await activityService.createActivity(lead.id, {
        title: 'Email',
        description: 'Email',
        userId,
      });
      onRefresh?.();
    } catch (e) {
      console.error(e);
    }
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(`Follow up: ${leadName}`)}`;
    window.location.href = emailUrl;
  };

  const handleWhatsapp = () => {
    setShowWhatsApp(true);
  };

  return (
    <div className="bg-[#F8F7F3] rounded-[32px] px-6 py-5 shadow-sm border border-black/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full flex-shrink-0 flex flex-col items-center justify-center font-bold text-2xl text-white shadow-sm" style={{ backgroundColor: COLORS.primary }}>
            {leadName.charAt(0).toUpperCase()}
          </div>
          <div>
            <Text size="custom" weight="medium" className="text-[22px] text-black block leading-tight">
              {leadName}
            </Text>
            <Text size="sm" weight="light" className="text-black mt-1 block">
              Created On {createdDate}
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {[
            { icon: <Phone className="w-4 h-4" />, label: "Call", color: COLORS.primaryDark, onClick: handleCall },
            { icon: <Whatsapp className="w-4 h-4" />, label: "WhatsApp", color: COLORS.primaryDark, onClick: handleWhatsapp },
            { icon: <Mail className="w-4 h-4" />, label: "Email", color: COLORS.primaryDark, onClick: handleEmail },
            { icon: <Edit2 className="w-4 h-4" />, label: "Edit", color: COLORS.primaryDark, onClick: () => {} },
            { icon: <Trash2 className="w-4 h-4" />, label: "Delete", color: COLORS.primaryDark, onClick: () => {} }
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={action.onClick}>
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

      <div className="flex flex-col gap-3">
        <Text as="h3" size="custom" weight="normal" className="text-[13px] text-[#64748B] tracking-wide uppercase">
          Lead Information
        </Text>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4">
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
            icon={<Mail className="w-5 h-5 " />}
          />
          <InfoItem
            label="Platform"
            value={source}
            icon={<Globe className="w-5 h-5 " />}
          />
          <InfoItem
            label="Status"
            value={status}
            icon={<Flag className="w-5 h-5 " />}
            valueColor={status.toLowerCase() === 'enrolled' || status.toLowerCase() === 'closed' ? '#16A34A' : '#1C3A76'}
          />
          <InfoItem
            label="Phone"
            value={phoneNumber.replace('p:', '')}
            icon={<Phone className="w-5 h-5 " />}
          />
          <InfoItem
            label="Ad Set"
            value={adName}
            icon={<Megaphone className="w-5 h-5 " />}
          />
        </div>
      </div>

      {showWhatsApp && (
        <WhatsAppTemplateModal
          leadId={lead.id}
          leadName={leadName}
          phoneNumber={phoneNumber}
          onClose={() => setShowWhatsApp(false)}
          onSuccess={() => {
            setShowWhatsApp(false);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string; icon: React.ReactNode; valueColor?: string }> = ({ label, value, icon }) => (
  <div className="flex flex-col gap-1.5 overflow-hidden">
    <Text weight="normal" className="text-black" style={{ fontSize: '14px' }}>
      {label}
    </Text>
    <div className="flex items-center gap-2.5 overflow-hidden">
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red border border-black/[0.03] shrink-0" style={{ backgroundColor: COLORS.grey }}>
        {icon}
      </div>
      <Text weight="light" className="truncate" style={{ fontSize: '13px', color: 'black' }}>
        {value}
      </Text>
    </div>
  </div>
);
