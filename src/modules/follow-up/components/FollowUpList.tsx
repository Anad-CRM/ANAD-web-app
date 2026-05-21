import React, { useState } from "react";
import Link from "next/link";
import { FollowUp } from "../types";
import FollowUpDetailModal from "./FollowUpDetailModal";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

export default function FollowUpList({
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
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long" });
  };
  return (
    <div className="flex flex-col gap-4 min-w-0">
      {followUps.map((item) => (
        <div
          key={item.id}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-3 rounded-xl hover:bg-white/30 px-3 -mx-3 transition-colors cursor-pointer"
          onClick={() => setSelectedFollowUp(item)}
        >
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ backgroundColor: COLORS.primaryDark }} />
            <div className="flex flex-col min-w-0">
              <Text as="span" weight="bold" size="base" className="leading-tight truncate block" style={{ color: COLORS.text }}>
                {item.lead?.userName || "Unknown Lead"}
              </Text>
              <Text as="span" size="xs" className="flex items-center gap-1 mt-0.5" style={{ color: COLORS.muted }}>
                <ClockIcon /> {formatSafeDate(item.date, item.createdAt)}, {formatSafeTime(item.date, item.createdAt)}
              </Text>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 lg:gap-6">
            <div className="flex items-center gap-3" style={{ color: COLORS.muted }}>
              {item.lead?.id ? (
                <Link href={`/lead/${item.lead.id}`} aria-label="Profile" className="hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <UserIcon />
                </Link>
              ) : (
                <button aria-label="Profile" className="text-gray-300 cursor-not-allowed" title="Lead missing">
                  <UserIcon />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {item.status !== "COMPLETED" && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onReschedule(item.id); }}
                    className="px-4 py-1.5 rounded-full text-white text-[13px] font-semibold hover:opacity-90 transition-colors w-full sm:w-auto"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onComplete(item.id); }}
                    className="px-4 py-1.5 rounded-full text-white text-[13px] font-semibold hover:opacity-90 transition-colors w-full sm:w-auto"
                    style={{ backgroundColor: COLORS.primaryDark }}
                  >
                    Complete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {followUps.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No follow-ups found.
        </div>
      )}

      {hasMore && (
        <div ref={loadMoreRef} className="py-4 flex justify-center items-center">
          {isFetchingMore && (
            <div className="flex items-center justify-center gap-2 text-gray-500 font-medium text-sm">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading...</span>
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
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function UserIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
