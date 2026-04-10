import { api } from "@/core/api/axios";
import { setToken, setUser, clearToken } from "@/core/utils/auth";
import type { LoginPayload, SignupPayload, User } from "@/modules/auth/types/auth.types";

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
    const res = await api.post("/auth/login", payload);
    const { token, user } = res.data.data;
    setToken(token);
    setUser(user);
    return { token, user };
  },

  async signup(payload: SignupPayload): Promise<void> {
    await api.post("/auth/register", payload);
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async verifyOtp(email: string, otp: string): Promise<void> {
    await api.post("/auth/verify-otp", { email, otp });
  },

  async resetPassword(
    password: string,
    confirmPassword: string
  ): Promise<void> {
    await api.post("/auth/reset-password", { password, confirmPassword });
  },

  logout(): void {
    clearToken();
  },
};
