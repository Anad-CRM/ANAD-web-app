"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { AvatarCircle } from "./AvatarCircle";
import type { Staff } from "../types/staff.types";

interface StaffCardProps {
  staff: Staff;
  pageTitle: string;
}

export function StaffCard({ staff, pageTitle }: StaffCardProps) {
  const router = useRouter();
  const isPending = !staff.userName && !staff.password;
  const isPresent = (staff.attendances as unknown[])?.length > 0;

  return (
    <div
      onClick={() => router.push(`/staffs/${staff.id}`)}
      className="rounded-[24px] p-5 flex flex-col gap-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{
        backgroundColor: COLORS.primaryDark,
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      }}
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-4">
        <AvatarCircle avatar={staff.avatar} size={56} />
        <div className="min-w-0">
          <Text weight="bold" as="p" size="custom" className="text-[16px] text-white leading-tight mb-0.5 truncate">
            {staff.userName || "Invited"}
          </Text>
          <Text as="p" size="custom" className="text-[13px] truncate" style={{ color: COLORS.subtle }}>
            {staff.email || "—"}
          </Text>
        </div>
      </div>

      {/* Info grid */}
      <div
        className="rounded-xl p-4 flex flex-col gap-2.5"
        style={{ backgroundColor: COLORS.primary }}
      >
        <InfoRow label="Role / Team" value={`${staff.role || pageTitle} · ${staff.team?.name || "Unassigned"}`} />
        {staff.role === "Staff Member" && (
          <InfoRow label="Skill Level" value={staff.skillLevel || "N/A"} />
        )}
        <InfoRow
          label="Joined"
          value={staff.createdAt ? new Date(staff.createdAt).toLocaleDateString("en-GB") : "—"}
        />
        <div className="flex items-start gap-2 pt-0.5">
          <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={COLORS.subtle} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <Text as="p" size="custom" className="text-[12px] leading-tight line-clamp-2" style={{ color: COLORS.subtle }}>
            {staff.address || "No Address Found"}
          </Text>
        </div>
      </div>

      {/* Status row */}
      <div className="flex justify-between items-center px-1">
        <Text size="custom" className="text-[12px] font-semibold" style={{ color: COLORS.subtle }}>
          Status
        </Text>
        {isPending ? (
          <span
            className="text-white text-[10px] font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: COLORS.danger }}
          >
            Pending
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <Text
              size="custom"
              className="text-[12px] font-bold"
              style={{ color: isPresent ? COLORS.success : COLORS.danger }}
            >
              {isPresent ? "Present" : "Absent"}
            </Text>
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: isPresent ? COLORS.success : COLORS.danger }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <Text size="custom" className="text-[11px] font-semibold shrink-0" style={{ color: COLORS.subtle }}>
        {label}
      </Text>
      <Text size="custom" className="text-[11px] font-semibold text-white text-right truncate">
        {value}
      </Text>
    </div>
  );
}
