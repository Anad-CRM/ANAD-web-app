"use client";

import React from "react";
import { AuthImage } from "@/core/components/ui/AuthImage";
import { COLORS } from "@/core/components/theme/colors";
import { User } from "lucide-react";
import { API_BASE_URL } from "@/core/api/axios";

interface AvatarCircleProps {
  avatar?: string;
  size?: number;
}

export function AvatarCircle({ avatar, size = 100 }: AvatarCircleProps) {
  const isValidAvatar = avatar && avatar !== "null" && avatar !== "undefined";

  return (
    <div
      style={{ width: size, height: size, backgroundColor: COLORS.primaryLight }}
      className="rounded-full flex-shrink-0 overflow-hidden relative shadow-inner flex items-center justify-center"
    >
      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
        <User width={size * 0.5} height={size * 0.5} className="text-gray-400" />
      </div>

      {isValidAvatar && (
        <AuthImage
          src={`${API_BASE_URL}uploads/${avatar}`}
          alt="Staff avatar"
          className="w-full h-full object-cover absolute inset-0 z-10"
        />
      )}
    </div>
  );
}
