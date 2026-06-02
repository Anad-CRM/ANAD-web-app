import axios from "axios";
import { getToken, clearToken } from "@/core/utils/auth";

// export const API_BASE_URL = "http://192.168.0.201:3000"; // Nibin
export const API_BASE_URL = "http://localhost:3000/";  // Local host
// export const API_BASE_URL = "https://api.anad.ae/";  // Live server


export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
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
