import React from 'react';
import { Phone, Mail, Edit2, Trash2, Globe, Flag, Megaphone } from 'lucide-react';
import { Whatsapp } from '@thesvg/react';
import { useRouter } from 'next/navigation';
import { Lead } from '@/modules/leads/types/lead.types';
import { Text } from '@/core/components/ui/Text';
import { AvatarCircle } from '@/modules/staffs/components/AvatarCircle';
import { COLORS } from '@/core/components/theme/colors';
import { activityService } from '@/modules/activities/services/activityService';
import { getUser } from '@/core/utils/auth';
import { WhatsAppTemplateModal } from './WhatsAppTemplateModal';
import { leadsApi } from '@/modules/leads/api/leadsApi';
import { useFeedback } from '@/core/contexts/FeedbackContext';

export const LeadSummaryCard: React.FC<{ lead: Lead; onRefresh?: () => void }> = ({ lead, onRefresh }) => {
  const router = useRouter();
  const { showLoader, hideLoader, showToast } = useFeedback();
  const [showWhatsApp, setShowWhatsApp] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

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

  const handleDelete = async () => {
    if (isDeleting) return;
    const shouldDeleteLead = window.confirm("Do you want to delete this lead?");
    if (!shouldDeleteLead) return;

    const deleteDuplicates = window.confirm("Do you want to delete duplicate leads also?");

    setIsDeleting(true);
    showLoader();
    try {
      const result = await leadsApi.deleteLead(lead.id, deleteDuplicates);
      if (result.status === "success") {
        showToast(result.message || "Lead deleted successfully", "success");
        router.back();
        return;
      }
      showToast(result.message || "Failed to delete lead", "error");
    } finally {
      hideLoader();
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-[#F8F7F3] rounded-[24px] sm:rounded-[32px] px-4 sm:px-6 py-4 sm:py-5 shadow-sm border border-black/5 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex-shrink-0 flex flex-col items-center justify-center font-bold text-lg sm:text-2xl text-white shadow-sm" style={{ backgroundColor: COLORS.primary }}>
            {leadName.charAt(0).toUpperCase()}
          </div>
          <div>
            <Text size="custom" weight="medium" className="text-[18px] sm:text-[22px] text-black block leading-tight">
              {leadName}
            </Text>
            <Text size="sm" weight="light" className="text-black mt-0.5 sm:mt-1 block">
              Created On {createdDate}
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
          {[
            { icon: <Phone className="w-4 h-4" />, label: "Call", color: COLORS.primaryDark, onClick: handleCall },
            { icon: <Whatsapp className="w-4 h-4" />, label: "WhatsApp", color: COLORS.primaryDark, onClick: handleWhatsapp },
            { icon: <Mail className="w-4 h-4" />, label: "Email", color: COLORS.primaryDark, onClick: handleEmail },
            { icon: <Edit2 className="w-4 h-4" />, label: "Edit", color: COLORS.primaryDark, onClick: () => {} },
            { icon: <Trash2 className="w-4 h-4" />, label: isDeleting ? "Deleting" : "Delete", color: COLORS.primaryDark, onClick: handleDelete }
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center gap-1 cursor-pointer group" onClick={action.onClick}>
              <button
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-all shadow-sm active:scale-95 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: action.color }}
                disabled={isDeleting && action.label === "Deleting"}
              >
                {action.icon}
              </button>
              <Text as="span" size="custom" weight="medium" className="text-[10px] sm:text-[11px] text-[#64748B] tracking-tight group-hover:text-black transition-colors">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 sm:gap-y-4 gap-x-3 sm:gap-x-4">
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
      <Text weight="light" className="truncate sm:whitespace-normal sm:break-words" style={{ fontSize: '13px', color: 'black' }}>
        {value}
      </Text>
    </div>
  </div>
);
