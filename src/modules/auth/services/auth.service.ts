import { api } from "@/core/api/axios";
import { API_ENDPOINTS } from "@/core/api/api";
import { setToken, setUser, clearToken } from "@/core/utils/auth";
import type { LoginPayload, SignupPayload, User } from "@/modules/auth/types/auth.types";

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
    console.log("Calling login API with payload:", payload);
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, payload);
      
      if (res.data.status === "failed") {
        const message = res.data.message || "Login failed";
        const error = new Error(message);
        (error as any).status = "failed";
        (error as any).data = res.data;
        throw error;
      }

      const { token, user } = res.data.data;
      setToken(token);
      setUser(user);
      return { token, user };
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("An unexpected error occurred");
    }
  },

  async signup(payload: SignupPayload): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.REGISTER, payload);
  },

  async forgotPassword(email: string): Promise<void> {
    const res = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    if (res.data.status === "failed") {
      throw new Error(res.data.message || "Failed to send reset link");
    }
  },

  async verifyOtp(email: string, otp: string): Promise<void> {
    const res = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, invitationCode: otp });
    if (res.data.status === "failed") {
      throw new Error(res.data.message || "Invalid or expired OTP");
    }
  },

  async resetPassword(
    email: string,
    newPassword: string
  ): Promise<void> {
    const res = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, newPassword });
    if (res.data.status === "failed") {
      throw new Error(res.data.message || "Failed to reset password");
    }
  },

  logout(): void {
    clearToken();
  },
};
