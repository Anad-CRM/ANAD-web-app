"use client";

import React from "react";
import { IntegrationDashboard } from "@/modules/integration/components/IntegrationDashboard";

export default function IntegrationPage() {
  return (
    <div className="flex flex-col flex-1 w-full bg-[#E5ECF4] h-screen overflow-hidden p-0 font-sans relative">
      <IntegrationDashboard />
    </div>
  );
}
