import React from "react";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { AvatarCircle } from "./AvatarCircle";
import type { Staff } from "../types/staff.types";

interface StaffProfileCardProps {
  staff: Staff;
}

export function StaffProfileCard({ staff }: StaffProfileCardProps) {
  const isPending = !staff.userName && !staff.password;
  const isPresent = (staff.attendances?.length ?? 0) > 0;

  return (
    <div
      style={{ backgroundColor: COLORS.primaryDark }}
      className="rounded-[28px] p-6 md:p-8 flex items-center gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
    >
      <AvatarCircle avatar={staff.avatar} size={100} />

      <div className="flex flex-col gap-1">
        <Text as="h2" size="custom" className="text-[22px] md:text-[26px] text-white font-medium tracking-wide">
          {staff.userName || "Invited User"}
        </Text>
        <Text size="custom" className="text-[15px] text-white font-light tracking-wide mb-2" style={{ color: COLORS.subtle }}>
          {staff.role || "—"}
        </Text>

        {isPending ? (
          <StatusBadge label="Pending" color={COLORS.danger} />
        ) : isPresent ? (
          <StatusBadge label="Present" color={COLORS.success} pulse />
        ) : (
          <StatusBadge label="Absent" color={COLORS.primary} />
        )}
      </div>
    </div>
  );
}

function StatusBadge({ label, color, pulse }: { label: string; color: string; pulse?: boolean }) {
  return (
    <div
      style={{ backgroundColor: color }}
      className="w-fit flex items-center gap-2 text-white text-[12px] font-medium px-5 py-1.5 rounded-full"
    >
      {pulse && <span className="w-2 h-2 rounded-full bg-white opacity-90 animate-pulse" />}
      {label}
    </div>
  );
}
