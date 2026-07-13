export const LEAD_STATUSES = [
  { value: "all", label: "All Leads" },
  { value: "New Lead", label: "New Lead" },
  { value: "Hot Lead", label: "Hot Lead" },
  { value: "Follow Up", label: "Follow Up" },
  { value: "Contacted", label: "Contacted" },
  { value: "Closed", label: "Closed Lead" },
  { value: "Not Interested", label: "Not Interested" },
  { value: "RNR", label: "RNR (Ring No Response)" },
  { value: "Busy", label: "Busy" },
  { value: "Switch Off", label: "Switch Off" },
  { value: "Enrolled", label: "Enrolled" },
  { value: "Register", label: "Registered" },
  { value: "Disqualified", label: "Disqualified" },
  { value: "Customer", label: "Customer" },
] as const;

export type LeadStatusValue = (typeof LEAD_STATUSES)[number]["value"];

export interface BadgeStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const TEMPLATE_STATUS_CONFIG: Record<string, BadgeStyle> = {
  APPROVED: { label: "Approved", bg: "#DEF7EC", text: "#03543F", border: "#DEF7EC" },
  PENDING: { label: "Pending", bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  REJECTED: { label: "Rejected", bg: "#FDE8E8", text: "#9B1C1C", border: "#FCD3D3" },
  PAUSED: { label: "Paused", bg: "#FFEDD5", text: "#9A3412", border: "#FED7AA" },
  DRAFT: { label: "Draft", bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" },
};

export const TEMPLATE_CATEGORY_CONFIG: Record<string, BadgeStyle> = {
  MARKETING: { label: "Marketing", bg: "#FAF5FF", text: "#6B21A8", border: "#E9D5FF" },
  UTILITY: { label: "Utility", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  AUTHENTICATION: { label: "Authentication", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
};

