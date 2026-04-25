export type ActivityKind = 'call_recording' | 'followup' | 'manual' | 'status';

export interface ActivityUser {
  id?: string;
  _id?: string;
  userName?: string;
  avatar?: string;
}

export interface Activity {
  id: string;
  title?: string;
  description?: string;
  notes?: string;
  type?: string;
  status?: string;
  previous_status?: string;
  createdAt?: string;
  created_at?: string;
  phoneNumber?: string;
  callType?: string;
  duration?: number | string;
  fileSize?: number | string;
  fileName?: string;
  user?: ActivityUser;
  staff?: ActivityUser;
  assignedUser?: ActivityUser;
}

export interface FollowupConfig {
  icon: React.ReactNode;
  color: string;
  bg: string;
  label: string;
}

export interface StatusConfig {
  icon: React.ReactNode;
  color: string;
}
