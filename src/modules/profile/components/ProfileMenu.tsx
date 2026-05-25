"use client";

import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { AuthImage } from "@/core/components/ui/AuthImage";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";
import { API_BASE_URL } from "@/core/api/axios";

type QuickLink = {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
};

function Icon({ d }: { d: string }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
    </svg>
  );
}

function ActionLink({
  href,
  children,
  variant = "secondary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition-all duration-200";
  const styles =
    variant === "primary"
      ? "bg-[#163172] text-white hover:bg-[#0D1B3E]"
      : "bg-[#1E56A0] text-white hover:bg-[#163172]";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}

function QuickLinkCard({ item }: { item: QuickLink }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: COLORS.border }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primaryDark }}
      >
        {item.icon}
      </div>
      <div className="min-w-0 flex-1">
        <Text as="div" size="base" weight="semibold" className="truncate" style={{ color: COLORS.text }}>
          {item.title}
        </Text>
        <Text as="div" size="sm" className="mt-0.5 truncate" style={{ color: COLORS.subtle }}>
          {item.subtitle}
        </Text>
      </div>
    </Link>
  );
}

function SectionBlock({ title, links }: { title: string; links: QuickLink[] }) {
  if (!links.length) return null;

  return (
    <section className="mt-6">
      <Text as="h3" size="xl" weight="bold" className="mb-3" style={{ color: COLORS.text }}>
        {title}
      </Text>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((item) => (
          <QuickLinkCard key={item.href + item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function ProfileMenu() {
  const { user } = useAuth();

  const role = user?.role || "User";
  const isAdmin = role === "Admin";
  const isManager = role === "Manager";
  const isTeamLeader = role === "Team Leader";
  const isStaff = role === "Staff Member";

  const avatarSrc = user?.avatar ? `${API_BASE_URL}uploads/${user.avatar}` : "/login/login.png";
  const orgName = user?.organization?.organizationName;

  const generalLinks: QuickLink[] = [
    {
      title: "Call Monitor",
      subtitle: "Open the calling tools",
      href: "/call-monitor",
      icon: <Icon d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
    },
    {
      title: "Terms & Conditions",
      subtitle: "Read the usage policy",
      href: "/terms",
      icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    },
    {
      title: "Privacy Policy",
      subtitle: "See how data is handled",
      href: "/privacy-policy",
      icon: <Icon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    },
  ];

  const managementLinks: QuickLink[] = [];
  if (isAdmin) {
    managementLinks.push({
      title: "Subscription Plan",
      subtitle: "View current plan",
      href: "/subscriptions",
      icon: <Icon d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
    });
  }
  if (isAdmin || isManager) {
    managementLinks.push(
      {
        title: "Teams",
        subtitle: "View all teams",
        href: "/teams",
        icon: <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
      },
      {
        title: "Managers",
        subtitle: "Manager list",
        href: "/staffs?role=managers",
        icon: <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
      }
    );
  }
  if (isAdmin) {
    managementLinks.push({
      title: "Team Leaders",
      subtitle: "Team lead list",
      href: "/staffs?role=team-leads",
      icon: <Icon d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    });
  }
  if (isAdmin) {
    managementLinks.push(
      {
        title: "Integration",
        subtitle: "Connect apps and services",
        href: "/integration",
        icon: <Icon d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
      },
      {
        title: "Lead Allocation",
        subtitle: "Distribute incoming leads",
        href: "/auto-lead",
        icon: <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
      },
      {
        title: "EOD Settings",
        subtitle: "Reporting setup",
        href: "/eod",
        icon: <Icon d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      },
      {
        title: "Export Log",
        subtitle: "Download history",
        href: "/export-log",
        icon: <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
      }
    );
  }

  const workLinks: QuickLink[] = [];
  if (isManager || isTeamLeader || isStaff) {
    workLinks.push({
      title: "To Do List",
      subtitle: "Track pending work",
      href: "/todos",
      icon: <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-6 9l2 2 4-4" />,
    });
  }
  if (isTeamLeader) {
    workLinks.push({
      title: "My Teams",
      subtitle: "Team list and tracking",
      href: "/teams",
      icon: <Icon d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
    });
  }

  return (
    <div className="w-full min-w-0 pb-10">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col items-center text-center">
          <div
            className="h-24 w-24 overflow-hidden rounded-full border bg-white shadow-sm"
            style={{ borderColor: COLORS.border, backgroundColor: COLORS.primaryXlight }}
          >
            <AuthImage
              src={avatarSrc}
              fallbackSrc="/login/login.png"
              alt={user?.userName || "Profile image"}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-4">
            <Text as="h1" size="3xl" weight="bold" className="leading-tight tracking-tight" style={{ color: COLORS.text }}>
              Profile
            </Text>
            <Text as="p" size="sm" className="mt-1 break-all" style={{ color: COLORS.subtle }}>
              {user?.userName || "Profile"}
            </Text>
            <Text as="p" size="sm" className="mt-1 break-all" style={{ color: COLORS.subtle }}>
              {user?.email || "No email found"}
            </Text>
            <Text as="p" size="sm" className="mt-1" style={{ color: COLORS.subtle }}>
              {orgName || "No organization set"}
            </Text>
            <div
              className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold"
              style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primaryDark }}
            >
              {role}
            </div>
          </div>

          <div className="mt-5 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ActionLink href="/profile/edit" variant="primary">
              Edit Profile
            </ActionLink>
            <ActionLink href="/invite">Invite a Friend</ActionLink>
          </div>
        </div>
      </div>

      <SectionBlock title="General" links={generalLinks} />
      <SectionBlock title="Management" links={managementLinks} />
      <SectionBlock title="Work" links={workLinks} />
    </div>
  );
}
