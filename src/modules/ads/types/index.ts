export interface AdCampaignMetrics {
  clicks: number;
  impressions: number;
  leads: number;
  ctr: number;
}

export interface AdCampaign {
  id: string;
  name: string;
  status: string;
  dates?: string;
  metrics: AdCampaignMetrics;
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
