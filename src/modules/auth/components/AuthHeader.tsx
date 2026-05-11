"use client";

import { usePathname } from "next/navigation";

export default function AuthHeader() {
  const pathname = usePathname();

  let title = "Welcome back!";
  
  if (pathname?.includes("/signup")) {
    title = "Join Us Today!";
  } else if (pathname?.includes("/forgot-password")) {
    title = "Reset Password";
  } else if (pathname?.includes("/verify-otp")) {
    title = "Verification";
  } else if (pathname?.includes("/login")) {
    title = "Welcome back!";
  }

  const isSignup = pathname?.includes("/signup");

  return (
    <h1 
      className={`mt-12 ${isSignup ? "mb-6" : "mb-12"} text-white font-bold text-center tracking-normal drop-shadow-md`}
      style={{ fontSize: '40px', lineHeight: '36px' }}
    >
      {title}
    </h1>
  );
}
