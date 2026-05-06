/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import type {
  GetStaffListPayload,
  GetAttendancePayload,
  StaffListResponse,
  AttendanceResponse,
} from "../types/staff.types";

export const StaffService = {
  async getStaffList(payload: GetStaffListPayload): Promise<StaffListResponse> {
    const response = await api.post<Record<string, unknown>>(
      API_ENDPOINTS.STAFF.GET_BY_ROLE,
      { organizationId: payload.organizationId, date: payload.date }
    );

    if (response.data.status !== "success" || !response.data.data) {
      return { status: "failed", data: [] } as unknown as StaffListResponse;
    }

    const { managers, staffMembers, teamLeaders, students } = response.data.data as any;

    const roleMap: Record<string, unknown[]> = {
      "Manager": managers ?? [],
      "Team Leader": teamLeaders ?? [],
      "Staff Member": staffMembers ?? [],
      "Students": students ?? [],
    };

    const filtered = roleMap[payload.role] ?? [];
    return { status: "success", data: filtered } as unknown as StaffListResponse;
  },

  async getStaffById(userId: string | number, organizationId: string | number): Promise<StaffListResponse> {
    const response = await api.post<Record<string, unknown>>(
      API_ENDPOINTS.STAFF.GET_BY_ROLE,
      { organizationId }
    );
    
    if (response.data.status === "success" && response.data.data) {
       const { managers, staffMembers, teamLeaders, students, managerOwn } = response.data.data as any;
       const allStaff = [
         ...(managers || []), 
         ...(staffMembers || []), 
         ...(teamLeaders || []), 
         ...(students || [])
       ];
       if (managerOwn) allStaff.push(managerOwn);
       
       const foundStaff = allStaff.find((s: Record<string, unknown>) => String(s.id) === String(userId));
       if (foundStaff) {
          return { status: "success", data: [foundStaff] } as unknown as StaffListResponse;
       }
    }
    return { status: "failed", data: [] } as unknown as StaffListResponse;
  },

  async getAttendance(payload: GetAttendancePayload): Promise<AttendanceResponse> {
    const response = await api.post<AttendanceResponse>(
      API_ENDPOINTS.ATTENDANCE.GET_USER_ATTENDANCE,
      payload
    );
    return response.data;
  },
};
