"use client";

import { usePathname } from "next/navigation";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";

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
    <div className={`mt-8 sm:mt-12 ${isSignup ? "mb-4 sm:mb-6" : "mb-8 sm:mb-12"}`}>
      <Text
        as="h1"
        weight="bold"
        className="text-center tracking-normal drop-shadow-md text-[28px] sm:text-[36px] lg:text-[40px]"
        style={{ lineHeight: '1.1', color: COLORS.surface }}
      >
        {title}
      </Text>
    </div>
  );
}
