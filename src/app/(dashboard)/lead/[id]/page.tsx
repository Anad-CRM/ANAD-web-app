"use client";

import React from "react";
import { LeadDetailsDashboard } from "@/modules/leads/details/components/LeadDetailsDashboard";

export default function LeadDetailsPage() {
  return (
    <div className="flex flex-col flex-1 w-full p-0 font-sans relative">
      <LeadDetailsDashboard />
    </div>
  );
}
