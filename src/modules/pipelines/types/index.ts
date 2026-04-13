export interface PipelineMetric {
  id: string;
  title: string;
  count: number;
  iconName: string;
}

export interface PipelineData {
  newLeadCount: number;
  hotLeadCount: number;
  contactedLeadCount: number;
  notInterestCount: number;
  customerCount: number;
  closedLeadCount: number;
  followUpCount: number;
  rnrCount: number;
  switchOffCount: number;
  busyCount: number;
  registerCount: number;
  disqualifiedCount: number;
}
