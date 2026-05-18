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

  rnrCount?: number;
  newCount?: number;
  disqualifiedCount?: number;
  contactedLeadCount?: number;
  notInterestCount?: number;
  busyCount?: number;
  switchOffCount?: number;

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
  staffLeadCounts?: Record<string, unknown>[];
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
  hotLeads?: number;
  followUps?: number;
  closedLeads?: number;
  notInterested?: number;
  rnr?: number;
  busy?: number;
  switchOff?: number;
  inEligible?: number;
  registered?: number;
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

export interface Performer {
  id: string;
  userName: string;
  email: string;
  avatar: string | null;
  closedCount: number;
}

export interface PerformerPeriod {
  start: string;
  end: string;
}

export interface PerformerData {
  period: PerformerPeriod;
  performer: Performer | null;
  leaderboard: Performer[];
}

export interface TopPerformersResponse {
  performerOfMonth: PerformerData;
  performerOfWeek: PerformerData;
}
