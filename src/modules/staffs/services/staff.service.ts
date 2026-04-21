import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import type {
  GetStaffListPayload,
  GetAttendancePayload,
  StaffListResponse,
  AttendanceResponse,
} from "../types/staff.types";

export const StaffService = {
  /** Get all staff filtered by role and date */
  async getStaffList(payload: GetStaffListPayload): Promise<StaffListResponse> {
    const response = await api.post<StaffListResponse>(
      API_ENDPOINTS.STAFF.GET_ALL,
      payload
    );
    return response.data;
  },

  /** Get a single staff member by their user ID */
  async getStaffById(userId: string | number): Promise<StaffListResponse> {
    const response = await api.post<StaffListResponse>(
      API_ENDPOINTS.STAFF.GET_BY_ID,
      { userId }
    );
    
    return response.data;
  },

  /** Get monthly attendance logs for a staff member */
  async getAttendance(payload: GetAttendancePayload): Promise<AttendanceResponse> {
    const response = await api.post<AttendanceResponse>(
      API_ENDPOINTS.ATTENDANCE.GET_USER_ATTENDANCE,
      payload
    );
    return response.data;
  },
};
