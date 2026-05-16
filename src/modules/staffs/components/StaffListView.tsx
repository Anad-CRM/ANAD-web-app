"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { StaffService } from "../services/staff.service";
import { getUser } from "@/core/utils/auth";
import type { Staff } from "../types/staff.types";
import { StaffCard } from "./StaffCard";
import { ChevronLeft, Search, X } from "lucide-react";


function getRoleTitle(query: string | null): string {
  switch (query) {
    case "managers": return "Manager";
    case "team-leads": return "Team Leader";
    case "students": return "Students";
    default: return "Staff Member";
  }
}

export function StaffListView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageTitle = getRoleTitle(searchParams.get("role"));

  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStaffs = staffs.filter((staff) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      staff.userName?.toLowerCase().includes(term) ||
      staff.email?.toLowerCase().includes(term) ||
      staff.team?.name?.toLowerCase().includes(term) ||
      (staff as any).mobile?.toLowerCase().includes(term) ||
      (staff as any).phoneNumber?.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const user = getUser<{ organizationId: string }>();
        const res = await StaffService.getStaffList({
          organizationId: user?.organizationId ?? "",
          role: pageTitle,
          date: new Date().toISOString().split("T")[0],
        });
        setStaffs(res.status === "success" ? (res.data ?? []) : []);
      } catch {
        setStaffs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageTitle]);

  return (
    <div
      // style={{ backgroundColor: COLORS.bg }}
      className="min-h-screen p-4 md:p-8 rounded-[30px] -m-4 md:-m-6 flex flex-col gap-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-5">
        <button
          onClick={() => router.back()}
          style={{ backgroundColor: COLORS.primaryDark }}
          className="w-[42px] h-[42px] flex items-center justify-center rounded-full text-white hover:opacity-90 transition shadow-md"
        >
          <ChevronLeft width={30} height={30} strokeWidth={1.5} />
        </button>
        <div>
          <Text as="h1" size="custom" weight="bold" className="text-[26px] md:text-[30px] leading-tight" style={{ color: COLORS.text }}>
            All {pageTitle}s
          </Text>
          <Text size="custom" className="text-[14px] mt-1" style={{ color: COLORS.muted }}>
            Directory of your organization&apos;s {pageTitle.toLowerCase()}s
          </Text>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none" style={{ color: COLORS.subtle }}>
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder={`Search ${pageTitle.toLowerCase()}s by name, email, team, phone...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full placeholder-gray-400 border-none rounded-2xl py-4 pl-14 pr-12 focus:outline-none focus:ring-2 transition-all duration-200 text-[15px]"
          style={{
            backgroundColor: COLORS.primaryXlight,
            color: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            outlineColor: COLORS.primary,
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-5 flex items-center hover:opacity-80 transition-opacity"
            style={{ color: COLORS.subtle }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState pageTitle={pageTitle} />
      ) : filteredStaffs.length === 0 ? (
        <EmptyState
          pageTitle={pageTitle}
          message={searchTerm ? `No matches found for "${searchTerm}"` : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStaffs.map((staff) => (
            <StaffCard key={String(staff.id)} staff={staff} pageTitle={pageTitle} />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState({ pageTitle }: { pageTitle: string }) {
  return (
    <div
      className="rounded-[28px] p-10 flex items-center justify-center min-h-[400px]"
      style={{ backgroundColor: COLORS.primaryDark }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: `${COLORS.primaryLight} transparent ${COLORS.primaryLight} ${COLORS.primaryLight}` }}
        />
        <Text size="custom" className="text-[14px]" style={{ color: COLORS.subtle }}>
          Loading {pageTitle}s...
        </Text>
      </div>
    </div>
  );
}

function EmptyState({ pageTitle, message }: { pageTitle: string; message?: string }) {
  return (
    <div
      className="rounded-[28px] p-10 min-h-[400px] flex items-center justify-center"
      style={{ backgroundColor: COLORS.primaryDark }}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={COLORS.primaryLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <Text size="custom" weight="bold" className="text-[20px] text-white">
          {message ? "No Matches Found" : "No Data Available"}
        </Text>
        <Text size="custom" className="text-[14px] max-w-xs" style={{ color: COLORS.subtle }}>
          {message || `No ${pageTitle.toLowerCase()}s found in the directory.`}
        </Text>
      </div>
    </div>
  );
}
