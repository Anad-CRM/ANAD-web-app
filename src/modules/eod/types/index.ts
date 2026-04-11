import { CallStats, LeadStats } from "@/modules/overview/types";

export interface EodStaffMember {
  userId: string;
  userName: string;
  role: string;
  avatarUrl?: string;
  submitted: boolean;
  callStats: CallStats;
  leadStats: LeadStats;
}

export interface EodChartData {
  label: string;
  count: number;
}

export interface EodModuleTypes {
  staffList: EodStaffMember[];
  selectedStaff: EodStaffMember | null;
  mode: "auto" | "manual";
}
