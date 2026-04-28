"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

const PRIVACY_CONTENT = `This Privacy Policy describes how ANAD CRM ("we", "us", or "our") collects, uses, and shares information when you use our platform and services.

1. Information We Collect
We collect information you provide directly to us, such as:
- Account information (name, email address, role, organization details)
- Profile information (avatar, contact number, address)
- Usage data (calls made, leads managed, attendance records)
- Device information when using our mobile application

2. How We Use Your Information
We use the collected information to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send administrative communications and updates
- Monitor platform usage to detect and prevent fraud
- Generate analytics reports for your organization

3. Call Recordings
Our Call Monitor application may record calls made by users with staff roles. These recordings are:
- Stored securely and accessible only to authorized managers and admins
- Used solely for performance monitoring and quality assurance
- Not shared with third parties without explicit consent

4. Data Sharing
We do not sell or rent your personal information. We may share data with:
- Service providers who assist us in operating the platform (under strict confidentiality agreements)
- Legal authorities when required by law or to protect our rights

5. Data Retention
We retain your data for as long as your account is active or as needed to provide services. Upon account deletion, data is purged within 30 days unless retention is required by law.

6. Security
We implement industry-standard security measures to protect your data, including encryption, access controls, and regular security audits. No system is 100% secure; we encourage you to use strong passwords and report suspicious activity immediately.

7. Your Rights
Depending on your jurisdiction, you may have the right to:
- Access the personal data we hold about you
- Request correction of inaccurate data
- Request deletion of your data
- Object to or restrict processing of your data

To exercise these rights, contact us at anadsupport@gmail.com.

8. Cookies & Tracking
Our web platform uses cookies and similar technologies to maintain session state and analyze usage. You can control cookie settings through your browser preferences.

9. Children's Privacy
Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors.

10. Changes to This Policy
We may update this Privacy Policy periodically. We will notify you of significant changes via email or an in-app notice. Continued use of the platform constitutes acceptance of the updated policy.

11. Contact Us
If you have any questions about this Privacy Policy, please reach out to us at anadsupport@gmail.com or call us at +92 345 678 765.`;

export function PrivacyPolicyView() {
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
            Privacy Policy
          </Text>
          <Text size="custom" className="text-[14px] mt-1" style={{ color: COLORS.muted }}>
            Last updated: April 2025
          </Text>
        </div>
      </div>

      {/* Content Card */}
      <div className="rounded-3xl bg-white border p-6 md:p-10 max-w-3xl" style={{ borderColor: COLORS.border }}>
        <Text as="h2" size="custom" weight="bold" className="text-[16px] underline mb-5" style={{ color: COLORS.text }}>
          Privacy Policy
        </Text>
        <div className="whitespace-pre-line leading-relaxed text-sm" style={{ color: COLORS.muted }}>
          {PRIVACY_CONTENT}
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col gap-2" style={{ borderColor: COLORS.border }}>
          <Text size="custom" className="text-[13px]" style={{ color: COLORS.muted }}>For questions or concerns:</Text>
          <a href="mailto:anadsupport@gmail.com" className="text-sm font-semibold underline" style={{ color: COLORS.primary }}>
            anadsupport@gmail.com
          </a>
          <a href="tel:+92345678765" className="text-sm font-semibold underline" style={{ color: COLORS.primary }}>
            +92 345 678 765
          </a>
        </div>
      </div>
    </div>
  );
}
