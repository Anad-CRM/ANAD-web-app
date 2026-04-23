export interface TeamUser {
  id: string;
  userName: string;
  leadCounts: {
    totalLeads: number;
    closedCount: number;
    contactedCount: number;
    [key: string]: number;
  };
}

export interface Team {
  id: string;
  name: string;
  organizationId: string;
  managerId?: string | null;
  category?: string;
  status: string;
  users: TeamUser[];
  createdAt: string;
}

export interface TeamsResponse {
  status: string;
  data: Team[];
}

export interface TeamLeadStatusCounts {
  newLead: number;
  hotLead: number;
  closed: number;
  registered: number;
  rnr: number;
  notInterested: number;
  followUp: number;
  contacted: number;
  busy: number;
  switchedOff: number;
  [key: string]: number | undefined;
}

export interface TeamLeadCountsResponse {
  status: string;
  data: {
    statusCounts: TeamLeadStatusCounts;
    unAssignedCount: number;
    totalLeads: number;
  };
}

export interface TeamLeadCountPayload {
  teamId: string;
  organizationId: string;
  filterByUser?: string[];
  startDate?: string;
  endDate?: string;
}
