export type LeadStatus =
  | "new_lead"
  | "hot_lead"
  | "follow_up"
  | "contacted"
  | "closed"
  | "not_interested"
  | "rnr"
  | "busy"
  | "switch_off"
  | "enrolled"
  | "registered"
  | "disqualified";

export type LeadSource =
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "google"
  | "manual"
  | "csv_upload"
  | "website";

export interface Lead {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  status: LeadStatus;
  source: LeadSource;
  assignedTo?: string;
  teamId?: string;
  adSet?: string;
  remark?: string;
  createdAt: string;
  followUpDate?: string;
}

export interface Pipeline {
  status: LeadStatus;
  count: number;
}
