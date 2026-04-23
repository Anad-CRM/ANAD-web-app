"use client";

import React from "react";
import { LeadList } from "@/modules/leads/components/LeadList";
import { COLORS } from "@/core/components/theme/colors";

export default function LeadsPage() {
  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ backgroundColor: COLORS.primaryXlight }}
    >
      <div className="max-w-7xl mx-auto h-[calc(100vh-80px)]">
        <LeadList />
      </div>
    </div>
  );
}
