import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/modules/auth/stores/AuthContext";

const roboto = Roboto({ 
  subsets: ["latin"], 
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto" 
});

export const metadata: Metadata = {
  title: "ANAD CRM — Dashboard",
  description:
    "All-in-one CRM dashboard: leads, calls, teams, EOD reports, and integrations.",
};

import { FeedbackProvider } from "@/core/contexts/FeedbackContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable} font-sans`}>
      <body>
        <FeedbackProvider>
          <AuthProvider>{children}</AuthProvider>
        </FeedbackProvider>
      </body>
    </html>
  );
}
