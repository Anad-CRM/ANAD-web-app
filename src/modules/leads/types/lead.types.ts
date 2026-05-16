export type LeadStatus =
  | "New Lead"
  | "Hot Lead"
  | "Follow Up"
  | "Contacted"
  | "Closed"
  | "Not Interested"
  | "RNR"
  | "Busy"
  | "Switch Off"
  | "Enrolled"
  | "Register"
  | "Disqualified"
  | "Customer";

export type LeadSource =
  | "Facebook"
  | "Instagram"
  | "WhatsApp"
  | "Google Ads"
  | "Website"
  | "Manual"
  | "CSV Upload"
  | string;

export interface AssignedUser {
  id?: string;
  _id?: string;
  userName?: string;
  name?: string;
  avatar?: string;
}

export interface LeadAd {
  adId?: string;
  adName?: string;
}

export interface Lead {
  id: string;
  name?: string;
  userName?: string;
  email?: string;
  mobile?: string;
  mobileNumber?: string;
  status: LeadStatus;
  source?: LeadSource;
  assignedTo?: string;
  assignedUser?: AssignedUser | null;
  userId?: string;
  teamId?: string;
  organizationId?: string;
  adSet?: string;
  campaignName?: string;
  ad?: LeadAd | null;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
  followUpDate?: string;
  isDuplicated?: boolean;
  formData?: Record<string, any>;
}

export interface Pipeline {
  status: LeadStatus;
  count: number;
}
