export interface TeamUser {
  id: string;
  userName: string;
  role?: string;
  leadCounts: {
    totalLeads: number;
    closedCount: number;
    contactedCount: number;
    [key: string]: number;
  };
}

export interface CreateTeamPayload {
  organizationId: string;
  name: string;
  category?: string;
  typeCategory?: string;
  managerId?: string;
  iconIndex?: number;
}

export interface Team {
  id: string;
  name: string;
  organizationId: string;
  managerId?: string | null;
  manager?: {
    id: string;
    userName: string;
  };
  teamLeaders?: {
    id: string;
    userName: string;
  }[];
  category?: string;
  status: string;
  users: TeamUser[];
  totalLeads?: number;
  positiveLeads?: number;
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
