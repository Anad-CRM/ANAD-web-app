"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, Zap } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

const PLANS = [
  {
    name: "Basic",
    price: "19.99",
    frequency: "month",
    staff: "10",
    team: "2",
    leaders: "2",
    managers: "1",
    popular: false,
  },
  {
    name: "Startup",
    price: "39.99",
    frequency: "month",
    staff: "50",
    team: "5",
    leaders: "5",
    managers: "2",
    popular: true,
  },
  {
    name: "Pro",
    price: "49.99",
    frequency: "month",
    staff: "Unlimited",
    team: "Unlimited",
    leaders: "Unlimited",
    managers: "Unlimited",
    popular: false,
  },
];

export function SubscriptionView() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("Startup");

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-8 mx-auto max-w-5xl w-full">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <button
          onClick={() => router.back()}
          style={{ backgroundColor: COLORS.primaryDark }}
          className="w-[42px] h-[42px] flex items-center justify-center rounded-full text-white hover:opacity-90 transition shadow-md"
        >
          <ChevronLeft width={30} height={30} strokeWidth={1.5} />
        </button>
        <div>
          <Text as="h1" size="custom" weight="bold" className="text-[26px] md:text-[30px] leading-tight" style={{ color: COLORS.text }}>
            Flexible Plans
          </Text>
          <Text size="custom" className="text-[14px] mt-1" style={{ color: COLORS.muted }}>
            Choose a plan that works best for you and your team
          </Text>
        </div>
      </div>

      <div className="max-w-xl w-full flex flex-col gap-5">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.name;
          return (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              className="relative p-6 rounded-3xl border transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? COLORS.primary : "white",
                borderColor: isSelected ? COLORS.primary : COLORS.border,
                boxShadow: isSelected ? "0 4px 20px rgba(30,86,160,0.15)" : "none",
              }}
            >
              {plan.popular && (
                <div
                  className="absolute top-6 right-6 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
                  style={{
                    backgroundColor: isSelected ? "white" : COLORS.primaryLight,
                    color: isSelected ? COLORS.primaryDark : COLORS.primaryDark,
                  }}
                >
                  <Zap size={12} className="fill-current" />
                  POPULAR
                </div>
              )}

              <div className="flex items-center gap-3">
                <Text size="custom" weight="bold" className="text-[18px]" style={{ color: isSelected ? "white" : COLORS.text }}>
                  {plan.name}
                </Text>
                {isSelected && <CheckCircle2 size={20} color="white" />}
              </div>

              <div className="flex items-baseline gap-1 mt-1 mb-5">
                <Text size="custom" weight="bold" className="text-[28px]" style={{ color: isSelected ? "white" : COLORS.text }}>
                  ${plan.price}
                </Text>
                <Text size="custom" className="text-[14px] opacity-80" style={{ color: isSelected ? "white" : COLORS.muted }}>
                  / {plan.frequency}
                </Text>
              </div>

              <div className="flex flex-col gap-2">
                <Text size="custom" className="text-[13px] font-semibold mb-1" style={{ color: isSelected ? "rgba(255,255,255,0.9)" : COLORS.text }}>
                  Organization Owner can add:
                </Text>
                <Text size="custom" className="text-[13px]" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : COLORS.muted }}>
                  • {plan.staff} Staff Members
                </Text>
                <Text size="custom" className="text-[13px]" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : COLORS.muted }}>
                  • {plan.team} Teams and {plan.leaders} Team Leaders
                </Text>
                <Text size="custom" className="text-[13px]" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : COLORS.muted }}>
                  • {plan.managers} Managers
                </Text>
              </div>
            </div>
          );
        })}

        <button
          className="w-full mt-4 py-4 rounded-2xl font-bold text-white transition hover:opacity-90 shadow-lg"
          style={{ backgroundColor: COLORS.primaryDark }}
        >
          Subscribe to {selectedPlan}
        </button>
      </div>
    </div>
  );
}
