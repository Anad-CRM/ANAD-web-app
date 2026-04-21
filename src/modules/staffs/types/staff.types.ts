export interface StaffTeam {
  id: string | number;
  name: string;
}

export interface StaffLeadCounts {
  totalLeads?: number;
  newLeadCount?: number;
  hotLeadCount?: number;
  followUpCount?: number;
  busyCount?: number;
  rnrCount?: number;
  switchOffCount?: number;
  notInterestedCount?: number;
  closedCount?: number;
  registerCount?: number;
  disqualifiedCount?: number;
}

export interface Staff {
  id: string | number;
  userName?: string;
  email?: string;
  role?: string;
  skillLevel?: string;
  avatar?: string;
  address?: string;
  createdAt?: string;
  team?: StaffTeam;
  attendances?: unknown[];
  leadCounts?: StaffLeadCounts;
  password?: string;
}

export interface AttendanceLog {
  id: string | number;
  createdAt: string;
  userId?: string | number;
  checkIn?: string;
  checkOut?: string;
}

export interface GetStaffListPayload {
  organizationId: string | number;
  role: string;
  date: string;
}

export interface GetAttendancePayload {
  userId: string | number;
  month: number;
  year: number;
}

export interface StaffListResponse {
  status: string;
  data: Staff[];
}

export interface AttendanceResponse {
  status: string;
  data: AttendanceLog[];
}
