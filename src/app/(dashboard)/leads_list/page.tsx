"use client";

import React from "react";
import { LeadList } from "@/modules/leads/components/LeadList";

export default function LeadsPage() {
  return (
    <div className="flex flex-col flex-1 w-full h-full p-0 font-sans relative">
      <div className="max-w-7xl mx-auto w-full h-full p-4 md:p-6 pb-20">
        <LeadList />
      </div>
    </div>
  );
}
