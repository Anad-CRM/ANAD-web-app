export interface AdCampaign {
  id: number;
  adId: string;
  adAccountId: string | null;
  adName: string;
  organizationId: number;
  totalClicks: number;
  totalImpressions: number;
  platform: string;
  thumbnailUrl: string | null;
  leadCount: number;
  effective_status: string;
  isLive: boolean;
}

export interface AdStatusCount {
  newLeadCount: number;
  hotLeadCount: number;
  closedLeadCount: number;
  registeredLeadCount: number;
  busyLeadCount: number;
  switchedOffLeadCount: number;
  rnrLeadCount: number;
  notInterestedLeadCount: number;
  followUpLeadCount: number;
}

export interface AdWiseStatusResponse {
  adId: string;
  adName: string;
  leadStatusCounts: AdStatusCount;
}

export interface TeamPerformanceMetrics {
  totalSpend: number | string;
  leads: number;
  avgCtr: string;
}

export interface GlobalAdMetrics {
  totalAssigned: number;
  totalClosed: number;
  successRate: string;
}

export interface TeamMemberPerformance {
  userId?: string | number;
  userName?: string;
  assignedCount?: number;
  closedCount?: number;
}

