export interface StatusCounts {
  newLead?: number;
  hotLead?: number;
  closed?: number;
  registered?: number;
  busy?: number;
  switchedOff?: number;
  rnr?: number;
  notInterested?: number;
  followUp?: number;
  contacted?: number;
  customer?: number;
  disqualified?: number;
}

export interface LeadCountsData {
  statusCounts: StatusCounts;
  unAssignedCount: number;
  totalLeads: number;
}

export interface CallStats {
  totalCalls: number;
  totalIncomingCalls: number;
  totalOutgoingCalls: number;
  totalMissedCalls: number;
  totalDuration: number;
}

export interface LeadStats {
  staffName?: string;
  newLeads: number;
  totalLeads: number;
  [key: string]: any;
}

export interface EodRecord {
  id: number;
  date: string;
  callStats: CallStats;
  leadStats: LeadStats;
  role: string;
}

export interface StaffEodSummary {
  userName: string;
  eods: EodRecord[];
  submitted?: boolean;
}
