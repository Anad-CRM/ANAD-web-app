import { TermsView } from "@/modules/terms/components/TermsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
};

export default function TermsPage() {
  return <TermsView />;
}
