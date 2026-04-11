export type CallFilterType = "Total" | "Incoming" | "Outgoing" | "Missed" | "Connected";

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
