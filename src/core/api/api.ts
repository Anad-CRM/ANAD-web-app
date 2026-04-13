export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_OTP: "/auth/verify-otp",
    RESET_PASSWORD: "/auth/reset-password",
  },
  DASHBOARD: {
    OVERVIEW: "/dashboard/overview",
    LEADS: "/dashboard/leads",
    CALLS_ANALYTICS: "/calls/getCallAnalytics",
    SPECIFIC_CALL_TYPE: "/calls/specificCallType",
    TEAMS: "/dashboard/teams",
    EOD: "/dashboard/eod",
    GET_LEAD_COUNTS: "/lead/getLeadCounts",
    GET_AUTO_EOD: "/eod/autoSummary",
    GET_ALL_ADS: (orgId: string) => `/ad/getAllAds/${orgId}`,
    GET_AD_STATUS_COUNT: (orgId: string) => `/ad/getAdWiseLeadStatusCount/${orgId}`,
  },
  TEAM: {
    GET_ALL: "/team/getAllTeams",
    CREATE: "/team/createTeam",
    UPDATE: "/team/update",
    DELETE: "/team/block",
    ACTIVATE: "/team/activate",
    DEACTIVATE: "/team/deactivate",
  },
  FOLLOW_UP: {
    GET_ALL: "/followup/getAllFollowUp",
    SUMMARY: "/followup/summary",
    COMPLETE: (id: number | string) => `/followup/complete/${id}`,
    RESCHEDULE: (id: number | string) => `/followup/reschedule/${id}`,
  },
  AUTO_LEAD: {
    GET_LIVE_ADS: (orgId: string | number) => `/ad/getLiveAds/${orgId}`,
    GET_AUTO_ASSIGN_STATUS: (orgId: string | number) => `/autoAssign/autoAssignStatus/${orgId}`,
    GET_ATTENDANCE_STATUS: (orgId: string | number) => `/autoAssign/attendance-requirement-status/${orgId}`,
    TOGGLE_AUTO_ASSIGN: "/autoAssign/toggleAutoAssignLeads",
    TOGGLE_ATTENDANCE: "/autoAssign/toggle-attendance-requirement",
  }
};
