"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/modules/auth/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-[400px] flex flex-col gap-7">
      <div className="text-center flex flex-col items-center gap-2">
        <div
          className="w-12 h-12 flex items-center justify-center rounded-[13px] text-[22px] font-extrabold text-white"
          style={{ background: "var(--color-primary)", boxShadow: "0 4px 16px rgba(79,110,247,0.3)" }}
        >
          A
        </div>
        <h2 className="text-[22px] font-extrabold">Forgot Password</h2>
        <p className="text-[14px]" style={{ color: "var(--color-muted)" }}>
          {sent
            ? "Check your inbox for the reset link."
            : "Enter your email address and we'll send you a reset link."}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold" style={{ color: "var(--color-text)" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 px-3.5 rounded-[10px] text-[14px] outline-none transition-all duration-200 w-full"
              style={{
                border: "1.5px solid var(--color-border)",
                color: "var(--color-text)",
                background: "var(--color-surface)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,110,247,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {error && (
            <p className="text-[13px] px-3.5 py-2.5 rounded-[10px]" style={{ color: "var(--color-danger)", background: "#fee2e2" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="h-[46px] text-white font-bold text-[15px] rounded-[10px] border-none cursor-pointer transition-all duration-200 w-full disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--color-primary)" }}
            onMouseEnter={(e) => { if (!isPending) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-primary-dark)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-primary)"; }}
          >
            {isPending ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <div
          className="flex flex-col items-center gap-3 p-7 rounded-2xl text-center"
          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-[22px] font-bold text-white"
            style={{ background: "var(--color-success)" }}
          >
            ✓
          </div>
          <p>Reset link sent to <strong>{email}</strong></p>
        </div>
      )}

      <p className="text-center text-[13px]">
        <Link
          href="/login"
          className="font-semibold no-underline hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          ← Back to Sign In
        </Link>
      </p>
    </div>
  );
}
