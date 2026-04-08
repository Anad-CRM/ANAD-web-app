"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

type Role = "organization" | "individual" | "student";

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
      <div className="card-top">
        <h2 className="card-title">Welcome Back</h2>
        <p className="card-sub">Login here</p>
      </div>
      <div className="card-bottom">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field-group">
            <label className="field-label">Email</label>
            <input
              type="email"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="field-input"
            />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="field-input"
            />
          </div>

          <div className="forgot-row">
            <Link href="/forgot-password" className="forgot-link">
              Forgot Password
            </Link>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn-signin" disabled={isPending}>
            {isPending ? "Signing in…" : "Sign in"}
          </button>

          <div className="divider">
            <span>Or</span>
          </div>

          <button type="button" className="btn-google" disabled={isPending}>
            Login With Google
          </button>
        </form>

        <div className="create-row">
          <Link href="/signup" className="create-link">
            Create New Account
          </Link>
        </div>
      </div>

      <style>{`
        /* ── Top section: off-white ── */
        .card-top {
          background: #F6F6F6;
          padding: 32px 32px 24px;
          border-radius: 22px 22px 0 0;
        }
        .card-title {
          font-size: 20px;
          font-weight: 800;
          color: #0D1B3E;
          margin: 0 0 4px;
        }
        .card-sub {
          font-size: 13px;
          color: #5A7190;
          margin: 0;
        }

        /* ── Bottom section: #D6E4F0 light blue ── */
        .card-bottom {
          background: #D6E4F0;
          padding: 28px 32px 32px;
          border-radius: 22px 22px 22px 22px;
        }

        /* ── Form ── */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Fields */
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: #0D1B3E;
          padding-left: 2px;
        }
        .field-input {
          width: 100%;
          height: 45px;
          padding: 0 14px;
          background: #F6F6F6;
          border: none;
          border-radius: 15px;
          font-size: 14px;
          color: #0D1B3E;
          outline: none;
          box-sizing: border-box;
          transition: box-shadow 0.18s;
        }
        .field-input:focus {
          box-shadow: 0 0 0 2px rgba(22, 49, 114, 0.25);
        }

        /* Forgot */
        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -6px;
        }
        .forgot-link {
          font-size: 12.5px;
          color: #163172;
          font-weight: 600;
          text-decoration: none;
        }
        .forgot-link:hover { text-decoration: underline; }

        /* Error */
        .error-msg {
          font-size: 12.5px;
          color: #c0392b;
          background: rgba(255,255,255,0.7);
          border-radius: 8px;
          padding: 8px 12px;
          margin: 0;
        }

        /* Sign in — #163172 dark navy */
        .btn-signin {
          width: 100%;
          height: 45px;
          background: #163172;
          color: #fff;
          border: none;
          border-radius: 15px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: opacity 0.18s, transform 0.1s;
          box-shadow: 0 4px 8px rgba(0,0,0,0.25);
        }
        .btn-signin:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .btn-signin:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Or */
        .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #5A7190;
          font-size: 12px;
          user-select: none;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(22, 49, 114, 0.2);
        }

        /* Google — #1E56A0 medium blue */
        .btn-google {
          width: 100%;
          height: 45px;
          background: #1E56A0;
          color: #fff;
          border: none;
          border-radius: 15px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: opacity 0.18s;
          box-shadow: 0 4px 8px rgba(0,0,0,0.25);
        }
        .btn-google:hover:not(:disabled) { opacity: 0.9; }
        .btn-google:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Create account */
        .create-row {
          text-align: center;
          margin-top: 20px;
        }
        .create-link {
          font-size: 13px;
          color: #163172;
          font-weight: 600;
          text-decoration: none;
        }
        .create-link:hover { text-decoration: underline; }
      `}</style>
    </>
  );
}
