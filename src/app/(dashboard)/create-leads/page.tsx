"use client";

import React from "react";
import { CreateLeadDashboard } from "@/modules/create-lead/components/CreateLeadDashboard";

export default function CreateLeadsPage() {
  return (
    <div className="flex flex-col flex-1 w-full bg-[#E5ECF4] h-screen overflow-hidden p-0 font-sans relative">
      <CreateLeadDashboard />
    </div>
  );
}
