"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Smartphone, Download, ShieldCheck, Bell, Mic, BarChart2 } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

const FEATURES = [
  {
    icon: <Mic size={22} style={{ color: COLORS.primary }} />,
    title: "Auto Call Recording",
    desc: "Automatically records all incoming and outgoing calls without manual input.",
  },
  {
    icon: <Bell size={22} style={{ color: COLORS.primary }} />,
    title: "Real-time Sync",
    desc: "Call logs are instantly synced to your CRM dashboard in real time.",
  },
  {
    icon: <ShieldCheck size={22} style={{ color: COLORS.primary }} />,
    title: "Secure & Private",
    desc: "All recordings are encrypted and only accessible to authorized managers.",
  },
  {
    icon: <BarChart2 size={22} style={{ color: COLORS.primary }} />,
    title: "Analytics Integration",
    desc: "Recordings feed directly into call analytics for performance tracking.",
  },
];

const STEPS = [
  { step: "01", text: "Download the ANAD Call Monitor APK on your Android device." },
  { step: "02", text: "Open the app and sign in with your CRM credentials." },
  { step: "03", text: "Grant the required permissions for call recording and microphone." },
  { step: "04", text: "The app will run in the background and auto-sync all call data." },
];

export function CallMonitorView() {
  const router = useRouter();

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
            Install Call Monitor
          </Text>
          <Text size="custom" className="text-[14px] mt-1" style={{ color: COLORS.muted }}>
            Auto-record and sync your calls with ANAD CRM
          </Text>
        </div>
      </div>

      {/* Hero Banner */}
      <div
        className="rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6"
        style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}
      >
        <div className="flex-1 text-white flex flex-col gap-3">
          <Text as="h2" size="custom" weight="bold" className="text-[22px] md:text-[26px] leading-snug text-white">
            ANAD Call Monitor
          </Text>
          <Text size="custom" className="text-[14px] text-white/80 leading-relaxed max-w-sm">
            The companion Android app that keeps all your team&apos;s call records perfectly synced with the CRM — automatically.
          </Text>
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-full font-semibold text-sm transition hover:opacity-90 self-start"
            style={{ backgroundColor: "white", color: COLORS.primaryDark }}
          >
            <Download size={16} />
            Download APK
          </a>
        </div>
        <div
          className="w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <Smartphone size={52} color="white" strokeWidth={1.2} />
        </div>
      </div>

      {/* Features */}
      <div>
        <Text as="h2" size="custom" weight="bold" className="text-[18px] mb-4" style={{ color: COLORS.text }}>
          Key Features
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white border"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: COLORS.primaryXlight }}
              >
                {f.icon}
              </div>
              <div>
                <Text size="custom" weight="bold" className="text-[14px]" style={{ color: COLORS.text }}>{f.title}</Text>
                <Text size="custom" className="text-[13px] mt-1 leading-relaxed" style={{ color: COLORS.muted }}>{f.desc}</Text>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Steps */}
      <div>
        <Text as="h2" size="custom" weight="bold" className="text-[18px] mb-4" style={{ color: COLORS.text }}>
          How to Set Up
        </Text>
        <div className="flex flex-col gap-4">
          {STEPS.map((s) => (
            <div key={s.step} className="flex items-start gap-4 p-4 rounded-2xl bg-white border" style={{ borderColor: COLORS.border }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                style={{ backgroundColor: COLORS.primaryDark, color: "white" }}
              >
                {s.step}
              </div>
              <Text size="custom" className="text-[14px] leading-relaxed pt-2" style={{ color: COLORS.muted }}>
                {s.text}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="rounded-2xl p-4 border" style={{ backgroundColor: COLORS.primaryXlight, borderColor: COLORS.primaryLight }}>
        <Text size="custom" className="text-[13px] leading-relaxed" style={{ color: COLORS.primaryDark }}>
          <strong>Note:</strong> The Call Monitor app is available for Android only. iOS recording requires device-level configuration. Contact your admin if you need assistance.
        </Text>
      </div>
    </div>
  );
}
