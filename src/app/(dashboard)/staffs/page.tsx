"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Text } from "@/core/components/ui/Text";
import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { getUser } from "@/core/utils/auth";

export default function StaffsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleQuery = searchParams.get("role");

  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Map the URL query to the exact backend Role Title
  const getRoleTitle = (query: string | null) => {
    switch (query) {
      case "managers": return "Manager";
      case "team-leads": return "Team Leader";
      case "students": return "Students";
      default: return "Staff Member"; // Default to staff member
    }
  };

  const pageTitle = getRoleTitle(roleQuery);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const user = getUser<any>();
        const orgId = user?.organizationId;
        const date = new Date().toISOString().split("T")[0]; // yyyy-mm-dd (UTC)

        const payload = {
          organizationId: orgId,
          role: pageTitle,
          date: date,
        };

        const response = await api.post(API_ENDPOINTS.STAFF.GET_ALL, payload);

        if (response.data?.status === "success") {
          setStaffs(response.data?.data || []);
        } else {
          setStaffs([]);
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
        setStaffs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [pageTitle]);

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="mb-6 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600 border border-transparent hover:border-gray-200"
            title="Go Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-[28px] font-extrabold text-black leading-tight tracking-tight">
            All {pageTitle}s
          </h2>
        </div>
        <Text size="custom" className="text-gray-500 pl-[52px]">
          Directory of all your organization's {pageTitle.toLowerCase()}s
        </Text>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 flex items-center justify-center min-h-[400px]">
          <Text className="text-gray-400">Loading {pageTitle}s...</Text>
        </div>
      ) : staffs.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 shadow-sm min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center text-[#233A78]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <Text size="custom" weight="bold" className="text-[22px] text-black">No Data Available</Text>
            <Text size="custom" className="text-[15px] text-gray-500 max-w-md">
              There are currently no {pageTitle.toLowerCase()}s found in the directory.
            </Text>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffs.map((staff, idx) => (
            <div key={idx} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-[60px] h-[60px] rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 relative">
                  {staff.avatar ? (
                    <>
                      <img
                        src={`https://api.anad.ae/uploads/${staff.avatar}`}
                        alt="Avatar"
                        className="w-full h-full object-cover relative z-10"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#E2E8F0] text-gray-500 z-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E2E8F0] text-gray-500 relative z-10">
                      <svg
                        className="w-10 h-10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>                    </div>
                  )}
                </div>
                <div>
                  <Text weight="bold" className="text-[17px] text-black leading-none block mb-1">
                    {staff.userName || "Invited"}
                  </Text>
                  <Text className="text-[13px] text-gray-500 block truncate max-w-[180px]">
                    {staff.email || "-"}
                  </Text>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-4 flex flex-col gap-3 mt-2">
                <div className="flex justify-between items-center">
                  <Text className="text-[12px] text-gray-500 font-bold">Role / Team</Text>
                  <Text className="text-[12px] text-black font-bold text-right">
                    {staff.role || pageTitle} • {staff.team?.name || "Unassigned"}
                  </Text>
                </div>

                {staff.role === "Staff Member" && (
                  <div className="flex justify-between items-center">
                    <Text className="text-[12px] text-gray-500 font-bold">Skill Level</Text>
                    <Text className="text-[12px] text-black font-bold">{staff.skillLevel || "N/A"}</Text>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Text className="text-[12px] text-gray-500 font-bold">Joined</Text>
                  <Text className="text-[12px] text-black font-bold">
                    {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : "-"}
                  </Text>
                </div>

                <div className="flex gap-2 items-start mt-1">
                  <svg className="flex-shrink-0 mt-0.5 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <Text className="text-[12px] text-gray-600 line-clamp-2 leading-tight">
                    {staff.address || "No Address Found"}
                  </Text>
                </div>
              </div>

              {!staff.userName && !staff.password ? (
                <div className="flex justify-between items-center px-1">
                  <Text weight="bold" className="text-[13px] text-black">Status</Text>
                  <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">Pending</span>
                </div>
              ) : (
                <div className="flex justify-between items-center px-1">
                  <Text weight="bold" className="text-[13px] text-black">Status</Text>
                  <div className="flex items-center gap-2">
                    <Text weight="bold" className={`text-[13px] ${staff.attendances?.length ? "text-green-500" : "text-red-500"}`}>
                      {staff.attendances?.length ? "Present" : "Absent"}
                    </Text>
                    <div className={`w-2.5 h-2.5 rounded-full ${staff.attendances?.length ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

