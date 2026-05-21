import React, { useState } from "react";
import { FollowUp } from "../types";
import FollowUpDetailModal from "./FollowUpDetailModal";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

export default function DetailedFollowUpList({
  followUps,
  onReschedule,
  onComplete,
  hasMore,
  isFetchingMore,
  loadMoreRef,
}: {
  followUps: FollowUp[];
  onReschedule: (id: number) => void;
  onComplete: (id: number) => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);

  const formatSafeTime = (dateStr?: string, fallback?: string) => {
    let d = new Date(dateStr || "");
    if (isNaN(d.getTime())) {
      d = new Date(fallback || "");
      if (isNaN(d.getTime())) return "N/A";
    }
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  };

  const formatSafeDate = (dateStr?: string, fallback?: string) => {
    let d = new Date(dateStr || "");
    if (isNaN(d.getTime())) {
      d = new Date(fallback || "");
      if (isNaN(d.getTime())) return "N/A";
    }
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "MISSED": return "bg-red-50 text-red-600 border-red-200";
      case "RESCHEDULED": return "bg-purple-50 text-purple-600 border-purple-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {followUps.map((item) => {
        const leadName = item.lead?.userName || "Unknown Lead";
        const phone = item.lead?.mobileNumber || "";
        const assignedTo = item.userName || "Admin";
        const status = item.status || "PENDING";

        return (
          <div
            key={item.id}
            onClick={() => setSelectedFollowUp(item)}
            className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
            style={{ borderColor: COLORS.border }}
          >
            {/* Top Row: Avatar + Info + Date */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3.5">
              {/* Avatar */}
              <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}>
                <Text as="span" weight="bold" size="sm" className="leading-none" style={{ color: COLORS.surface }}>{getInitials(leadName)}</Text>
              </div>

              {/* Name + Phone */}
              <div className="flex-1 min-w-0">
                <Text as="h3" weight="bold" size="sm" className="truncate leading-tight block" style={{ color: COLORS.text }}>{leadName}</Text>
                {phone && (
                  <Text as="p" size="xs" weight="medium" className="mt-0.5" style={{ color: COLORS.muted }}>{phone}</Text>
                )}
              </div>

              {/* Date & Time */}
              <div className="text-left sm:text-right shrink-0">
                <Text as="div" size="xs" weight="semibold" style={{ color: COLORS.text }}>
                  {formatSafeDate(item.date, item.createdAt)}
                </Text>
                <Text as="div" size="xs" className="mt-0.5 flex items-center justify-start sm:justify-end gap-1" style={{ color: COLORS.muted }}>
                  <ClockIcon /> {formatSafeTime(item.date, item.createdAt)}
                </Text>
              </div>
            </div>

            {/* Remark */}
            {item.notes && (
              <div className="mt-3 bg-[#F8FAFC] rounded-lg px-3 py-2 border border-gray-50">
                <Text as="p" size="xs" className="leading-relaxed" style={{ color: COLORS.muted }}>
                  <span className="font-semibold mr-1" style={{ color: COLORS.subtle }}>Remark:</span>
                  {item.notes}
                </Text>
              </div>
            )}

            {/* Bottom Row: Badges + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Assigned User */}
                <div className="flex items-center gap-1.5 text-[11px] bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full font-medium" style={{ color: COLORS.muted }}>
                  <UserIcon /> {assignedTo}
                </div>
                {/* Status Badge */}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${getStatusStyle(status)}`}>
                  {status}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {status !== "COMPLETED" && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); onReschedule(item.id); }}
                      className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold hover:opacity-90 transition-all duration-200 w-full sm:w-auto"
                      style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primaryDark }}
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onComplete(item.id); }}
                      className="px-3.5 py-1.5 rounded-full text-white text-[12px] font-semibold hover:opacity-90 transition-colors shadow-sm w-full sm:w-auto"
                      style={{ backgroundColor: COLORS.primaryDark }}
                    >
                      Complete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {followUps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <Text as="p" size="sm" weight="semibold" style={{ color: COLORS.muted }}>No follow-ups found</Text>
          <Text as="p" size="xs" className="mt-1" style={{ color: COLORS.subtle }}>Try selecting a different date or filter</Text>
        </div>
      )}

      {hasMore && (
        <div ref={loadMoreRef} className="py-4 flex justify-center items-center">
          {isFetchingMore && (
            <div className="flex items-center justify-center gap-2 font-medium text-sm" style={{ color: COLORS.muted }}>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}
      {selectedFollowUp && (
        <FollowUpDetailModal
          followUp={selectedFollowUp}
          onClose={() => setSelectedFollowUp(null)}
        />
      )}
    </div>
  );
}

function ClockIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function UserIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
