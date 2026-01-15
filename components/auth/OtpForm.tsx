"use client";

import { useRef, useState } from "react";
import { Lock } from "lucide-react";

export default function OtpForm() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
      {/* Icon */}
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E6F4FB] text-primary">
        <Lock size={24} />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-primary">
        Verify Your Identity
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Please enter the 6-digit code we sent to
      </p>
      

      {/* OTP Inputs */}
      <div className="mt-6 flex justify-center gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputsRef.current[index] = el;
            }}
            value={digit}
            onChange={(e) =>
              handleChange(e.target.value, index)
            }
            onKeyDown={(e) => handleKeyDown(e, index)}
            maxLength={1}
            className={`h-12 w-12 rounded-lg text-center text-lg font-semibold outline-none
              ${
                digit
                  ? "border-2 border-primary"
                  : "border border-gray-200"
              }
              bg-[#F1F4FF]
            `}
          />
        ))}
      </div>

      {/* Verify Button */}
      <button className="mt-6 w-full rounded-lg bg-primary py-3 text-white font-semibold hover:opacity-90">
        Verify otp
      </button>

      {/* Resend */}
      <p className="mt-4 text-sm text-gray-500">
        Didn’t receive the email?{" "}
        <button className="font-medium text-primary hover:underline">
          Resend Code
        </button>
      </p>
    </div>
  );
}
