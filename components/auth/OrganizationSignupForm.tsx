"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Camera,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Props {
  onBack: () => void;
}

export default function OrganizationSignupForm({ onBack }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(name, value);
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl bg-white p-10 shadow-lg">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-primary font-medium hover:underline cursor-pointer"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-primary">
          Create Organization Account
        </h1>
        <p className="mt-1 text-black">
          Join Anad to manage your organization.
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Organization Avatar Upload */}
        <div className="md:col-span-2 flex justify-center">
          <div className="mb-10 flex flex-col items-center">
            <div className="relative">
              {/* Avatar */}
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#F1F4FF] overflow-hidden">
                <Building2 className="text-gray-400" size={32} />
              </div>

              {/* Upload Icon */}
              <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>

            <p className="mt-3 text-sm font-medium text-gray-700">
              Upload Organization Logo
            </p>
            <p className="text-xs text-gray-400">
              JPG or PNG, max 5MB
            </p>
          </div>
        </div>

        {/* Organization Name */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Organization Name
          </label>
          <Input
            name="organizationName"
            placeholder="Enter organization name"
            icon={<Building2 size={18} />}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <Input
            name="email"
            type="email"
            placeholder="Enter email"
            icon={<Mail size={18} />}
            onChange={handleChange}
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mobile Number
          </label>
          <Input
            name="mobile"
            placeholder="Enter Phone Number"
            icon={<Phone size={18} />}
            onChange={handleChange}
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Address
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <MapPin size={18} />
            </span>
            <textarea
              name="address"
              rows={3}
              placeholder="Street, City, State"
              className="w-full rounded-lg bg-textField p-3 pl-10 outline-none resize-none"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Start Time */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <Input
            name="startTime"
            type="time"
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
            icon={<Clock size={18} />}
            onChange={handleChange}
          />
        </div>

        {/* End Time */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            End Time
          </label>
          <Input
            name="endTime"
            type="time"
            icon={<Clock size={18} />}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            icon={<Lock size={18} />}
            className="pr-10"
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <Input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            icon={<Lock size={18} />}
            className="pr-10"
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-3 top-9 text-gray-400"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* CTA */}
      <Button className="mt-8 py-3 text-lg">
        Register Organization
      </Button>

      {/* Footer */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
