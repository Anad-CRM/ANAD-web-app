"use client";

import React from "react";
import { LeadList } from "@/modules/leads/components/LeadList";

export default function LeadsPage() {
  return (
    <div className="flex flex-col min-h-screen w-full p-0 font-sans relative">
      <div className="flex-1 flex flex-col">
        <LeadList />
      </div>
    </div>
  );
}
