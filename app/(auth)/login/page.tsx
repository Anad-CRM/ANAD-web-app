"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isPending, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login({ email, password });
  }

  return (
    <div className="relative w-full max-w-[500px] h-[605px] rounded-[22px] bg-[#F6F6F6] shadow-[0_8px_24px_rgba(27,58,122,0.18)] flex flex-col font-['Inter']">
      
      <div className="absolute top-0 left-0 w-[106px] h-[106px] rounded-full -translate-x-1/2 -translate-y-1/2 bg-[#1E56A0] opacity-20 pointer-events-none z-0" />

      <div className="px-[27px] pt-[66px] h-[139px] z-10 w-full relative pointer-events-none w-[446px]">
        <h2 className="text-[24px] font-bold text-[#0D1B3E] tracking-tight leading-none mb-[12px] m-0">
          Welcome Back
        </h2>
        <p className="text-[14.5px] font-medium text-[#5A7190] leading-none m-0">
          Login here
        </p>
      </div>

      <div className="w-full h-[466px] bg-[#D6E4F0] rounded-[22px] z-20 px-[27px] pt-[22px] relative flex flex-col">
        <form onSubmit={handleSubmit} className="relative flex flex-col w-full h-full">
          
          <div className="flex flex-col mb-[18px]">
            <label className="text-[13.5px] font-semibold text-[#0D1B3E] mb-[8px] leading-none">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-[45px] rounded-[15px] bg-[#F6F6F6] px-[20px] text-[14px] text-[#0D1B3E] outline-none border-none focus:ring-2 focus:ring-[#1E56A0] focus:ring-opacity-40 transition-shadow"
            />
          </div>

          <div className="flex flex-col mb-[14px]">
            <label className="text-[13.5px] font-semibold text-[#0D1B3E] mb-[8px] leading-none">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full h-[45px] rounded-[15px] bg-[#F6F6F6] px-[20px] text-[14px] text-[#0D1B3E] outline-none border-none focus:ring-2 focus:ring-[#1E56A0] focus:ring-opacity-40 transition-shadow"
            />
          </div>

          <div className="flex justify-end mb-[33px]">
            <Link href="/forgot-password" className="text-[13px] font-semibold text-[#163172] hover:opacity-80 transition-opacity leading-none">
              Forgot Password
            </Link>
          </div>

          {error && (
            <div className="absolute left-0 right-0 flex justify-center z-30 pointer-events-none" style={{ top: '185px' }}>
              <p className="text-[12.5px] rounded-[10px] px-3 py-1.5 text-[#EF4444] bg-[#fee2e2] m-0 drop-shadow-sm border border-[#fca5a5] pointer-events-auto">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-[45px] bg-[#163172] text-[14px] font-bold text-white rounded-[15px] shadow-[0_4px_12px_rgba(22,49,114,0.3)] hover:opacity-90 hover:-translate-y-px transition-all disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer flex justify-center items-center"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center justify-center gap-[18px] my-[5px]">
            <span className="w-10 h-[1.5px] bg-[#0D1B3E] opacity-20" />
            <span className="text-[12.5px] font-medium text-[#5A7190] leading-none">Or</span>
            <span className="w-10 h-[1.5px] bg-[#0D1B3E] opacity-20" />
          </div>

          <button
            type="button"
            disabled={isPending}
            className="w-full h-[45px] bg-[#1E56A0] text-[14px] font-bold text-white rounded-[15px] shadow-[0_4px_12px_rgba(30,86,160,0.3)] hover:opacity-90 hover:-translate-y-px transition-all disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer flex justify-center items-center"
          >
            Login With Google
          </button>

          <div className="mt-[40px] text-center w-full">
            <Link href="/signup" className="text-[15px] font-semibold text-[#0D1B3E] hover:opacity-80 transition-opacity hover:underline leading-none">
              Create New Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
