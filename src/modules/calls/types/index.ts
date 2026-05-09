export type CallFilterType = "Total" | "Incoming" | "Outgoing" | "Missed" | "Connected" | "Rejected" | "Personal" | "New" | "NotPickedUp";

export interface CallLog {
  id: string;
  number: string;
  name?: string;
  callType: string;
  duration: string;
  timestamp: string;
  recordingFile?: string;
  userName?: string; 
  lead?: {
    id: string;
    userName?: string;
    mobileNumber?: string;
  };
}

export interface CallTeamRow {
  id: string;
  avatarUrl?: string;
  name: string;
  callsMade: number;
  received: number;
  missed: number;
  avgDuration: string;
}

export interface CallAnalyticsResponse {
  summary: {
    totalCalls: number;
    totalDuration: number;
    averageDuration: number;
    uniqueContacts: number;
    newCalls: number;
    personalCallLogs: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    hasCalls: boolean;
  };
  callTypes: {
    outgoing: { count: number; duration: number };
    incoming: { count: number; duration: number };
    missed: { count: number };
    rejected: { count: number };
    personalCalls: { count: number; duration: number };
    newCalls: { count: number; duration: number };
    notPickedUpCalls: { count: number };
  };
}
