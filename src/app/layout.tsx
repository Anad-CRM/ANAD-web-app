import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/modules/auth/stores/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="en" className={inter.variable}>
      <body>
        <FeedbackProvider>
          <AuthProvider>{children}</AuthProvider>
        </FeedbackProvider>
      </body>
    </html>
  );
}
