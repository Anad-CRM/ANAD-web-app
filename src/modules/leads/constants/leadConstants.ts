export const STATUS_COLORS: Record<string, string> = {
  "New Lead": "#22C55E",
  "Hot Lead": "#3B82F6",
  "Contacted": "#EAB308",
  "Follow Up": "#F97316",
  "RNR": "#A855F7",
  "Switch Off": "#6B7280",
  "Busy": "#EF4444",
  "Not Interested": "#EC4899",
  "Closed": "#6366F1",
  "Register": "#0EA5E9",
  "Enrolled": "#6366F1",
  "Disqualified": "#F59E0B",
  "Customer": "#10B981",
};

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  "New Lead": ["Hot Lead", "Contacted", "Not Interested", "Follow Up", "RNR", "Register", "Enrolled", "Switch Off", "Busy", "Disqualified"],
  "Contacted": ["Hot Lead", "Follow Up", "Register", "Enrolled", "Not Interested", "RNR", "Switch Off", "Disqualified"],
  "Hot Lead": ["Register", "Enrolled", "Contacted", "Not Interested", "Follow Up", "RNR", "Switch Off", "Disqualified"],
  "Follow Up": ["Contacted", "Hot Lead", "Register", "Enrolled", "Not Interested", "RNR", "Switch Off", "Disqualified"],
  "Register": ["Enrolled", "Follow Up", "Not Interested", "Disqualified"],
  "Enrolled": ["Customer"],
  "Closed": ["New Lead", "Hot Lead"],
  "RNR": ["Follow Up", "Contacted", "Not Interested", "Switch Off", "Disqualified"],
  "Busy": ["Follow Up", "Contacted", "Switch Off", "Disqualified"],
  "Not Interested": ["Switch Off", "Busy", "New Lead", "Disqualified"],
  "Switch Off": ["New Lead", "Hot Lead", "Contacted", "Follow Up", "Not Interested", "Disqualified"],
  "Disqualified": ["New Lead", "Hot Lead", "Contacted", "Follow Up"],
};

export const DEFAULT_TRANSITIONS = [
  "New Lead", "Hot Lead", "Contacted", "Follow Up", "RNR", "Switch Off",
  "Busy", "Not Interested", "Register", "Enrolled", "Disqualified",
];
