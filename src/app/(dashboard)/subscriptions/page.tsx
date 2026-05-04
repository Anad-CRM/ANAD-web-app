import { SubscriptionView } from "@/modules/subscriptions/components/SubscriptionView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions",
};

export default function SubscriptionsPage() {
  return <SubscriptionView />;
}
