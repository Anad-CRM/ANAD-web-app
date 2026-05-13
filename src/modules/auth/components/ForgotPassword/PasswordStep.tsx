"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import TextField from "@/core/components/ui/TextField";
import { Text } from "@/core/components/ui/Text";
import Button from "@/core/components/ui/Button";
import { COLORS } from "@/core/components/theme/colors";
import { authService } from "@/modules/auth/services/auth.service";
import { useFeedback } from "@/core/contexts/FeedbackContext";

const isPasswordValid = (password: string) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
};

interface PasswordStepProps {
  email: string;
  onSuccess: () => void;
}

export default function PasswordStep({ email, onSuccess }: PasswordStepProps) {
  const { showLoader, hideLoader, showToast } = useFeedback();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const setFieldError = (field: string, error: string | null) => {
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!password) {
      setFieldError("password", "Please enter your new password");
      return;
    }
    if (!isPasswordValid(password)) {
      setFieldError("password", "Password must be at least 8 characters with uppercase, lowercase, number, and special character");
      return;
    }
    if (password !== confirmPassword) {
      setFieldError("confirmPassword", "Passwords do not match");
      return;
    }

    showLoader();
    try {
      await authService.resetPassword(email, password);
      showToast("Password updated successfully", "success");
      onSuccess();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to reset password", "error");
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <Text 
        as="h2" 
        weight="semibold"
        style={{ fontSize: '19.31px', lineHeight: '19.31px', color: COLORS.surface }}
        className="opacity-100 tracking-normal mb-6 sm:mb-8"
      >
        Create New Password
      </Text>

      <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-3 sm:gap-4 items-center">
        <div className="relative w-full max-w-[350px]">
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            error={fieldErrors.password || undefined}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldError("password", null);
            }}
            icon={<Lock size={18} color="#5E5E5E" strokeWidth={2.5} />}
            className="rounded-full shadow-sm h-[56px] sm:h-[64px] text-[14px] sm:text-[15px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-[#5E5E5E] hover:text-[#1E56A0] transition-colors z-10 bg-transparent border-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative w-full max-w-[350px]">
          <TextField
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            error={fieldErrors.confirmPassword || undefined}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) setFieldError("confirmPassword", null);
            }}
            icon={<Lock size={18} color="#5E5E5E" strokeWidth={2.5} />}
            className="rounded-full shadow-sm h-[56px] sm:h-[64px] text-[14px] sm:text-[15px]"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-[#5E5E5E] hover:text-[#1E56A0] transition-colors z-10 bg-transparent border-none"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button
          type="submit"
          variant="white"
          className="mt-3 sm:mt-4 w-full max-w-[200px] h-[46px] sm:h-[50px] !font-medium font-poppins transition-all flex items-center justify-center !text-[#5E5E5E] whitespace-nowrap"
          style={{ fontSize: '15px' }}
        >
          Change Password
        </Button>
      </form>
    </>
  );
}
