// Matches the keys inside `data.leadCounts` from GET /lead/getFilteredLeadCount
export interface StatusCounts {
  newLeadCount?: number;
  hotLeadCount?: number;
  closedLeadCount?: number;
  registerCount?: number;
  followUpCount?: number;
  unAssignedLeadCount?: number;
  allLeadsCount?: number;
  totalClosedCount?: number;
  totalAssignedCount?: number;

  // Legacy / alternative field names (kept for backward compat)
  newLead?: number;
  hotLead?: number;
  closed?: number;
  registered?: number;
  followUp?: number;
  busy?: number;
  switchedOff?: number;
  rnr?: number;
  notInterested?: number;
  contacted?: number;
  customer?: number;
  disqualified?: number;
}

export interface LeadCountsData {
  // Top-level convenience fields (mapped from statusCounts)
  totalLeads: number;
  unAssignedCount: number;

  // The raw nested object returned by getFilteredLeadCount
  leadCounts?: StatusCounts;

  // Legacy flat shape (kept for backward compat)
  statusCounts?: StatusCounts;

  // Staff per-lead breakdown also returned by the endpoint
  staffLeadCounts?: any[];
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
