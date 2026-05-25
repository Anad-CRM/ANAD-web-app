"use client";

import React from "react";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";
import { CreateLeadDashboard } from "@/modules/create-lead/components/CreateLeadDashboard";

export default function CreateLeadsPage() {
  return (
    <div className="flex min-w-0 flex-col gap-[22px] pb-10">
      <div className="flex flex-col gap-1">
        <Text as="h1" size="4xl" weight="bold" className="leading-tight tracking-tight" style={{ color: COLORS.text }}>
          Create Leads
        </Text>
        <Text as="p" size="sm" style={{ color: COLORS.subtle }}>
          Add a new lead quickly with the same dashboard styling used across the app.
        </Text>
      </div>
      <CreateLeadDashboard />
    </div>
  );
}
