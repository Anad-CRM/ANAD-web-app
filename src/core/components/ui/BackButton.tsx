"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
  size?: number;
}

export function BackButton({ onClick, className = "", size = 24 }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={onClick || (() => router.back())}
      className={`w-10 h-10 rounded-full bg-[#1C3A76] flex items-center justify-center text-white hover:bg-[#11234D] transition-colors shadow-md flex-shrink-0 ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft
        width={size}
        height={size}
      />
    </button>
  );
}
