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
    <>
      <div className="px-8 pt-8 pb-6" style={{ background: "#F6F6F6", borderRadius: "22px 22px 0 0" }}>
        <h2 className="text-[20px] font-extrabold m-0 mb-1" style={{ color: "#0D1B3E" }}>
          Welcome Back
        </h2>
        <p className="text-[13px] m-0" style={{ color: "#5A7190" }}>Login here</p>
      </div>

      <div className="px-8 pt-7 pb-8" style={{ background: "#D6E4F0", borderRadius: "0 0 22px 22px" }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold pl-0.5" style={{ color: "#0D1B3E" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-[45px] px-3.5 border-none rounded-[15px] text-[14px] outline-none transition-shadow duration-200 box-border"
              style={{ background: "#F6F6F6", color: "#0D1B3E" }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(22, 49, 114, 0.25)")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold pl-0.5" style={{ color: "#0D1B3E" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full h-[45px] px-3.5 border-none rounded-[15px] text-[14px] outline-none transition-shadow duration-200 box-border"
              style={{ background: "#F6F6F6", color: "#0D1B3E" }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(22, 49, 114, 0.25)")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>

          <div className="flex justify-end -mt-1.5">
            <Link href="/forgot-password" className="text-[12.5px] font-semibold no-underline hover:underline" style={{ color: "#163172" }}>
              Forgot Password
            </Link>
          </div>

          {error && (
            <p className="text-[12.5px] rounded-lg px-3 py-2 m-0" style={{ color: "#c0392b", background: "rgba(255,255,255,0.7)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-[45px] border-none rounded-[15px] text-[14px] font-bold text-white cursor-pointer tracking-[0.01em] transition-all duration-200 disabled:opacity-65 disabled:cursor-not-allowed hover:enabled:opacity-90 hover:enabled:-translate-y-px"
            style={{ background: "#163172", boxShadow: "0 4px 8px rgba(0,0,0,0.25)" }}
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center gap-2.5 text-[12px] select-none before:flex-1 before:h-px after:flex-1 after:h-px" style={{ color: "#5A7190", ['--tw-content' as string]: "''" }}>
            <div className="flex items-center gap-2.5" style={{ color: "#5A7190" }}>
              <span className="flex-1 h-px" style={{ background: "rgba(22, 49, 114, 0.2)" }} />
              <span className="text-[12px]">Or</span>
              <span className="flex-1 h-px" style={{ background: "rgba(22, 49, 114, 0.2)" }} />
            </div>
          </div>

          <button
            type="button"
            disabled={isPending}
            className="w-full h-[45px] border-none rounded-[15px] text-[14px] font-bold text-white cursor-pointer tracking-[0.01em] transition-opacity duration-200 disabled:opacity-65 disabled:cursor-not-allowed hover:enabled:opacity-90"
            style={{ background: "#1E56A0", boxShadow: "0 4px 8px rgba(0,0,0,0.25)" }}
          >
            Login With Google
          </button>
        </form>

        <div className="text-center mt-5">
          <Link href="/signup" className="text-[13px] font-semibold no-underline hover:underline" style={{ color: "#163172" }}>
            Create New Account
          </Link>
        </div>
      </div>
    </>
  );
}
