"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Send OTP to:", email);
    // later → route to /otp
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      {/* Back to Login */}
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft size={18} />
        Back to Login
      </Link>

      {/* Icon */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4FB] text-primary">
          <Lock size={22} />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-center text-2xl font-bold text-gray-900">
        Reset your password
      </h1>

      <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed">
        Enter the email address associated with your Anad account and
        we will send you an OTP to reset your password.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email Address
        </label>

        <Input
          type="email"
          placeholder="Enter registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
        />

        {/* CTA */}
        <Button type="submit" className="mt-6">
          Send OTP to Email
        </Button>
      </form>
    </div>
  );
}
