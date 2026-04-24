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

export function BackButton({ onClick, className = "", size = 20 }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={onClick || (() => router.back())}
      style={{ 
        backgroundColor: COLORS.surface, 
        border: `1px solid ${COLORS.border}`
      }}
      className={`w-[42px] h-[42px] flex items-center justify-center rounded-full hover:shadow-lg transition-all shadow-md ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft
        width={size}
        height={size}
        strokeWidth={2.5}
        style={{ color: COLORS.primary }}
      />
    </button>
  );
}
