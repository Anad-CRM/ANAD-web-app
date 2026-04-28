import { InviteView } from "@/modules/invite/components/InviteView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invite a Friend",
};

export default function InvitePage() {
  return <InviteView />;
}
