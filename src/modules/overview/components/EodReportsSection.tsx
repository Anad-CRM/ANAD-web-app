import React from "react";
import { StaffEodSummary, LeadStats } from "../types";
import { COLORS } from "../../../core/components/theme/colors";
import { Text } from "../../../core/components/ui/Text";
import { Calendar, PhoneOutgoing, PhoneIncoming, Phone } from "lucide-react";

export default function EodReportsSection({ eodData }: { eodData: StaffEodSummary[] }) {

  const statusConfig = [
    { key: "newLead", label: "New Leads", color: COLORS.subtle },
    { key: "hotLead", label: "Hot Leads", color: COLORS.anccent_green },
    {
      key: "followUp", label: "Follow up", color: COLORS.light_green
    },
    { key: "closed", label: "close", color: COLORS.light_yellow },
    { key: "notInterested", label: "Not interested", color: COLORS.warning },
    {
      key: "rnr", label: "RNR", color: COLORS.dark_orange
    },
    { key: "busy", label: "Busy", color: COLORS.brown },
    { key: "switchedOff", label: "Switch Off", color: COLORS.danger },
  ];

  const calculateWidth = (count: number, total: number) => {
    if (total === 0 || count === 0) return 0;
    return Math.max(2, Math.round((count / total) * 100));
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-[15px] font-semibold text-black mb-4">EOD Reports</h3>

      <div className="bg-[#233A78] rounded-2xl p-5 shadow-lg relative">
        <div className="absolute top-4 right-4 text-white">
          <Calendar width={20} height={20} strokeWidth={2} />
        </div>

        <div className="grid grid-cols-[300px_minmax(150px,1fr)_120px] gap-8 mb-4 px-2">
          <div />
          <Text
            size="custom"
            weight="light"
            className="text-[18px] text-white text-center"
          >
            Lead Statistics
          </Text>

          <Text
            size="custom"
            weight="light"
            className="text-[18px] text-white text-center"
          >
            Call Static
          </Text>

        </div>

        <div className="flex flex-col gap-6">
          {(() => {
            const activeEods = eodData.filter((staff) => {
              const eod = staff.eods?.[0];
              const leadStr = eod?.leadStats?.totalLeads || 0;
              const callStr = eod?.callStats?.totalCalls || 0;
              return leadStr > 0 || callStr > 0;
            });

            if (activeEods.length === 0) {
              return (
                <Text as="div" className="text-white text-center py-6 opacity-50 text-[14px]" size="custom" weight="light">
                  No EOD activity available for today
                </Text>
              );
            }

            return activeEods.slice(0, 5).map((staff, idx) => {
              const eod = staff.eods?.[0];
              const leadStats = eod?.leadStats || {} as LeadStats;
              const callStats = eod?.callStats || { totalCalls: 0, totalIncomingCalls: 0, totalOutgoingCalls: 0, totalMissedCalls: 0, totalDuration: 0 };
              const totalLeads = leadStats.totalLeads || 0;

              const name = staff.userName || "Unknown";
              const pseudoAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E2B77A&color=fff&size=100`;

              return (
                <div key={idx} className="grid grid-cols-[300px_minmax(150px,1fr)_120px] gap-8 items-center px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] rounded-full bg-[#E2B77A] overflow-hidden flex-shrink-0 shadow-md">
                      <img src={pseudoAvatarUrl} width="52" height="52" alt="Avatar" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-[17px] font-bold text-white mb-0.5 truncate">{name}</h4>
                      <p className="text-[12px] text-white/60">{eod?.role || "Staff Member"}</p>
                    </div>
                  </div>

                  <div className="flex items-center w-full relative h-[18px]">
                    {totalLeads === 0 ? (
                      <div className="w-full bg-[#1C2C5E] h-full rounded-full flex items-center justify-center text-[9px] font-bold text-white/30">
                        No Data
                      </div>
                    ) : (
                      statusConfig.map((config, sIdx) => {
                        const count = (leadStats as any)[config.key] || 0;
                        if (count === 0) return null;
                        const widthPct = calculateWidth(count, totalLeads);

                        return (
                          <div
                            key={config.key}
                            style={{ width: `${widthPct}%`, backgroundColor: config.color }}
                            className={`h-full flex items-center justify-center text-[9px] font-bold text-white overflow-hidden border-r border-[#64748B] last:border-none`}
                          >
                            {count}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex items-center justify-between text-white/80">
                    <div className="flex flex-col items-center gap-1">
                      <PhoneOutgoing width={24} height={24} strokeWidth={1.5} />
                      <Text size="custom" weight="light" className="text-[15px]">
                        {callStats.totalOutgoingCalls || 0}
                      </Text>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <PhoneIncoming width={24} height={24} strokeWidth={1.5} />
                      <Text size="custom" weight="light" className="text-[15px]">
                        {callStats.totalIncomingCalls || 0}
                      </Text>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-white">
                      <Phone width={24} height={24} strokeWidth={1.5} />
                      <Text size="custom" weight="light" className="text-[15px]">
                        {callStats.totalCalls || 0}
                      </Text>
                    </div>
                  </div>
                </div>
              );
            })
          })()}
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-white/50 px-2 pb-1 gap-2">
          <div className="flex flex-wrap gap-4">
            {statusConfig.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: s.color }} />
                <Text size="custom">
                  {s.label}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
