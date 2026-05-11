
export type UserRole =
  | "Admin"
  | "organization_admin"
  | "manager"
  | "team_leader"
  | "staff"
  | "student";

export interface User {
  id: string;
  userName: string;
  email: string;
  role: string | UserRole;
  organizationId?: string | null;
  organization?: {
    id: string;
    organizationName: string;
    businessCategory?: string;
    secretKey?: string;
  } | null;
  isWhatsAppConnected?: string;
  isFacebookConnected?: string;
  isGoogleConnected?: string;
  avatar?: string | null;
  [key: string]: unknown;
}

export interface LoginPayload {
  email: string;
  password: string;
  platform: string;
  token: string;
  deviceId: string;
  signinId: string;
}

export interface BaseSignupPayload {
  userName: string;
  email: string;
  password: string;
  mobileNumber: string;
  address: string;
  category: "Organization" | "Individual" | "Student";
  platform: "web" | "android" | "ios";
  token: string;
  deviceId: string;
  avatar?: string;
}

export interface OrgSignupPayload extends BaseSignupPayload {
  category: "Organization";
  orgName: string;
  startTime: string;
  endTime: string;
}

export interface IndividualSignupPayload extends BaseSignupPayload {
  category: "Individual";
  invitationCode: string;
}

export interface StudentSignupPayload extends BaseSignupPayload {
  category: "Student";
  invitationCode: string;
}

export type SignupPayload =
  | OrgSignupPayload
  | IndividualSignupPayload
  | StudentSignupPayload;

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}
