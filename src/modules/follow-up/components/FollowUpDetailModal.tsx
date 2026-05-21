import React from "react";
import Link from "next/link";
import { FollowUp } from "../types";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

interface FollowUpDetailModalProps {
  followUp: FollowUp;
  onClose: () => void;
}

export default function FollowUpDetailModal({ followUp, onClose }: FollowUpDetailModalProps) {
  const lead = followUp.lead;
  const userName = lead?.userName || "Unknown";
  const mobileNumber = lead?.mobileNumber || "";
  const leadStatus = lead?.status || "Unknown";
  const notes = followUp.notes || "";
  const followUpStatus = followUp.status || "PENDING";
  const activityType = followUp.type || "";
  const assignedUserName = lead?.assignedUser?.userName || "";
  const adName = lead?.ad?.adName || "";
  const platform = lead?.ad?.platform || "";

  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No date";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "No date";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return "No date"; }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
    } catch { return ""; }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new lead": return { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" };
      case "hot lead":
      case "contacted": return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" };
      case "not interested": return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" };
      case "closed": return { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" };
      case "follow up": return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" };
      default: return { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
    }
  };

  const getFollowUpStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" };
      case "COMPLETED": return { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" };
      case "MISSED": return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" };
      case "RESCHEDULED": return { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" };
      default: return { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
    }
  };

  const statusColors = getStatusColor(leadStatus);
  const fuStatusColors = getFollowUpStatusColor(followUpStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-[24px] sm:rounded-[24px] shadow-2xl w-[min(100vw-1rem,480px)] sm:w-full max-w-[480px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-4 pb-2 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-5 sm:px-6 pb-6 overflow-y-auto custom-scrollbar">
          {/* Header: Avatar + Name + Date */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: COLORS.primaryXlight }}>
              <Text as="span" weight="bold" size="lg" style={{ color: COLORS.primaryDark }}>{getInitials(userName)}</Text>
            </div>
            <div className="flex-1 min-w-0">
              <Text as="h3" weight="bold" size="base" className="truncate block" style={{ color: COLORS.text }}>{userName}</Text>
              {mobileNumber && (
                <Text as="p" size="xs" className="mt-0.5" style={{ color: COLORS.muted }}>{mobileNumber}</Text>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}>
                  {leadStatus}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${fuStatusColors.bg} ${fuStatusColors.text} border ${fuStatusColors.border}`}>
                  {followUpStatus}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <Text as="p" size="xs" weight="medium" style={{ color: COLORS.muted }}>{formatDate(followUp.date)}</Text>
              <Text as="p" size="xs" style={{ color: COLORS.subtle }}>{formatTime(followUp.date)}</Text>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="mt-5 bg-[#F8FAFC] border border-gray-100 rounded-xl p-4">
              <Text as="p" size="xs" weight="bold" className="uppercase tracking-wider mb-1.5" style={{ color: COLORS.subtle }}>Notes / Remark</Text>
              <Text as="p" size="sm" style={{ color: COLORS.text, lineHeight: 1.6 }}>{notes}</Text>
            </div>
          )}

          {/* Info Row */}
          <div className="mt-5 flex flex-wrap gap-3">
            {activityType && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                <ActivityIcon type={activityType} />
                <Text as="span" size="xs" weight="medium" style={{ color: COLORS.muted }}>{activityType}</Text>
              </div>
            )}
            {platform && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                <PlatformIcon platform={platform} />
                <Text as="span" size="xs" weight="medium" style={{ color: COLORS.muted }}>{platform}</Text>
              </div>
            )}
            {adName && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
                <Text as="span" size="xs" weight="medium" className="truncate max-w-[140px]" style={{ color: COLORS.muted }}>{adName}</Text>
              </div>
            )}
            {assignedUserName && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <Text as="span" size="xs" weight="medium" style={{ color: COLORS.muted }}>{assignedUserName}</Text>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {lead?.id ? (
              <Link
                href={`/lead/${lead.id}`}
                className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 font-semibold text-[13px] hover:opacity-90 transition-colors"
                style={{ backgroundColor: COLORS.primaryDark }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Lead Details
              </Link>
            ) : (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-white rounded-xl py-3 font-semibold text-[13px] cursor-not-allowed"
                title="Lead not found or deleted"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Lead Details
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold text-[13px] hover:bg-gray-200 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type.toUpperCase()) {
    case "CALL":
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.1.66.27 1.3.49 1.93a2 2 0 01-.45 2.11L8.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.63.22 1.27.39 1.93.49A2 2 0 0122 16.92z"/></svg>;
    case "MEETING":
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "EMAIL":
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    case "WHATSAPP":
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>;
    default:
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
  }
}

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform.toLowerCase()) {
    case "facebook":
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case "instagram":
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E4405F" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
    default:
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
  }
}
