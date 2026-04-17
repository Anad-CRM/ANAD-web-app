import axios from "axios";
import { getToken, clearToken } from "@/core/utils/auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, "") + "/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.accesstoken = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    const message =
      error?.response?.data?.message ||
      (error?.code === "ERR_NETWORK" ? "Cannot reach server — check your connection or backend" : null) ||
      error?.message ||
      "Something went wrong";
    console.error("[API Error]", error?.response?.status, message);
    return Promise.reject(new Error(message));
  }
);
