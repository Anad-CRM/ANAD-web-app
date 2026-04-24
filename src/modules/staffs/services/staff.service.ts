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
    const response = await api.post<StaffListResponse>(
      API_ENDPOINTS.STAFF.GET_ALL,
      payload
    );
    return response.data;
  },

  async getStaffById(userId: string | number, organizationId: string | number): Promise<StaffListResponse> {
    const response = await api.post<any>(
      API_ENDPOINTS.STAFF.GET_BY_ROLE,
      { organizationId }
    );
    
    if (response.data.status === "success" && response.data.data) {
       const { managers, staffMembers, teamLeaders, students, managerOwn } = response.data.data;
       const allStaff = [
         ...(managers || []), 
         ...(staffMembers || []), 
         ...(teamLeaders || []), 
         ...(students || [])
       ];
       if (managerOwn) allStaff.push(managerOwn);
       
       const foundStaff = allStaff.find((s: any) => String(s.id) === String(userId));
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
