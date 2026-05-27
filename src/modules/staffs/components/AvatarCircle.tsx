"use client";

import React from "react";
import { AuthImage } from "@/core/components/ui/AuthImage";
import { COLORS } from "@/core/components/theme/colors";
import { User } from "lucide-react";

interface AvatarCircleProps {
  avatar?: string;
  size?: number;
  backgroundColor?: string;
}

export function AvatarCircle({ avatar, size = 100, backgroundColor }: AvatarCircleProps) {
  const isValidAvatar = avatar && avatar !== "null" && avatar !== "undefined";
  return (
    <div
      style={{ width: size, height: size, backgroundColor: backgroundColor ?? COLORS.primaryLight }}
      className="rounded-full flex-shrink-0 overflow-hidden relative shadow-inner flex items-center justify-center"
    >
      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
        <User width={size * 0.5} height={size * 0.5} className="text-gray-400" />
      </div>

      {isValidAvatar && (
        <AuthImage
          src={avatar}
          alt="Staff avatar"
          className="w-full h-full object-cover absolute inset-0 z-10"
        />
      )}
    </div>
  );
}
