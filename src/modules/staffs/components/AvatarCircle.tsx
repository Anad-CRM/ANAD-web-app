"use client";

import React from "react";
import { AuthImage } from "@/core/components/ui/AuthImage";
import { COLORS } from "@/core/components/theme/colors";
import { PersonIcon } from "./icons";

interface AvatarCircleProps {
  avatar?: string;
  size?: number;
}

export function AvatarCircle({ avatar, size = 100 }: AvatarCircleProps) {
  return (
    <div
      style={{ width: size, height: size, backgroundColor: COLORS.primaryLight }}
      className="rounded-full flex-shrink-0 overflow-hidden relative shadow-inner"
    >
      {/* Person icon always sits beneath as fallback */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-0">
        <PersonIcon size={size * 0.45} />
      </div>

      {/* AuthImage overlays on top when loaded */}
      {avatar && (
        <AuthImage
          src={`https://api.anad.ae/uploads/${avatar}`}
          alt="Staff avatar"
          className="w-full h-full object-cover absolute inset-0 z-10"
        />
      )}
    </div>
  );
}
