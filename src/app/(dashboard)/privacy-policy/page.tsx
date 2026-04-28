import { PrivacyPolicyView } from "@/modules/privacy-policy/components/PrivacyPolicyView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
