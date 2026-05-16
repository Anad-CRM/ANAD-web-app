/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import { StaffEodSummary, LeadStats } from "../types";
import { COLORS } from "../../../core/components/theme/colors";
import { Text } from "../../../core/components/ui/Text";
import { PhoneOutgoing, PhoneIncoming, Phone, ArrowRight, TrendingUp } from "lucide-react";

const STATUS_CONFIG = [
  { key: "New Lead",       label: "New",          color: COLORS.primaryDark },
  { key: "Hot Lead",       label: "Hot",           color: COLORS.violet },
  { key: "Follow Up",     label: "Follow Up",     color: COLORS.primary },
  { key: "Contacted",     label: "Contacted",     color: COLORS.light_yellow },
  { key: "Not Interested", label: "Not Int.",     color: COLORS.warning },
  { key: "RNR",           label: "RNR",           color: COLORS.dark_orange },
  { key: "Busy",          label: "Busy",          color: COLORS.brown },
  { key: "Switch Off",    label: "Switch Off",    color: COLORS.danger },
  { key: "Disqualified",  label: "Disqualified",  color: COLORS.subtle },
  { key: "Assigned",      label: "Assigned",      color: COLORS.anccent_green },
];

function calcWidth(count: number, total: number) {
  if (total === 0 || count === 0) return 0;
  return Math.max(4, Math.round((count / total) * 100));
}

export default function EodReportsSection({ eodData }: { eodData: StaffEodSummary[] }) {
  const activeEods = eodData.filter((staff) => {
    const eod = staff.eods?.[0];
    return (eod?.leadStats?.totalLeads || 0) > 0 || (eod?.callStats?.totalCalls || 0) > 0;
  });

  return (
    <div className="flex flex-col gap-4">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div>
          <Text as="h3" size="custom" weight="bold" className="text-[20px] text-[#1E293B]">
            EOD Reports
          </Text>
          <p className="text-[12px] text-slate-400 mt-0.5">Today&apos;s end-of-day activity</p>
        </div>
        <button className="flex items-center gap-2 text-[13px] font-semibold text-[#1C3A76] hover:underline transition-colors">
          View All <ArrowRight size={14} />
        </button>
      </div>

      {/* ── Card ── */}
      <div
        className="rounded-3xl overflow-hidden shadow-lg"
        style={{ background: "linear-gradient(160deg, #1C3A76 0%, #163172 60%, #0f2558 100%)" }}
      >
        {/* Card inner header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <Text size="custom" weight="bold" className="text-[15px] text-white">Lead Statistics</Text>
              <Text size="custom" weight="light" className="text-[11px] text-white/50">
                {activeEods.length} active staff member{activeEods.length !== 1 ? "s" : ""}
              </Text>
            </div>
          </div>
          {/* Call legend */}
          <div className="hidden sm:flex items-center gap-4 text-white/60 text-[11px]">
            <div className="flex items-center gap-1.5">
              <PhoneOutgoing size={12} /> <span>Out</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PhoneIncoming size={12} /> <span>In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone size={12} /> <span>Total</span>
            </div>
          </div>
        </div>

        {/* ── Rows ── */}
        <div className="px-4 py-3 flex flex-col divide-y divide-white/5">
          {activeEods.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-3 opacity-40">
              <TrendingUp size={32} className="text-white" />
              <Text size="custom" weight="light" className="text-[14px] text-white text-center">
                No EOD activity for today
              </Text>
            </div>
          ) : (
            activeEods.slice(0, 6).map((staff, idx) => {
              const eod = staff.eods?.[0];
              const leadStats = (eod?.leadStats || {}) as LeadStats;
              const callStats = eod?.callStats || { totalCalls: 0, totalIncomingCalls: 0, totalOutgoingCalls: 0, totalMissedCalls: 0, totalDuration: 0 };
              const totalLeads = leadStats.totalLeads || 0;
              const name = staff.userName || "Unknown";
              const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E56A0&color=fff&size=100`;

              return (
                <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 sm:w-[180px] flex-shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/20 shadow-md">
                      <Image
                        src={avatarUrl}
                        width={44}
                        height={44}
                        alt={name}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <Text as="h4" size="custom" weight="normal" className="text-[14px] text-white truncate">
                        {name}
                      </Text>
                      <Text as="p" size="custom" weight="light" className="text-[11px] text-white/50 truncate">
                        {eod?.role || "Staff Member"}
                      </Text>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex h-3 rounded-full overflow-hidden bg-white/10 w-full">
                      {totalLeads === 0 ? (
                        <div className="w-full flex items-center justify-center text-[9px] text-white/30 font-bold">
                          No Data
                        </div>
                      ) : (
                        STATUS_CONFIG.map((config) => {
                          const count = (leadStats as unknown as Record<string, any>)[config.key] || 0;
                          if (count === 0) return null;
                          const widthPct = calcWidth(count, totalLeads);
                          return (
                            <div
                              key={config.key}
                              title={`${config.label}: ${count}`}
                              style={{ width: `${widthPct}%`, backgroundColor: config.color }}
                              className="h-full flex items-center justify-center text-[8px] font-bold text-white/80 border-r border-white/10 last:border-none overflow-hidden whitespace-nowrap"
                            >
                              {widthPct > 8 ? count : ""}
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span>{totalLeads} leads</span>
                      {totalLeads > 0 && (
                        <div className="flex gap-2">
                          {STATUS_CONFIG.filter((c) => (leadStats as any)[c.key] > 0).slice(0, 3).map((c) => (
                            <span key={c.key} className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                              {c.label} {(leadStats as any)[c.key]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Call stats */}
                  <div className="flex items-center gap-5 sm:gap-4 sm:w-[130px] flex-shrink-0 justify-start sm:justify-end">
                    {[
                      { Icon: PhoneOutgoing, value: callStats.totalOutgoingCalls || 0, label: "Out" },
                      { Icon: PhoneIncoming, value: callStats.totalIncomingCalls || 0, label: "In" },
                      { Icon: Phone,         value: callStats.totalCalls || 0,         label: "Total" },
                    ].map(({ Icon, value, label }) => (
                      <div key={label} className="flex flex-col items-center gap-0.5">
                        <Icon size={15} className="text-white/60" />
                        <Text size="custom" weight="bold" className="text-[13px] text-white leading-none">{value}</Text>
                        <Text size="custom" weight="light" className="text-[9px] text-white/40 sm:hidden">{label}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Legend ── */}
        <div className="px-6 pb-5 pt-3 border-t border-white/10">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {STATUS_CONFIG.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <Text size="custom" weight="light" className="text-[11px] text-white/50">{s.label}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
