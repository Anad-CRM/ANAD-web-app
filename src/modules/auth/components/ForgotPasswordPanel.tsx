"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmailStep from "./ForgotPassword/EmailStep";
import OtpStep from "./ForgotPassword/OtpStep";
import PasswordStep from "./ForgotPassword/PasswordStep";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPanel() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="flex flex-col items-center w-full h-full justify-center min-h-[300px]">
      {step === "email" && (
        <EmailStep 
          email={email} 
          setEmail={setEmail} 
          onNext={() => setStep("otp")} 
        />
      )}

      {step === "otp" && (
        <OtpStep 
          email={email} 
          otp={otp} 
          setOtp={setOtp} 
          onNext={() => setStep("password")} 
        />
      )}

      {step === "password" && (
        <PasswordStep 
          email={email} 
          onSuccess={() => router.push("/login")} 
        />
      )}
    </div>
  );
}
