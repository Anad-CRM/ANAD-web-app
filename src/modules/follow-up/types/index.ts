export interface FollowUpLead {
  id: number;
  userName: string;
  mobileNumber: string;
  email: string;
  status: string;
  assignedUser: {
    id: number;
    userName: string;
  } | null;
  ad: {
    adName: string;
    platform: string;
  };
}

export interface FollowUp {
  id: number;
  notes: string;
  status: string;
  type: string;
  date: string;
  staffId: number;
  userName: string | null;
  avatar: string | null;
  createdAt: string;
  lead: FollowUpLead | null;
}

export interface FollowUpSummary {
  total: number;
  completed: number;
  missed: number;
  pending: number;
  rescheduled: number;
  updatedToMissed: number;
}
