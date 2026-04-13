"use client";

import React from "react";
import { PipelineDashboard } from "@/modules/pipelines/components/PipelineDashboard";

export default function PipelinesPage() {
  return (
    <div className="flex flex-col flex-1 w-full bg-[#F2F5F8] h-full overflow-hidden p-4 lg:p-6 font-sans">
      <PipelineDashboard />
    </div>
  );
}
