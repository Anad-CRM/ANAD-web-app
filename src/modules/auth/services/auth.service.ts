import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { setToken, setUser, clearToken } from "@/core/utils/auth";
import type { LoginPayload, SignupPayload, User } from "@/modules/auth/types/auth.types";

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
    console.log("Calling login API with payload:", payload);
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, payload);
      console.log("Full response status:", res.status);
      console.log("Full response data:", res.data);

      if (res.data.status === "failed") {
        throw new Error(res.data.message || "Login failed");
      }

      const { token, user } = res.data.data;
      setToken(token);
      setUser(user);
      return { token, user };
    } catch (err: unknown) {
      console.error("Login API error (raw):", err);
      throw err;
    }
  },

  async signup(payload: SignupPayload): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.REGISTER, payload);
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  async verifyOtp(email: string, otp: string): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
  },

  async resetPassword(
    password: string,
    confirmPassword: string
  ): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { password, confirmPassword });
  },

  logout(): void {
    clearToken();
  },
};
