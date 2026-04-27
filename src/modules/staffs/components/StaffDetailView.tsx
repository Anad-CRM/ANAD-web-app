"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Text } from "@/core/components/ui/Text";
import FullScreenLoader from "@/core/components/ui/FullScreenLoader";
import { COLORS } from "@/core/components/theme/colors";
import { StaffService } from "../services/staff.service";
import type { Staff, AttendanceLog } from "../types/staff.types";
import { StaffProfileCard } from "./StaffProfileCard";
import { LeadStatsCard } from "./LeadStatsCard";
import { ProfileDetailsCard } from "./ProfileDetailsCard";
import { AttendanceCard } from "./AttendanceCard";
import { Calendar, ChevronLeft } from "lucide-react";
import { BackButton } from "@/core/components/ui/BackButton";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "numeric", year: "numeric",
  });
}

import { useAuthContext } from "@/modules/auth/stores/AuthContext";

export function StaffDetailView() {
  const router = useRouter();
  const params = useParams();
  const staffId = params?.id as string;
  const { user } = useAuthContext();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = useCallback(async () => {
    if (!user?.organizationId && !user?.organization?.id) return;
    setLoading(true);
    try {
      const orgId = user.organizationId || user.organization?.id;
      const res = await StaffService.getStaffById(staffId, orgId as string | number);
      if (res.status === "success" && res.data?.length) {
        setStaff(res.data[0]);
      } else {
        setError("Staff member not found.");
      }
    } catch {
      setError("Failed to load staff details.");
    } finally {
      setLoading(false);
    }
  }, [staffId, user]);

  const loadAttendance = useCallback(async (userId: string | number) => {
    try {
      const now = new Date();
      const res = await StaffService.getAttendance({
        userId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      if (res.status === "success") {
        setAttendance(res.data ?? []);
      }
    } catch { }
  }, []);

  useEffect(() => { if (staffId) loadStaff(); }, [staffId, loadStaff]);
  useEffect(() => { if (staff?.id) loadAttendance(staff.id); }, [staff?.id, loadAttendance]);

  if (loading) return <FullScreenLoader />;

  if (error || !staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Text size="custom" weight="bold" className="text-[20px]" style={{ color: COLORS.text }}>
          {error ?? "Something went wrong"}
        </Text>
        <BackButton onClick={() => router.back()} className="mt-4" />
      </div>
    );
  }

  const c = staff.leadCounts ?? {};
  const leadStats = [
    { label: "Total Leads", value: c.totalLeads ?? 0 },
    { label: "New Lead", value: c.newLeadCount ?? 0 },
    { label: "Follow Up", value: c.followUpCount ?? 0 },
    { label: "Busy", value: c.busyCount ?? 0 },
    { label: "Not Interested", value: c.notInterestedCount ?? 0 },
    { label: "Completed", value: c.closedCount ?? 0 },
    { label: "Hot Lead", value: c.hotLeadCount ?? 0 },
    { label: "RNR", value: c.rnrCount ?? 0 },
    { label: "Switch Off", value: c.switchOffCount ?? 0 },
  ];

  return (
    <div
      // style={{ backgroundColor: COLORS.bg }}
      className="min-h-screen p-4 md:p-8 rounded-[30px] -m-4 md:-m-6"
    >
      {/* Scrollbar style */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: ${COLORS.primaryDark}; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${COLORS.primaryLight}; border-radius: 8px; border: 2px solid ${COLORS.primaryDark}; }
      `}} />

      {/* Top Nav */}
      <div className="flex justify-between items-start mb-8 lg:mb-12">
        <div className="flex flex-col gap-5">
          <BackButton />
          <Text as="h1" size="custom" className="text-[22px] md:text-[26px] ml-1 font-medium" style={{ color: COLORS.text }}>
            {staff.role} Profile
          </Text>
        </div>
        <button
          style={{ backgroundColor: COLORS.primaryDark }}
          className="w-[46px] h-[46px] mt-1 flex items-center justify-center rounded-xl text-white hover:opacity-90 transition-opacity shadow-lg"
        >
          <Calendar width={24} height={24} strokeWidth={1.5} />

        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-x-10 items-start">

        {/* LEFT */}
        <div className="xl:col-span-7 flex flex-col gap-8">
          <StaffProfileCard staff={staff} />
          <LeadStatsCard stats={leadStats} userId={staff.id.toString()} />
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-5 flex flex-col gap-8">
          <ProfileDetailsCard staff={staff} formattedDate={formatDate(staff.createdAt)} />
          <AttendanceCard logs={attendance} />
        </div>

      </div>
    </div>
  );
}
