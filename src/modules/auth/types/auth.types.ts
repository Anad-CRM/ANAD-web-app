export type UserRole =
  | "organization_admin"
  | "manager"
  | "team_leader"
  | "staff"
  | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  profilePicture?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
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
