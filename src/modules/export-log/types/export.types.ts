export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'xml';

export const EXPORT_FORMATS: ExportFormat[] = ['csv', 'xlsx', 'pdf', 'xml'];

export const LEAD_STATUS_OPTIONS = [
  'New Lead',
  'Hot Lead',
  'Contacted',
  'Follow Up',
  'RNR',
  'Switch Off',
  'Busy',
  'Not Interested',
  'Register',
  'Enrolled',
  'Disqualified',
  'Closed',
];

export interface ExportDateRange {
  start: string;
  end: string;
}

export interface ExportPayload {
  format: ExportFormat;
  organizationId?: string;
  staffIds?: string[];
  teamIds?: string[];
  statuses?: string[];
  adIds?: string[];
  dateRange?: ExportDateRange;
  allowEmpty?: boolean;
}

export interface StaffMember {
  id: string;
  userName: string;
  email: string;
  role: string;
}

export interface TeamOption {
  teamId: string;
  teamName: string;
}

export interface AdOption {
  adId: string;
  adName: string;
}
