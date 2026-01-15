"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Input from "@/components/ui/Input";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Password:", password);
    console.log("Confirm Password:", confirmPassword);
    // later → call reset password API
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
        Create New Password
      </h1>

      <p className="mt-2 text-center text-sm text-gray-500">
        Your new password must be different from your previous
        password.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* New Password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            New Password
          </label>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            }
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            icon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            }
          />
        </div>

        {/* CTA */}
        <Button type="submit" className="mt-6">
                  Change Password
        </Button>
      </form>
    </div>
  );
}
