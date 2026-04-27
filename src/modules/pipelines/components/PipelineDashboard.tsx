"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PIPELINE_METRICS } from "../constants";
import { PipelineMetricCard } from "./PipelineMetricCard";
import { getPipelineData } from "../api/pipelineApi";
import { PipelineData } from "../types";

// Map pipeline metric id → backend status value
const METRIC_STATUS: Record<string, string> = {
  "new-lead":       "New Lead",
  "hot-lead":       "Hot Lead",
  "contacted":      "Contacted",
  "not-interested": "Not Interested",
  "customer":       "Customer",
  "enrolled":       "Closed",
  "follow-up":      "Follow Up",
  "rnr":            "RNR",
  "switch-off":     "Switch Off",
  "busy":           "Busy",
  "register":       "Register",
  "disqualified":   "Disqualified",
};

export const PipelineDashboard: React.FC = () => {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPipelineStats = async () => {
      setLoading(true);
      const res = await getPipelineData();
      if (res) setData(res);
      setLoading(false);
    };
    fetchPipelineStats();
  }, []);

  const getMetricCount = (metricId: string): number => {
    if (!data) return 0;
    switch (metricId) {
      case "new-lead":       return data.newLeadCount ?? 0;
      case "hot-lead":       return data.hotLeadCount ?? 0;
      case "contacted":      return data.contactedLeadCount ?? 0;
      case "not-interested": return data.notInterestCount ?? 0;
      case "customer":       return data.customerCount ?? 0;
      case "enrolled":       return data.closedLeadCount ?? 0;
      case "follow-up":      return data.followUpCount ?? 0;
      case "rnr":            return data.rnrCount ?? 0;
      case "switch-off":     return data.switchOffCount ?? 0;
      case "busy":           return data.busyCount ?? 0;
      case "register":       return data.registerCount ?? 0;
      case "disqualified":   return data.disqualifiedCount ?? 0;
      default:               return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center font-sans h-full">
        <div className="w-12 h-12 border-4 border-[#1C3A76] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full font-sans h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 h-full content-start">
        {PIPELINE_METRICS.map((metric) => (
          <PipelineMetricCard
            key={metric.id}
            metric={{ ...metric, count: getMetricCount(metric.id) }}
            onClick={() => {
              const status = METRIC_STATUS[metric.id];
              if (status) router.push(`/leads_list?status=${encodeURIComponent(status)}`);
            }}
          />
        ))}
      </div>
    </div>
  );
};
