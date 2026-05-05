"use client";

import React from "react";
import { LeadList } from "@/modules/leads/components/LeadList";

export default function LeadsPage() {
  return (
    <div className="flex flex-col h-screen w-full p-0 font-sans relative overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        <LeadList />
      </div>
    </div>
  );
}
