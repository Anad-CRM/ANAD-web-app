export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/signup",
    FORGOT_PASSWORD: "/auth/sendOtp",
    VERIFY_OTP: "/auth/verifyOtp",
    RESET_PASSWORD: "/auth/changePassword",
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
    SET_EOD_MODE: "/eod/setEodMode",
    EOD_FIELDS: "/eod/fields",
    CREATE_EOD_FIELD: "/eod/createEodField",
    UPDATE_EOD_FIELD: (id: string | number) => `/eod/fields/${id}`,
    DELETE_EOD_FIELD: (id: string | number) => `/eod/fields/${id}`,
    GET_ALL_ADS: (orgId: string) => `/ad/getAllAds/${orgId}`,
    GET_AD_STATUS_COUNT: (orgId: string) => `/ad/getAdWiseLeadStatusCount/${orgId}`,
    GET_AD_WITH_MOST_LEADS: "/ad/getAdWithMostLeads",
    GET_AD_BY_ID: "/ad/byId",
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
    // Team-based
    TEAM_TOGGLE: "/autoAssign/teams/toggle-auto-assign",
    TEAM_STATUS: (teamId: string) => `/autoAssign/teams/auto-assign-status/${teamId}`,
    TEAM_UPDATE_ADS: "/autoAssign/teams/update-ads",
    // Manager-based
    MANAGER_TOGGLE: "/autoAssign/managers/toggle-auto-assign",
    MANAGER_STATUS: (orgId: string | number) => `/autoAssign/managers/auto-assign-status/${orgId}`,
    MANAGER_UPDATE_ADS: "/autoAssign/managers/update-ads",
    MANAGER_ADS_STATUS: (managerId: string) => `/autoAssign/managers/ads-status/${managerId}`,
  },
  INTEGRATION: {
    CREATE_WHATSAPP: "/webhook/createWhatsappIntegration",
    DELETE_WHATSAPP: "/webhook/deleteWhatsappIntegration",
    CREATE_SUBSCRIPTION: "/webhook/createSubscription",
    DELETE_SUBSCRIPTION: "/webhook/deleteWebhookSubscription",
    CREATE_GOOGLE: "/ad/connectGoogleAds",
    DELETE_GOOGLE: "/ad/disconnectGoogleAds",
    GENERATE_KEY: "/leads/generateKey",
    DISCONNECT_KEY: "/leads/disconnectSecretKey",
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
