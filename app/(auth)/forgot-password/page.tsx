"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";

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
    <div className="fp-wrap">
      <div className="fp-header">
        <div className="fp-logo">A</div>
        <h2>Forgot Password</h2>
        <p className="text-muted">
          {sent
            ? "Check your inbox for the reset link."
            : "Enter your email address and we'll send you a reset link."}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="fp-form">
          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <div className="success-box">
          <div className="success-icon">✓</div>
          <p>Reset link sent to <strong>{email}</strong></p>
        </div>
      )}

      <p className="back-link">
        <Link href="/login">← Back to Sign In</Link>
      </p>

      <style>{`
        .fp-wrap { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 28px; }
        .fp-header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .fp-logo { width: 48px; height: 48px; background: var(--color-primary); border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #fff; box-shadow: 0 4px 16px rgba(79,110,247,0.3); }
        .fp-header h2 { font-size: 22px; font-weight: 800; }
        .fp-form { display: flex; flex-direction: column; gap: 16px; }
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field label { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .field input { height: 44px; padding: 0 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 14px; color: var(--color-text); background: var(--color-surface); outline: none; transition: border-color 0.18s, box-shadow 0.18s; }
        .field input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(79,110,247,0.12); }
        .error-msg { color: var(--color-danger); font-size: 13px; background: #fee2e2; padding: 10px 14px; border-radius: var(--radius-md); }
        .btn-primary { height: 46px; background: var(--color-primary); color: #fff; font-weight: 700; font-size: 15px; border-radius: var(--radius-md); border: none; cursor: pointer; transition: background 0.18s, transform 0.1s; }
        .btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .success-box { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 28px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-lg); text-align: center; }
        .success-icon { width: 48px; height: 48px; background: var(--color-success); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #fff; font-weight: 700; }
        .back-link { text-align: center; font-size: 13px; }
        .back-link a { color: var(--color-primary); font-weight: 600; text-decoration: none; }
        .back-link a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
