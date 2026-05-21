import React, { useState } from "react";
import Link from "next/link";
import { FollowUp } from "../types";
import FollowUpDetailModal from "./FollowUpDetailModal";

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
    <div className="flex flex-col gap-3">
      {followUps.map((item) => {
        const leadName = item.lead?.userName || "Unknown Lead";
        const phone = item.lead?.mobileNumber || "";
        const assignedTo = item.userName || "Admin";
        const status = item.status || "PENDING";

        return (
          <div
            key={item.id}
            onClick={() => setSelectedFollowUp(item)}
            className="group bg-white rounded-2xl border border-gray-100 p-4 hover:border-[#233A78]/20 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {/* Top Row: Avatar + Info + Date */}
            <div className="flex items-start gap-3.5">
              {/* Avatar */}
              <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#233A78] to-[#4B73B2] flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-[14px] font-bold text-white leading-none">{getInitials(leadName)}</span>
              </div>

              {/* Name + Phone */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-bold text-[#1E293B] truncate leading-tight">{leadName}</h3>
                {phone && (
                  <p className="text-[12px] text-gray-400 mt-0.5 font-medium">{phone}</p>
                )}
              </div>

              {/* Date & Time */}
              <div className="text-right shrink-0">
                <div className="text-[12px] font-semibold text-[#1E293B]">
                  {formatSafeDate(item.date, item.createdAt)}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                  <ClockIcon /> {formatSafeTime(item.date, item.createdAt)}
                </div>
              </div>
            </div>

            {/* Remark */}
            {item.notes && (
              <div className="mt-3 bg-[#F8FAFC] rounded-lg px-3 py-2 border border-gray-50">
                <p className="text-[12px] text-gray-600 leading-relaxed">
                  <span className="font-semibold text-gray-400 mr-1">Remark:</span>
                  {item.notes}
                </p>
              </div>
            )}

            {/* Bottom Row: Badges + Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Assigned User */}
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full font-medium">
                  <UserIcon /> {assignedTo}
                </div>
                {/* Status Badge */}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${getStatusStyle(status)}`}>
                  {status}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {status !== "COMPLETED" && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); onReschedule(item.id); }}
                      className="px-3.5 py-1.5 rounded-full bg-[#4B73B2]/10 text-[#4B73B2] text-[12px] font-semibold hover:bg-[#4B73B2] hover:text-white transition-all duration-200"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onComplete(item.id); }}
                      className="px-3.5 py-1.5 rounded-full bg-[#233A78] text-white text-[12px] font-semibold hover:bg-[#1a2b5e] transition-colors shadow-sm"
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
          <p className="text-[15px] font-semibold text-gray-400">No follow-ups found</p>
          <p className="text-[13px] text-gray-300 mt-1">Try selecting a different date or filter</p>
        </div>
      )}

      {hasMore && (
        <div ref={loadMoreRef} className="py-4 flex justify-center items-center">
          {isFetchingMore && (
            <div className="flex items-center justify-center gap-2 text-gray-400 font-medium text-sm">
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
