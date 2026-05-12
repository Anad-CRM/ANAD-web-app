"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import TextField from "@/core/components/ui/TextField";
import { Text } from "@/core/components/ui/Text";
import Button from "@/core/components/ui/Button";
import { COLORS } from "@/core/components/theme/colors";
import { authService } from "@/modules/auth/services/auth.service";
import { useFeedback } from "@/core/contexts/FeedbackContext";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface EmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  onNext: () => void;
}

export default function EmailStep({ email, setEmail, onNext }: EmailStepProps) {
  const { showLoader, hideLoader, showToast } = useFeedback();
  const [error, setError] = useState<string | null>(null);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter email");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    showLoader();
    try {
      await authService.forgotPassword(email.trim());
      showToast("Verification code sent to your email", "success");
      onNext();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to send reset link", "error");
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
        className="opacity-100 tracking-normal mb-[35px]"
      >
        Forgot Password
      </Text>

      <form onSubmit={handleSendEmail} className="w-full flex flex-col gap-5 items-center">
        <div className="w-[350px]">
          <TextField
            type="email"
            placeholder="Email Address"
            value={email}
            error={error || undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            icon={<Mail size={18} color="#5E5E5E" strokeWidth={2.5} />}
            className="rounded-full shadow-sm h-[64px] text-[15px]"
          />
        </div>
        
        <Text 
          as="p"
          style={{ fontSize: '13px', lineHeight: '1.4', color: 'rgba(255,255,255,0.8)' }}
          className="font-poppins text-center w-[350px] mb-1"
        >
          Enter your email address and we'll send you a reset link.
        </Text>

        <Button
          type="submit"
          variant="white"
          className="mt-6 w-[200px] h-[50px] !font-medium font-poppins transition-all flex items-center justify-center !text-[#5E5E5E] whitespace-nowrap"
          style={{ fontSize: '15px' }}
        >
          Send Reset Link
        </Button>
      </form>
    </>
  );
}
