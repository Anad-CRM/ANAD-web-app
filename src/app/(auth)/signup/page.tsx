"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type {
  OrgSignupPayload,
  IndividualSignupPayload,
  StudentSignupPayload,
} from "@/modules/auth/types/auth.types";

type Role = "organization" | "individual" | "student";

const ROLES: { id: Role; label: string }[] = [
  { id: "organization", label: "Organization" },
  { id: "individual", label: "Individual" },
  { id: "student", label: "Student" },
];

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold" style={{ color: "var(--color-text)" }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full h-11 px-3.5 text-[14px] rounded-[10px] outline-none transition-all duration-200"
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
  );
}

export default function SignupPage() {
  const { signup, isPending, error } = useAuth();
  const [role, setRole] = useState<Role>("individual");

  const [orgForm, setOrgForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [indForm, setIndForm] = useState({ name: "", email: "", mobile: "", address: "", password: "", confirmPassword: "" });
  const [stuForm, setStuForm] = useState({ name: "", email: "", mobile: "", password: "", workStartTime: "09:00", workEndTime: "17:00" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === "organization") {
      await signup({ ...orgForm, role: "organization_admin" } as OrgSignupPayload);
    } else if (role === "individual") {
      await signup({ ...indForm, role: "staff" } as IndividualSignupPayload);
    } else {
      await signup({ ...stuForm, role: "student" } as StudentSignupPayload);
    }
  }

  return (
    <div className="w-full max-w-[440px] flex flex-col gap-6">
      <div className="text-center flex flex-col items-center gap-2">
        <div
          className="w-12 h-12 flex items-center justify-center rounded-[13px] text-[22px] font-extrabold text-white"
          style={{ background: "var(--color-primary)", boxShadow: "0 4px 16px rgba(79,110,247,0.3)" }}
        >
          A
        </div>
        <h2 className="text-[22px] font-extrabold">Create New Account</h2>
        <p className="text-[14px]" style={{ color: "var(--color-muted)" }}>Choose your role and fill in the details</p>
      </div>

      <div
        className="flex p-1 gap-1 rounded-[10px]"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className="flex-1 py-2 px-1 rounded-[7px] border-none text-[13px] font-semibold cursor-pointer transition-all duration-150"
            style={{
              background: role === r.id ? "var(--color-primary)" : "transparent",
              color: role === r.id ? "#fff" : "var(--color-muted)",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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
            <div
              className="flex items-center rounded-[10px] overflow-hidden"
              style={{ border: "1.5px solid var(--color-border)", background: "var(--color-surface)" }}
            >
              <div
                className="flex items-center px-3 h-11 text-[14px] font-semibold flex-shrink-0"
                style={{ color: "var(--color-muted)", borderRight: "1px solid var(--color-border)", background: "#f9fafb" }}
              >
                +91
              </div>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={indForm.mobile}
                onChange={(e) => setIndForm({ ...indForm, mobile: e.target.value })}
                className="flex-1 h-11 px-3.5 border-none bg-transparent text-[14px] outline-none"
                style={{ color: "var(--color-text)" }}
              />
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
            <div
              className="flex items-center rounded-[10px] overflow-hidden"
              style={{ border: "1.5px solid var(--color-border)", background: "var(--color-surface)" }}
            >
              <div
                className="flex items-center px-3 h-11 text-[14px] font-semibold flex-shrink-0"
                style={{ color: "var(--color-muted)", borderRight: "1px solid var(--color-border)", background: "#f9fafb" }}
              >
                +91
              </div>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={stuForm.mobile}
                onChange={(e) => setStuForm({ ...stuForm, mobile: e.target.value })}
                className="flex-1 h-11 px-3.5 border-none bg-transparent text-[14px] outline-none"
                style={{ color: "var(--color-text)" }}
              />
            </div>
            <Field label="Password" type="password" placeholder="••••••••" value={stuForm.password} onChange={(v) => setStuForm({ ...stuForm, password: v })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold" style={{ color: "var(--color-text)" }}>Working Time</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="time"
                  value={stuForm.workStartTime}
                  onChange={(e) => setStuForm({ ...stuForm, workStartTime: e.target.value })}
                  className="flex-1 h-11 px-3 rounded-[10px] text-[14px] outline-none"
                  style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)", background: "var(--color-surface)" }}
                />
                <span style={{ color: "var(--color-muted)", fontSize: 16 }}>—</span>
                <input
                  type="time"
                  value={stuForm.workEndTime}
                  onChange={(e) => setStuForm({ ...stuForm, workEndTime: e.target.value })}
                  className="flex-1 h-11 px-3 rounded-[10px] text-[14px] outline-none"
                  style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)", background: "var(--color-surface)" }}
                />
              </div>
            </div>
          </>
        )}

        {error && (
          <p
            className="text-[13px] px-3.5 py-2.5 rounded-[10px]"
            style={{ color: "var(--color-danger)", background: "#fee2e2" }}
          >
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
          {isPending ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-[13px]" style={{ color: "var(--color-muted)" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-semibold no-underline hover:underline" style={{ color: "var(--color-primary)" }}>
          Sign In
        </Link>
      </p>
    </div>
  );
}
