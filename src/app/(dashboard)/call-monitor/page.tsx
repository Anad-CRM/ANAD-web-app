import { CallMonitorView } from "@/modules/call-monitor/components/CallMonitorView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Call Monitor",
};

export default function CallMonitorPage() {
  return <CallMonitorView />;
}
