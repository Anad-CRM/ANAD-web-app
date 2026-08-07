import axios from "axios";
import { getToken, clearToken } from "@/core/utils/auth";

// Base API URL driven by process.env.NEXT_PUBLIC_API_URL, defaulting to production URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.anad.ae";


export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});


api.interceptors.request.use((config) => {
  const token = getToken();
  // console.log("access token-----", token)
  if (token) {
    config.headers.accesstoken = token;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Don't wipe session for message sending / integration endpoints
      const url = error?.config?.url ?? "";
      const isIntegrationError = error?.response?.data?.errorType === 'token_expired';
      const skipLogout = ["/whatsapp/react", "/instagram/send", "/whatsapp/send"].some((p) => url.includes(p)) || isIntegrationError;
      if (!skipLogout) {
        clearToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    const resError = error?.response?.data?.error;
    const message =
      (typeof resError === "string" ? resError : null) ||
      error?.response?.data?.message ||
      (error?.code === "ERR_NETWORK" ? "Cannot reach server — check your connection or backend" : null) ||
      error?.message ||
      "Something went wrong";
    console.error("[API Error]", error?.response?.status, message);
    return Promise.reject(new Error(message));
  }
);
