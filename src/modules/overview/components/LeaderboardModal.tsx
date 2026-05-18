import React from "react";
import { X, Trophy } from "lucide-react";
import { Performer } from "../types";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";
import { AvatarCircle } from "@/modules/staffs/components/AvatarCircle";

interface LeaderboardModalProps {
  open: boolean;
  title: string;
  leaderboard: Performer[];
  onClose: () => void;
}

function getInitialColor(index: number): string {
  const palette = [
    COLORS.primary,
    COLORS.violet,
    COLORS.success,
    COLORS.warning,
    COLORS.info,
    COLORS.dark_orange,
    COLORS.anccent_green,
  ];
  return palette[index % palette.length];
}

export function LeaderboardModal({ open, title, leaderboard, onClose }: LeaderboardModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full max-w-md max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10"
        style={{ animation: "slideUp 0.22s cubic-bezier(.4,0,.2,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#1C3A76]" />
            <span className="text-[18px] font-extrabold text-[#1E293B]">{title}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
          {leaderboard.length === 0 ? (
            <div className="py-10 text-center text-slate-400 font-medium text-[14px]">
              No data available for this period.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((member, idx) => {
                const color = getInitialColor(idx);
                const isTop3 = idx < 3;

                return (
                  <div
                    key={member.id || idx}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl border bg-white hover:bg-gray-50/60 transition-colors shadow-sm"
                    style={{ borderColor: COLORS.grey }}
                  >
                    {/* Rank + avatar */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-6 flex justify-center">
                        <Text size="sm" weight="bold" style={{ color: isTop3 ? COLORS.primary : COLORS.subtle }}>
                          #{idx + 1}
                        </Text>
                      </div>
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: `${color}22`, color }}
                      >

                        
                        {/* {member.avatar ? (
                          <img src={member.avatar} alt={member.userName} className="w-full h-full object-cover" />
                        ) : (
                          member.userName ? member.userName.charAt(0).toUpperCase() : "U"
                        )
                        } */}

                        <AvatarCircle avatar={member.avatar ?? undefined} size={35} backgroundColor={color + '1'} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <Text
                        size="sm"
                        weight="bold"
                        className="truncate block"
                        style={{ color: COLORS.text }}
                      >
                        {member.userName || "Unknown User"}
                      </Text>
                      <Text size="xs" style={{ color: COLORS.subtle }} className="truncate">
                        {member.email || "No email"}
                      </Text>
                    </div>

                    {/* Score */}
                    <div
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl"
                      style={{ backgroundColor: "#EEF4FB" }}
                    >
                      <Text weight="bold" style={{ fontSize: '13px', color: COLORS.primary }}>
                        {member.closedCount} {member.closedCount === 1 ? 'Lead' : 'Leads'}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(30px);opacity:0 } to { transform:translateY(0);opacity:1 } }`}</style>
    </div>
  );
}
