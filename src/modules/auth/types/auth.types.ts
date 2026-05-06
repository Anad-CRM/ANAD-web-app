//this page is just like local db

export type UserRole =
  | "admin"
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
  } | null;
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

export interface OrgSignupPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "organization_admin";
}

export interface IndividualSignupPayload {
  name: string;
  email: string;
  mobile: string;
  address: string;
  password: string;
  confirmPassword: string;
  role: "manager" | "team_leader" | "staff";
}

export interface StudentSignupPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
  workStartTime: string;
  workEndTime: string;
  role: "student";
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
