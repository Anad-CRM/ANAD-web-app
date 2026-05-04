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
    GET_FILTERED_LEAD_COUNT: "/lead/getFilteredLeadCount",
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
    GET_TEAM_LEAD_STATUS_COUNTS: "/team/getTeamLeadStatusCounts",
  },
  CALLS: {
    RECORDING: (fileName: string) => `/calls/recording/${fileName}`,
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
  },
  INTEGRATION: {
    CREATE_WHATSAPP: "/webhook/createWhatsappIntegration",
    DELETE_WHATSAPP: "/webhook/deleteWhatsappIntegration",
  },
  CREATE_LEADS: {
    SINGLE: "/lead/createLead",
    BULK_CSV: "/lead/createLeadByCSV"
  },
  EXPORT: {
    DOWNLOAD: "/export/download",
  },
  STAFF: {
    GET_ALL: "/staff/getAllStaff",
    GET_BY_ROLE: "/staff/getStaffByRole",
    GET_BY_ID: "/staff/getStaffById",
  },
  ATTENDANCE: {
    GET_USER_ATTENDANCE: "/attendance/getUserAttendance",
    GET_BY_MONTH: "/attendance/month",
  },
  ACTIVITIES: {
    GET: "/lead/getActivities",
    CREATE: (leadId: string) => `/lead/${leadId}/createActivity`,
  },
  USER: {
    UPDATE_PROFILE: "/user/updateProfile",
  },
  FILE: {
    UPLOAD: "/file/uploadFile",
  },
  INVITATION: {
    SEND: "/invite/sendInvitation",
  },
  NOTIFICATIONS: {
    GET_BY_USER: "/notification/getByUser",
  },
};
