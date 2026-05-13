"use client";

import React, { useState, useRef } from "react";
import { Text } from "@/core/components/ui/Text";
import Button from "@/core/components/ui/Button";
import { COLORS } from "@/core/components/theme/colors";
import { authService } from "@/modules/auth/services/auth.service";
import { useFeedback } from "@/core/contexts/FeedbackContext";

interface OtpStepProps {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  onNext: () => void;
}

export default function OtpStep({ email, otp, setOtp, onNext }: OtpStepProps) {
  const { showLoader, hideLoader, showToast } = useFeedback();
  const [error, setError] = useState<string | null>(null);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtpArr = otp.split('');
    while (newOtpArr.length < 6) newOtpArr.push('');
    
    if (!digit) {
      newOtpArr[index] = '';
      setOtp(newOtpArr.join(''));
      return;
    }

    newOtpArr[index] = digit;
    const joined = newOtpArr.join('');
    setOtp(joined);

    if (index < 5 && digit) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && (!otp[index] || otp[index] === '') && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      setOtp(pastedData);
      const focusIdx = Math.min(pastedData.length, 5);
      otpRefs[focusIdx].current?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length < 6) {
      setError("Please enter a complete 6-digit OTP code");
      return;
    }

    showLoader();
    try {
      await authService.verifyOtp(email, otp);
      showToast("Code verified successfully", "success");
      onNext();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Invalid or expired OTP", "error");
      setError("Invalid or expired OTP");
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
        className="opacity-100 tracking-normal mb-[25px] sm:mb-[35px]"
      >
        Verification Code
      </Text>

      <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-6 sm:gap-8 items-center">
        <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handleOtpPaste}>
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <input
              key={idx}
              ref={otpRefs[idx]}
              type="text"
              maxLength={1}
              value={otp[idx] || ""}
              onChange={(e) => {
                handleOtpChange(idx, e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
              className="w-[40px] h-[48px] sm:w-[48px] sm:h-[58px] rounded-[10px] sm:rounded-[12px] bg-white text-[18px] sm:text-[20px] font-bold text-[#0D1B3E] text-center outline-none transition-all duration-200 shadow-sm focus:ring-2 border-none"
              style={{ 
                boxShadow: error ? `0px 0px 0px 2px ${COLORS.danger}` : '0px 4px 10px rgba(0,0,0,0.05)' 
              }}
            />
          ))}
        </div>
        
        <Text 
          as="p"
          style={{ fontSize: '13px', lineHeight: '1.4', color: 'rgba(255,255,255,0.8)' }}
          className="font-poppins text-center w-full max-w-[350px] mb-1 px-2"
        >
          Please enter the 6-digit code sent to your email.
        </Text>

        {error && (
          <Text as="p" className="text-[12px] text-center -mt-2" style={{ color: COLORS.danger }}>
            {error}
          </Text>
        )}

        <Button
          type="submit"
          variant="white"
          className="mt-2 w-full max-w-[200px] h-[46px] sm:h-[50px] !font-medium font-poppins transition-all flex items-center justify-center !text-[#5E5E5E] whitespace-nowrap"
          style={{ fontSize: '15px' }}
        >
          Verify OTP
        </Button>
      </form>
    </>
  );
}
