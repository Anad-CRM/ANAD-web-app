"use client";

import React from "react";
import { AutoLeadDashboard } from "@/modules/auto-lead/components/AutoLeadDashboard";

export default function AutoLeadPage() {
  return (
    <div className="flex flex-col flex-1 w-full bg-[#E5ECF4] h-screen overflow-hidden p-0 font-sans relative">
      <AutoLeadDashboard />
    </div>
  );
}
