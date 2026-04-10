"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export default function LoginPage() {
  const { login, isPending, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login({ email, password });
  }

  return (
    <div className="relative w-[420px]">

      <div className="absolute w-[100px] h-[100px] border border-white/30 rounded-full -top-[50px] -left-[50px] z-20"/>

      <div className="relative w-[420px] rounded-[20px] bg-white shadow-[0_8px_24px_rgba(27,58,122,0.18)] overflow-hidden font-['Inter']">

        <div className="absolute w-[100px] h-[100px] rounded-full bg-[#9DB2CE] opacity-40 -top-[50px] -left-[50px] z-10" />

        <div className="px-[30px] pt-[50px] pb-[20px]">
          <h2 className="text-[22px] font-bold text-[#0D1B3E] mb-[4px]">
            Welcome Back
          </h2>

          <p className="text-[14px] text-[#5A7190] font-medium">
            Login here
          </p>
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
              onChange={(e)=>setEmail(e.target.value)}
              className="h-[42px] rounded-[12px] bg-white px-[16px] text-[14px] outline-none mb-[16px] focus:ring-2 focus:ring-[#1E56A0]/40"
            />

            <label className="text-[13px] font-semibold text-[#0D1B3E] mb-[6px]">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="h-[42px] rounded-[12px] bg-white px-[16px] text-[14px] outline-none mb-[10px] focus:ring-2 focus:ring-[#1E56A0]/40"
            />

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
              <Link
                href="/signup"
                className="text-[15px] font-bold text-[#0D1B3E]"
              >
                Create New Account
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}