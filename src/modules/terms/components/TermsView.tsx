"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

const TERMS_CONTENT = `These Terms and Conditions ("Terms") govern your use of the ANAD CRM platform, including our web application and mobile applications. By accessing or using ANAD CRM, you agree to be bound by these Terms.

1. Acceptance of Terms
By creating an account or using any of our services, you acknowledge that you have read, understood, and agree to these Terms and our Privacy Policy. If you do not agree, please do not use our services.

2. Use of Services
You may use our services only as permitted by law and in accordance with these Terms. You agree not to misuse our services or help anyone else do so. Prohibited activities include, but are not limited to:
- Attempting to access unauthorized areas of the platform
- Using the service for any unlawful or fraudulent purpose
- Uploading malicious code or interfering with platform functionality

3. Account Responsibility
You are responsible for maintaining the confidentiality of your account credentials. Any activity occurring under your account is your responsibility. Notify us immediately of any unauthorized access.

4. Data & Privacy
Our collection and use of personal information is governed by our Privacy Policy. By using ANAD CRM, you consent to the collection and processing of data as described therein.

5. Intellectual Property
All content, features, and functionality of ANAD CRM — including software, text, graphics, and logos — are owned by ANAD and protected by applicable intellectual property laws.

6. Limitation of Liability
ANAD CRM is provided "as is." We make no warranties, expressed or implied, regarding the platform's reliability or fitness for a particular purpose. To the fullest extent permitted by law, ANAD shall not be liable for any indirect, incidental, or consequential damages.

7. Termination
We reserve the right to suspend or terminate your access to the platform at our discretion, without notice, for conduct that we determine violates these Terms or is harmful to other users, us, or third parties.

8. Changes to Terms
We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated Terms. We will notify users of significant changes via email or in-app notifications.

9. Governing Law
These Terms are governed by the applicable laws of the jurisdiction in which ANAD operates. Any disputes shall be resolved in the competent courts of that jurisdiction.

10. Contact
If you have questions about these Terms, please contact us at anadsupport@gmail.com.`;

export function TermsView() {
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
            Terms &amp; Conditions
          </Text>
          <Text size="custom" className="text-[14px] mt-1" style={{ color: COLORS.muted }}>
            Last updated: April 2025
          </Text>
        </div>
      </div>

      {/* Content Card */}
      <div className="rounded-3xl bg-white border p-6 md:p-10 max-w-3xl" style={{ borderColor: COLORS.border }}>
        <Text as="h2" size="custom" weight="bold" className="text-[16px] underline mb-5" style={{ color: COLORS.text }}>
          Terms and Conditions
        </Text>
        <div className="whitespace-pre-line leading-relaxed text-sm" style={{ color: COLORS.muted }}>
          {TERMS_CONTENT}
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col gap-1" style={{ borderColor: COLORS.border }}>
          <Text size="custom" className="text-[13px]" style={{ color: COLORS.muted }}>For support, contact us at:</Text>
          <a href="mailto:anadsupport@gmail.com" className="text-sm font-semibold underline" style={{ color: COLORS.primary }}>
            anadsupport@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
