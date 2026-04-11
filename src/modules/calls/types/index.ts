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

export interface CallStatusBreakdown {
  connected: number;
  incoming: number;
  missed: number;
  outgoing: number;
}
