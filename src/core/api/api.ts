export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
  DASHBOARD: {
    OVERVIEW: "/dashboard/overview",
    LEADS: "/dashboard/leads",
    CALLS: "/dashboard/calls",
    TEAMS: "/dashboard/teams",
    EOD: "/dashboard/eod",
  },
  TEAM: {
    GET_ALL: "/team/getAllTeams",
    CREATE: "/team/createTeam",
    UPDATE: "/team/update",
    DELETE: "/team/block",
    ACTIVATE: "/team/activate",
    DEACTIVATE: "/team/deactivate",
  }
};
