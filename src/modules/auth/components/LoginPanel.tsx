"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

interface LoginPanelProps {
  onCreateAccount: () => void;
}

export default function LoginPanel({ onCreateAccount }: LoginPanelProps) {
  const { login, isPending, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function getOrCreate(key: string, generate: () => string): string {
    if (typeof window === "undefined") return "";
    let val = localStorage.getItem(key);
    if (!val) { val = generate(); localStorage.setItem(key, val); }
    return val;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const deviceId = getOrCreate("deviceId", () => crypto.randomUUID());
    const signinId = getOrCreate("signinId", () => crypto.randomUUID());
    const fcmToken = getOrCreate("fcmToken", () => "web-token-" + crypto.randomUUID());
    await login({
      email,
      password,
      platform: "web",
      token: fcmToken,
      deviceId,
      signinId,
    });
  }
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="px-[30px] pt-[50px] pb-[20px]">
        <h2 className="text-[22px] font-bold text-[#0D1B3E] mb-[4px]">
          Welcome Back
        </h2>
        <p className="text-[14px] text-[#5A7190] font-medium">Login here</p>
      </div>

      <div className="w-full h-[1px] bg-[#C8D6E5]" />

      <div className="bg-[#D6E4F0] px-[30px] pt-[20px] pb-[30px]">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="text-[13px] font-semibold text-[#0D1B3E] mb-[6px]">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[42px] rounded-[12px] bg-white px-[16px] text-[14px] outline-none mb-[16px] focus:ring-2 focus:ring-[#1E56A0]/40"
          />

          <label className="text-[13px] font-semibold text-[#0D1B3E] mb-[6px]">
            Password
          </label>
          <div className="relative mb-[10px]">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[42px] rounded-[12px] bg-white px-[16px] text-[14px] outline-none pr-[40px] focus:ring-2 focus:ring-[#1E56A0]/40"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#163172]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end mb-[24px]">
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-[#163172]"
            >
              Forgot Password
            </Link>
          </div>

          {error && (
            <p className="text-[12px] text-red-500 mb-3 text-center">
              {error}
            </p>
          )}

          <button
            disabled={isPending}
            className="h-[44px] rounded-full bg-[#163172] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(22,49,114,0.3)] mb-[8px]"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center justify-center gap-[12px] my-[8px]">
            <span className="text-[12px] text-[#5A7190] italic">Or</span>
          </div>

          <button
            type="button"
            className="h-[44px] rounded-full bg-[#163172] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(30,86,160,0.3)]"
          >
            Login With Google
          </button>

          <div className="text-center mt-[28px] mb-[10px]">
            <button
              type="button"
              onClick={onCreateAccount}
              className="text-[15px] font-bold text-[#0D1B3E] bg-transparent border-none cursor-pointer"
            >
              Create New Account
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
