"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import type {
  OrgSignupPayload,
  IndividualSignupPayload,
  StudentSignupPayload,
} from "@/types/auth.types";

type Role = "organization" | "individual" | "student";

const ROLES: { id: Role; label: string; sub: string }[] = [
  { id: "organization", label: "Organization", sub: "Company Administrator" },
  { id: "individual", label: "Individual", sub: "Staff / Team Leader / Manager" },
  { id: "student", label: "Student", sub: "Register as a Student" },
];

export default function SignupPage() {
  const { signup, isPending, error } = useAuth();
  const [role, setRole] = useState<Role>("individual");

  const [orgForm, setOrgForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const [indForm, setIndForm] = useState({ name: "", email: "", mobile: "", address: "", password: "", confirmPassword: "" });

  const [stuForm, setStuForm] = useState({ name: "", email: "", mobile: "", password: "", workStartTime: "09:00", workEndTime: "17:00" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === "organization") {
      const payload: OrgSignupPayload = { ...orgForm, role: "organization_admin" };
      await signup(payload);
    } else if (role === "individual") {
      const payload: IndividualSignupPayload = { ...indForm, role: "staff" };
      await signup(payload);
    } else {
      const payload: StudentSignupPayload = { ...stuForm, role: "student" };
      await signup(payload);
    }
  }

  return (
    <div className="signup-wrap">
      <div className="signup-header">
        <div className="login-logo">A</div>
        <h2>Create New Account</h2>
        <p className="text-muted">Choose your role and fill in the details</p>
      </div>

      <div className="role-tabs">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`role-tab${role === r.id ? " active" : ""}`}
            onClick={() => setRole(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        {role === "organization" && (
          <>
            <Field label="Full Name" type="text" placeholder="Nick Johnson" value={orgForm.name} onChange={(v) => setOrgForm({ ...orgForm, name: v })} />
            <Field label="Email" type="email" placeholder="you@company.com" value={orgForm.email} onChange={(v) => setOrgForm({ ...orgForm, email: v })} />
            <Field label="Password" type="password" placeholder="••••••••" value={orgForm.password} onChange={(v) => setOrgForm({ ...orgForm, password: v })} />
            <Field label="Confirm Password" type="password" placeholder="••••••••" value={orgForm.confirmPassword} onChange={(v) => setOrgForm({ ...orgForm, confirmPassword: v })} />
          </>
        )}

        {role === "individual" && (
          <>
            <Field label="Full Name" type="text" placeholder="Nick Johnson" value={indForm.name} onChange={(v) => setIndForm({ ...indForm, name: v })} />
            <Field label="Email" type="email" placeholder="you@example.com" value={indForm.email} onChange={(v) => setIndForm({ ...indForm, email: v })} />
            <div className="field-row">
              <div className="phone-prefix">+91</div>
              <input className="phone-input" type="tel" placeholder="Mobile Number" value={indForm.mobile} onChange={(e) => setIndForm({ ...indForm, mobile: e.target.value })} />
            </div>
            <Field label="Address" type="text" placeholder="City, State" value={indForm.address} onChange={(v) => setIndForm({ ...indForm, address: v })} />
            <Field label="Password" type="password" placeholder="••••••••" value={indForm.password} onChange={(v) => setIndForm({ ...indForm, password: v })} />
            <Field label="Confirm Password" type="password" placeholder="••••••••" value={indForm.confirmPassword} onChange={(v) => setIndForm({ ...indForm, confirmPassword: v })} />
          </>
        )}

        {role === "student" && (
          <>
            <Field label="Full Name" type="text" placeholder="Nick Johnson" value={stuForm.name} onChange={(v) => setStuForm({ ...stuForm, name: v })} />
            <Field label="Email" type="email" placeholder="you@example.com" value={stuForm.email} onChange={(v) => setStuForm({ ...stuForm, email: v })} />
            <div className="field-row">
              <div className="phone-prefix">+91</div>
              <input className="phone-input" type="tel" placeholder="Mobile Number" value={stuForm.mobile} onChange={(e) => setStuForm({ ...stuForm, mobile: e.target.value })} />
            </div>
            <Field label="Password" type="password" placeholder="••••••••" value={stuForm.password} onChange={(v) => setStuForm({ ...stuForm, password: v })} />
            <div className="working-time">
              <label className="field-label">Working Time</label>
              <div className="time-inputs">
                <input type="time" value={stuForm.workStartTime} onChange={(e) => setStuForm({ ...stuForm, workStartTime: e.target.value })} />
                <span>—</span>
                <input type="time" value={stuForm.workEndTime} onChange={(e) => setStuForm({ ...stuForm, workEndTime: e.target.value })} />
              </div>
            </div>
          </>
        )}

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <p className="signin-link">
        Already have an account? <Link href="/login">Sign In</Link>
      </p>

      <style>{`
        .signup-wrap { width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 24px; }
        .signup-header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .login-logo { width: 48px; height: 48px; background: var(--color-primary); border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #fff; box-shadow: 0 4px 16px rgba(79,110,247,0.3); }
        .signup-header h2 { font-size: 22px; font-weight: 800; }
        .role-tabs { display: flex; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 4px; gap: 4px; }
        .role-tab { flex: 1; padding: 8px 4px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 600; color: var(--color-muted); cursor: pointer; transition: background 0.15s, color 0.15s; }
        .role-tab.active { background: var(--color-primary); color: #fff; }
        .signup-form { display: flex; flex-direction: column; gap: 14px; }
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field label, .field-label { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .field input, .phone-input { width: 100%; height: 44px; padding: 0 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 14px; color: var(--color-text); background: var(--color-surface); outline: none; transition: border-color 0.18s, box-shadow 0.18s; }
        .field input:focus, .phone-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(79,110,247,0.12); }
        .field-row { display: flex; align-items: center; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background: var(--color-surface); }
        .phone-prefix { padding: 0 12px; font-size: 14px; font-weight: 600; color: var(--color-muted); border-right: 1px solid var(--color-border); display: flex; align-items: center; height: 44px; background: #f9fafb; }
        .phone-input { border: none !important; border-radius: 0 !important; box-shadow: none !important; flex: 1; }
        .working-time { display: flex; flex-direction: column; gap: 6px; }
        .time-inputs { display: flex; align-items: center; gap: 10px; }
        .time-inputs input { flex: 1; height: 44px; padding: 0 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 14px; color: var(--color-text); background: var(--color-surface); outline: none; }
        .time-inputs input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(79,110,247,0.12); }
        .time-inputs span { color: var(--color-muted); font-size: 16px; }
        .error-msg { color: var(--color-danger); font-size: 13px; background: #fee2e2; padding: 10px 14px; border-radius: var(--radius-md); }
        .btn-primary { height: 46px; background: var(--color-primary); color: #fff; font-weight: 700; font-size: 15px; border-radius: var(--radius-md); border: none; cursor: pointer; transition: background 0.18s, transform 0.1s; }
        .btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .signin-link { text-align: center; font-size: 13px; color: var(--color-muted); }
        .signin-link a { color: var(--color-primary); font-weight: 600; text-decoration: none; }
        .signin-link a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange }: { label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}
