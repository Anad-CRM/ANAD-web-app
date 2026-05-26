import React from "react";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";

export const AdsHeader = () => {
  return (
    <div className="mb-6 flex w-full items-start justify-between gap-3">
      <div className="flex flex-col gap-1">
        <Text as="h1" size="xl" weight="bold" style={{ color: COLORS.text }}>
          Instagram
        </Text>
        <Text size="sm" style={{ color: COLORS.muted }}>
          Ads analytics
        </Text>
      </div>
    </div>
  );
};
