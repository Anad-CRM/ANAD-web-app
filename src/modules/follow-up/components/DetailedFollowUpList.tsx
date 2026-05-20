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
  loadMoreRef?: React.RefObject<HTMLDivElement>;
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
    <div className="flex flex-col gap-4">
      {followUps.map((item) => (
        <div key={item.id} className="flex items-start py-4 rounded-[20px] hover:bg-white/40 px-4 -mx-4 transition-colors gap-4 border-b border-[#A5BCD1]/20 last:border-0 cursor-pointer" onClick={() => setSelectedFollowUp(item)}>
          <span className="w-2 h-2 rounded-full bg-black shrink-0 mt-2.5" />
          
          <div className="flex flex-col flex-1 min-w-0">
             <div className="flex items-start justify-between">
                <div>
                   <h3 className="text-[15px] font-bold text-[#1E293B]">
                     {item.lead?.userName || "Unknown Lead"}
                   </h3>
                   <div className="text-[13px] text-gray-500 font-medium">
                     {item.lead?.mobileNumber || "N/A"}
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-[13px] font-bold text-[#1E293B]">
                     {formatSafeDate(item.date, item.createdAt)}
                   </div>
                   <div className="text-[12px] text-gray-500 font-medium flex items-center justify-end gap-1">
                     <ClockIcon /> {formatSafeTime(item.date, item.createdAt)}
                   </div>
                </div>
             </div>

             <div className="mt-2 text-[13px] text-gray-700 bg-gray-50 p-2 border border-gray-100 rounded-md">
                <span className="font-semibold text-gray-500">Remark:</span> {item.notes || "No remark pending"}
             </div>

             <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 text-[12px] text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
                     <UserIcon /> {item.userName || "Admin"}
                   </div>
                   <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                     item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                     item.status === 'MISSED' ? 'bg-red-100 text-red-700' : 
                     'bg-orange-100 text-orange-700'
                   }`}>
                     {item.status || "PENDING"}
                   </span>
                </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onReschedule(item.id); }}
                  className="px-4 py-1.5 rounded-full bg-[#4B73B2] text-white text-[13px] font-semibold hover:bg-[#3d6098] transition-colors"
                >
                  Reschedule
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onComplete(item.id); }}
                  className="px-4 py-1.5 rounded-full bg-[#233A78] text-white text-[13px] font-semibold hover:bg-[#1a2b5e] transition-colors"
                >
                  Complete
                </button>
              </div>
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
function PhoneIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function PhoneOffIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>;
}
function UserIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
