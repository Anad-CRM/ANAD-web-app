export interface Organization {
  organizationName?: string;
  businessCategory?: string;
  startTime?: string;
  endTime?: string;
}

export interface User {
  id?: string;
  userName?: string;
  email?: string;
  role?: string;
  avatar?: string;
  mobileNumber?: string;
  address?: string;
  organization?: Organization;
  organizationName?: string;
  businessCategory?: string;
  startTime?: string;
  endTime?: string;
}

