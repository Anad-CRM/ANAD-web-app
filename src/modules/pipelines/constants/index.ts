import { PipelineMetric } from "../types";

export const PIPELINE_METRICS: Omit<PipelineMetric, "count">[] = [
  { id: "new-lead",       title: "New Lead",       iconName: "UserPlus"     },
  { id: "hot-lead",       title: "Hot Lead",       iconName: "Flame"        },
  { id: "contacted",      title: "Contacted",      iconName: "Phone"        },
  { id: "not-interested", title: "Not Interested", iconName: "ThumbsDown"   },
  { id: "customer",       title: "Customer",       iconName: "User"         },
  { id: "enrolled",       title: "Enrolled",       iconName: "CheckCircle2" },
  { id: "follow-up",      title: "Follow Up",      iconName: "Clock"        },
  { id: "rnr",            title: "RNR",            iconName: "PhoneOff"     },
  { id: "switch-off",     title: "Switch Off",     iconName: "PowerOff"     },
  { id: "busy",           title: "Busy",           iconName: "MinusCircle"  },
  { id: "register",       title: "Register",       iconName: "UserCheck"    },
  { id: "disqualified",   title: "Disqualified",   iconName: "Ban"          },
];
