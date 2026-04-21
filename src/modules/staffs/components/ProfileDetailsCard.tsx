import React from "react";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { Calendar, Mail, BriefcaseIcon, UserIcon } from "lucide-react";
import type { Staff } from "../types/staff.types";

interface ProfileDetailsCardProps {
  staff: Staff;
  formattedDate: string;
}

export function ProfileDetailsCard({ staff, formattedDate }: ProfileDetailsCardProps) {
  return (
    <div
      style={{ backgroundColor: COLORS.primaryDark }}
      className="rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
    >
      {/* Name header */}
      <div className="mb-6">
        <Text size="custom" className="text-[13px] font-light tracking-wide mb-1" style={{ color: COLORS.subtle }}>
          Name
        </Text>
        <Text as="p" size="custom" className="text-[20px] md:text-[22px] text-white font-medium tracking-wide">
          {staff.userName || "—"}
        </Text>
      </div>

      {/* Detail pills */}
      <div className="flex flex-col gap-3">
        <Pill icon={<Mail width={20} height={20} />} text={staff.email || "No email"} />
        <Pill icon={<BriefcaseIcon width={20} height={20} />} text={`Skill Level : ${staff.skillLevel || "Beginner"}`} />
        <Pill icon={<UserIcon width={
          20
        } height={
          20
        } />} text={`Team : ${staff.team?.name || "Unassigned"}`} />
        <Pill icon={<Calendar width={20} height={20} />} text={`Joined at : ${formattedDate}`} />
      </div>
    </div>
  );
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl px-5 py-3 border border-white/5 shadow-sm transition-colors hover:brightness-110"
      style={{ backgroundColor: COLORS.primary }}
    >
      <div
        className="flex-shrink-0 p-2 rounded-lg"
        style={{ backgroundColor: COLORS.primaryDark, color: COLORS.primaryLight }}
      >
        {icon}
      </div>
      <Text size="custom" className="text-[14px] font-medium text-white truncate">{text}</Text>
    </div>
  );
}
