"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import AuthPanel from "@/modules/auth/components/AuthPanel";
import FullScreenLoader from "@/core/components/ui/FullScreenLoader";
import TextField from "@/core/components/ui/TextField";
import Button from "@/core/components/ui/Button";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import {
  User, Building2, Mail, Lock, MapPin, Clock, Tag, Camera, Eye, EyeOff,
} from "lucide-react";
import {
  PhoneInput,
  defaultCountries,
} from "react-international-phone";
import "react-international-phone/style.css";
import type {
  OrgSignupPayload,
  IndividualSignupPayload,
  StudentSignupPayload,
} from "@/modules/auth/types/auth.types";

type Role = "organization" | "individual" | "student";

const isValidName = (v: string) =>
  v.trim().length >= 3 && /^[a-zA-Z]+( [a-zA-Z]+)*$/.test(v.trim());

const isValidEmail = (v: string) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim());

const isValidPassword = (v: string) =>
  v.length >= 8 &&
  /[A-Z]/.test(v) &&
  /[a-z]/.test(v) &&
  /[0-9]/.test(v) &&
  /[!@#$%^&*(),.?":{}|<>]/.test(v);

function validateWorkingTime(start: string, end: string): string | null {
  if (!start || !end) return "Please select both start and end time";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  if (endMins <= startMins) return "End time must be after start time";
  return null;
}

function FieldLabel({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-white/80 text-[12px] font-semibold px-1 font-poppins min-h-[18px] block mb-1">
      {children || " "}
    </span>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-red-300 text-[11px] font-poppins mt-1 ml-3 mb-0">
      {msg}
    </p>
  );
}

function PasswordField({
  placeholder,
  value,
  onChange,
  error,
  label,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  label?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-0 w-full">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <TextField
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          icon={<Lock size={18} color="#5E5E5E" strokeWidth={2.5} />}
          className={`rounded-full h-[48px] text-[15px] pr-12 focus:ring-2 focus:ring-white/20 ${error ? "border-red-400 ring-1 ring-red-400" : "border-transparent"}`}
          required
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 cursor-pointer"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function PhoneField({
  value,
  onChange,
  error,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-0 relative w-full" style={{ zIndex: 50 }}>
      <FieldLabel>{label}</FieldLabel>
      <div className={`flex items-center w-full h-[48px] bg-white rounded-full transition-all px-1 focus-within:ring-2 focus-within:ring-white/20 ${error ? "border-red-400 ring-1 ring-red-400" : "border-transparent"}`}>
        <PhoneInput
          defaultCountry="in"
          value={value}
          onChange={onChange}
          countries={defaultCountries}
          className="w-full"
          inputClassName="phone-input-custom"
          countrySelectorStyleProps={{
            buttonClassName: "phone-country-custom",
          }}
        />
      </div>
      <FieldError msg={error} />
      <style jsx global>{`
        .phone-input-custom {
          border: none !important;
          background: transparent !important;
          font-family: 'Poppins', sans-serif !important;
          font-size: 15px !important;
          color: #0D1B3E !important;
          width: 100% !important;
          height: 44px !important;
          padding-left: 8px !important;
        }
        .phone-country-custom {
          border: none !important;
          background: transparent !important;
          padding-left: 12px !important;
        }
        .react-international-phone-input-container {
          width: 100%;
          border: none !important;
        }
        .react-international-phone-country-selector-dropdown {
          z-index: 9999 !important;
        }
      `}</style>
    </div>
  );
}

function PillField({
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  required,
  error,
  label,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-0 w-full">
      <FieldLabel>{label}</FieldLabel>
      <TextField
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={icon}
        required={required}
        className={`rounded-full h-[48px] text-[15px] focus:ring-2 focus:ring-white/20 ${error ? "border-red-400 ring-1 ring-red-400" : "border-transparent"}`}
      />
      <FieldError msg={error} />
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0 flex-1">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <Clock size={16} color="#5E5E5E" strokeWidth={2.5} />
        </div>
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[48px] pl-10 pr-4 text-[14px] rounded-full bg-white text-[#0D1B3E] outline-none focus:ring-2 focus:ring-white/20 font-poppins cursor-pointer border-none"
        />
      </div>
    </div>
  );
}

function SignupPageContent() {
  const { signup, isPending, error: authError } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramRole = searchParams?.get("role") as Role | null;
  const [role, setRole] = useState<Role>(paramRole || "organization");

  useEffect(() => {
    if (paramRole && ["organization", "individual", "student"].includes(paramRole)) {
      setRole(paramRole);
    }
  }, [paramRole]);

  const [form, setForm] = useState({
    name: "",
    orgName: "",
    email: "",
    mobile: "+91",
    invitationCode: "",
    address: "",
    workStartTime: "09:00",
    workEndTime: "17:00",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const updateField = (key: keyof typeof form, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate(): boolean {
    const errs: Record<string, string | undefined> = {};

    if (!form.name.trim()) errs.name = "Please enter your full name";
    else if (form.name.length > 30) errs.name = "Name cannot exceed 30 characters";
    else if (!isValidName(form.name)) errs.name = "Min 3 chars, letters only";

    if (role === "organization") {
      if (!form.orgName.trim()) errs.orgName = "Please enter organization name";
      else if (form.orgName.length < 3) errs.orgName = "Min 3 chars required";
    }

    if (!form.email.trim()) errs.email = "Please enter email";
    else if (!/^[a-z]/.test(form.email.trim())) errs.email = "Must start with lowercase letter";
    else if (!isValidEmail(form.email)) errs.email = "Invalid format (user@example.com)";
    else if (!form.email.includes("@")) errs.email = "Must contain @ symbol";
    else if (!form.email.includes(".")) errs.email = "Must contain . symbol";

    const rawPhone = form.mobile.replace(/^\+\d+\s?/, "").replace(/\D/g, "");
    if (!rawPhone) {
      errs.mobile = "Please enter mobile number";
    } else if (form.mobile.startsWith("+91")) {
      if (!/^[6-9]\d{9}$/.test(rawPhone)) errs.mobile = "Please enter a valid 10-digit number";
    } else if (rawPhone.length < 5) {
      errs.mobile = "Valid mobile number required";
    }

    if ((role === "individual" || role === "student") && !form.invitationCode.trim()) {
      errs.invitationCode = "Invitation code required";
    }

    if (!form.address.trim()) errs.address = "Please enter location";
    else if (form.address.trim().length < 5) errs.address = "Address is too short (min 5 chars)";
    else if (!/[a-zA-Z]/.test(form.address)) errs.address = "Must contain letters";

    if (!form.password) errs.password = "Please enter password";
    else if (!isValidPassword(form.password)) errs.password = "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char";

    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";

    if (role === "organization") {
      const timeErr = validateWorkingTime(form.workStartTime, form.workEndTime);
      if (timeErr) errs.workingTime = timeErr;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (role === "organization") {
      await signup({ 
        name: form.name, 
        email: form.email, 
        password: form.password, 
        role: "organization_admin",
        orgName: form.orgName,
        workStartTime: form.workStartTime,
        workEndTime: form.workEndTime,
        address: form.address,
      } as OrgSignupPayload);
    } else if (role === "individual") {
      await signup({ 
        name: form.name, 
        email: form.email, 
        mobile: form.mobile,
        password: form.password, 
        role: "staff",
        invitationCode: form.invitationCode,
        address: form.address,
      } as IndividualSignupPayload);
    } else {
      await signup({ 
        name: form.name, 
        email: form.email, 
        mobile: form.mobile,
        password: form.password, 
        role: "student",
        invitationCode: form.invitationCode,
        address: form.address,
      } as StudentSignupPayload);
    }
  }

  const ic = "#5E5E5E";

  return (
    <>
      <AuthPanel hideSphere allowOverflow className="w-[900px] min-h-[480px] flex flex-col justify-center py-6">
        <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-0 px-10 relative z-10">
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 w-full">
            
            <div className="flex flex-col gap-3">
              <PillField
                label="Full Name"
                placeholder="Full Name"
                value={form.name}
                onChange={(v) => updateField("name", v)}
                icon={<User size={18} color={ic} strokeWidth={2.5} />}
                required
                error={errors.name}
              />

              {role === "organization" ? (
                <PillField
                  label="Organization Name"
                  placeholder="Organization Name"
                  value={form.orgName}
                  onChange={(v) => updateField("orgName", v)}
                  icon={<Building2 size={18} color={ic} strokeWidth={2.5} />}
                  required
                  error={errors.orgName}
                />
              ) : (
                <PhoneField
                  label="Mobile Number"
                  value={form.mobile}
                  onChange={(v) => updateField("mobile", v)}
                  error={errors.mobile}
                />
              )}

              {role === "organization" ? (
                <PhoneField
                  label="Mobile Number"
                  value={form.mobile}
                  onChange={(v) => updateField("mobile", v)}
                  error={errors.mobile}
                />
              ) : (
                <PillField
                  label="Address"
                  placeholder="Address"
                  value={form.address}
                  onChange={(v) => updateField("address", v)}
                  icon={<MapPin size={18} color={ic} strokeWidth={2.5} />}
                  required
                  error={errors.address}
                />
              )}

              {role === "organization" ? (
                <div className="flex flex-col gap-0 w-full">
                  <FieldLabel>Address</FieldLabel>
                  <div className="relative">
                    <div className="absolute left-4 top-[14px] z-10">
                      <MapPin size={18} color={errors.address ? "#f87171" : ic} strokeWidth={2.5} />
                    </div>
                    <textarea
                      placeholder="Address"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      rows={2}
                      className={`w-full pl-10 pr-4 pt-[13px] pb-3 text-[15px] rounded-[24px] bg-white text-[#0D1B3E] outline-none transition-all duration-200 placeholder:text-gray-400 resize-none font-poppins border-none focus:ring-2 focus:ring-white/20 ${errors.address ? "ring-2 ring-red-400" : ""}`}
                    />
                  </div>
                  <FieldError msg={errors.address} />
                </div>
              ) : (
                <PillField
                  label="Invitation Code"
                  placeholder="Invitation Code"
                  value={form.invitationCode}
                  onChange={(v) => updateField("invitationCode", v)}
                  icon={<Tag size={18} color={ic} strokeWidth={2.5} />}
                  required
                  error={errors.invitationCode}
                />
              )}
            </div>

            <div className="flex flex-col gap-3">
              {role === "organization" ? (
                <div className="flex flex-col gap-0">
                  <div className="flex gap-3">
                    <TimeField label="Start Time" value={form.workStartTime} onChange={(v) => updateField("workStartTime", v)} />
                    <TimeField label="End Time" value={form.workEndTime} onChange={(v) => updateField("workEndTime", v)} />
                  </div>
                  <FieldError msg={errors.workingTime} />
                </div>
              ) : (
                <PillField
                  label="Email Address"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(v) => updateField("email", v.toLowerCase())}
                  icon={<Mail size={18} color={ic} strokeWidth={2.5} />}
                  required
                  error={errors.email}
                />
              )}

              {role === "organization" ? (
                <PillField
                  label="Email Address"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(v) => updateField("email", v.toLowerCase())}
                  icon={<Mail size={18} color={ic} strokeWidth={2.5} />}
                  required
                  error={errors.email}
                />
              ) : (
                <PasswordField
                  label="Password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(v) => updateField("password", v)}
                  error={errors.password}
                />
              )}

              {role === "organization" ? (
                <PasswordField
                  label="Password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(v) => updateField("password", v)}
                  error={errors.password}
                />
              ) : (
                <PasswordField
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={(v) => updateField("confirmPassword", v)}
                  error={errors.confirmPassword}
                />
              )}

              {role === "organization" ? (
                <PasswordField
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={(v) => updateField("confirmPassword", v)}
                  error={errors.confirmPassword}
                />
              ) : (
                <div className="flex items-center justify-between mt-auto mb-0 pt-7">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-5 h-[44px] rounded-full bg-white hover:bg-gray-50 transition-all font-poppins text-[#5E5E5E] text-[13px] font-medium shadow-sm cursor-pointer relative z-20"
                  >
                    <Camera size={18} color={ic} />
                    Add Photo
                  </button>

                  <Button
                    type="submit"
                    variant="white"
                    disabled={isPending}
                    className="w-[150px] h-[48px] text-[16px] font-bold font-poppins cursor-pointer relative z-20"
                    style={{ color: COLORS.primary }}
                  >
                    {isPending ? "Creating…" : "Sign Up"}
                  </Button>
                </div>
              )}

              {role === "organization" && (
                <div className="flex items-center justify-between pb-0 mt-3 pt-0">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-5 h-[44px] rounded-full bg-white hover:bg-gray-50 transition-all font-poppins text-[#5E5E5E] text-[13px] font-medium shadow-sm cursor-pointer relative z-20"
                  >
                    <Camera size={18} color={ic} />
                    Add Photo
                  </button>

                  <Button
                    type="submit"
                    variant="white"
                    disabled={isPending}
                    className="w-[150px] h-[48px] text-[16px] font-bold font-poppins cursor-pointer relative z-20"
                    style={{ color: COLORS.primary }}
                  >
                    {isPending ? "Creating…" : "Sign Up"}
                  </Button>
                </div>
              )}

              {authError && (
                <Text as="p" size="xs" className="text-red-300 font-poppins m-0 text-center">
                  {authError}
                </Text>
              )}
            </div>
          </div>
        </form>
      </AuthPanel>

      <div className="mt-12 flex items-center justify-center h-[20px] w-full relative z-10">
        <p className="text-white font-medium text-center m-0" style={{ fontSize: "15px", lineHeight: "15px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="underline cursor-pointer hover:text-white/80 transition-colors bg-transparent border-none p-0 inline font-bold"
            style={{ fontSize: "15px", lineHeight: "15px" }}
          >
            Back to Login
          </button>
        </p>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <SignupPageContent />
    </Suspense>
  );
}
