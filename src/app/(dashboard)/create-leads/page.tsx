"use client";

import React from "react";
import { CreateLeadDashboard } from "@/modules/create-lead/components/CreateLeadDashboard";

export default function CreateLeadsPage() {
  return (
    <div className="flex flex-col gap-[22px]">
      <CreateLeadDashboard />
    </div>
  );
}
