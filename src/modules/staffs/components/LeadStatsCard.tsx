import React from "react";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import Link from "next/link";


interface LeadStat { label: string; value: number; }

interface LeadStatsCardProps {
  stats: LeadStat[];
  userId?: string;
}

export function LeadStatsCard({ stats, userId }: LeadStatsCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <Text as="h3" size="custom" className="text-[17px] ml-1 font-medium" style={{ color: COLORS.text }}>
        Lead Statistics
      </Text>
      <div
        style={{ backgroundColor: COLORS.primaryDark }}
        className="rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
          {stats.map((stat) => (
            <StatItem key={stat.label} label={stat.label} value={stat.value} userId={userId} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, userId }: LeadStat & { userId?: string }) {
  // Construct href with query params
  const params = new URLSearchParams();
  if (label !== "All Leads" && label !== "Total Leads") {
    // Optionally format label to match API expectations if needed
    params.set("status", label); 
  }
  if (userId) {
    params.set("userId", userId);
  }

  const queryString = params.toString();
  const href = `/leads_list${queryString ? `?${queryString}` : ""}`;

  return (
    <Link
      href={href}
      style={{ backgroundColor: COLORS.primaryLight }}
      className="rounded-[18px] p-5 flex flex-col items-center justify-center shadow-inner hover:shadow-md transition-shadow cursor-pointer block no-underline"
    >
      <Text size="custom" className="text-[28px] font-extrabold leading-tight mb-0.5" style={{ color: COLORS.primaryDark }}>
        {value}
      </Text>
      <Text size="custom" className="text-[12px] font-bold text-center leading-tight tracking-wide" style={{ color: COLORS.muted }}>
        {label}
      </Text>
    </Link>
  );
}
