"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ChangePasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center px-4">
      {/* Brand */}
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Anad
      </h1>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Change Password
        </h2>
        <p className="mt-1 text-center text-sm text-gray-500">
          Create a new, strong password for your account
        </p>

        {/* Form */}
        <div className="mt-8 space-y-5">
          {/* Current Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                className="bg-[#F1F4FF] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                👁
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="••••••••"
                className="bg-[#F1F4FF] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                👁
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                className="bg-[#F1F4FF] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                👁
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button className="mt-8 bg-[#0092CB] py-3 text-lg">
          Update Password
        </Button>

        {/* Cancel */}
        <button className="mt-4 w-full text-sm text-gray-600 hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
