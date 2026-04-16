"use client";

import React from "react";
import { PipelineDashboard } from "@/modules/pipelines/components/PipelineDashboard";

export default function PipelinesPage() {
  return (
    <div className="flex flex-col gap-[22px]">
      <PipelineDashboard />
    </div>
  );
}
