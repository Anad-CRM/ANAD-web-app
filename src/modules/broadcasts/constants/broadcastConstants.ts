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
