import React from "react";
import { FollowUp } from "../types";

export default function FollowUpList({
  followUps,
  onReschedule,
  onComplete,
}: {
  followUps: FollowUp[];
  onReschedule: (id: number) => void;
  onComplete: (id: number) => void;
}) {

  const formatSafeTime = (dateStr?: string, fallback?: string) => {
    let d = new Date(dateStr || "");
    if (isNaN(d.getTime())) {
      d = new Date(fallback || "");
      if (isNaN(d.getTime())) return "N/A";
    }
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  };
  return (
    <div className="flex flex-col gap-4">
      {followUps.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-2 rounded-xl hover:bg-white/30 px-3 -mx-3 transition-colors">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-black shrink-0" />
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-black leading-tight">
                {item.lead?.userName || "Unknown Lead"}
              </span>
              <span className="text-[12px] text-gray-500 flex items-center gap-1">
                <ClockIcon /> {formatSafeTime(item.date, item.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-gray-700">
              <button aria-label="Call" className="hover:text-black">
                <PhoneIcon />
              </button>
              <button aria-label="Missed" className="text-red-500 hover:text-red-600">
                <PhoneOffIcon />
              </button>
              <button aria-label="Profile" className="hover:text-black">
                <UserIcon />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onReschedule(item.id)}
                className="px-4 py-1.5 rounded-full bg-[#4B73B2] text-white text-[13px] font-semibold hover:bg-[#3d6098] transition-colors"
              >
                Reschedule
              </button>
              <button
                onClick={() => onComplete(item.id)}
                className="px-4 py-1.5 rounded-full bg-[#233A78] text-white text-[13px] font-semibold hover:bg-[#1a2b5e] transition-colors"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      ))}

      {followUps.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No follow-ups found.
        </div>
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
