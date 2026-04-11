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
