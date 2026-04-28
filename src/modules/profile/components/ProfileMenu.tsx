"use client";

import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const MenuItem = ({ 
  icon, 
  title, 
  subtitle, 
  href, 
  onClick, 
  textColor = "text-gray-800",
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-50"
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  textColor?: string;
  iconColor?: string;
  iconBgColor?: string;
}) => {
  const content = (
    <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl flex items-center justify-center ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        <div>
          <h4 className={`text-base font-semibold ${textColor}`}>{title}</h4>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  
  return <div onClick={onClick}>{content}</div>;
};

const SectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1 mt-6">
    {title}
  </h3>
);

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  
  const role = user?.role || "User";
  const isAdmin = role === "Admin";
  const isManager = role === "Manager";
  const isTeamLeader = role === "Team Leader";
  const isStaff = role === "Staff Member";

  const renderIcon = (d: string) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
    </svg>
  );

  return (
    <div className="w-full max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 items-start">
        <div className="flex flex-col gap-0">
          <SectionHeader title="Account" />
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <MenuItem 
              icon={renderIcon("M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z")} 
              title="Edit Profile" 
              href="/profile/edit" 
            />
            {isAdmin && (
              <MenuItem 
                icon={renderIcon("M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z")} 
                title="Subscription Plan" 
                subtitle="Free Plan"
                href="/subscriptions" 
                iconColor="text-yellow-500"
                iconBgColor="bg-yellow-50"
              />
            )}
          </div>

          <SectionHeader title="General" />
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
            <MenuItem 
              icon={renderIcon("M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z")} 
              title="Invite a Friend" 
              href="/invite" 
            />
            <MenuItem 
              icon={renderIcon("M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z")} 
              title="Install Call Monitor" 
              href="/call-monitor" 
            />
            <MenuItem 
              icon={renderIcon("M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z")} 
              title="Terms & Conditions" 
              href="/terms" 
            />
            <MenuItem 
              icon={renderIcon("M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z")} 
              title="Privacy Policy" 
              href="/privacy-policy" 
            />
            </div>
        </div>

        <div className="flex flex-col gap-0">
          {(isAdmin || isManager) && (
            <>
              <SectionHeader title="Management" />
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                {isAdmin && (
                  <MenuItem 
                    icon={renderIcon("M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1")} 
                    title="Integrations" 
                    href="/integration" 
                  />
                )}
                <MenuItem 
                  icon={renderIcon("M12 4v16m8-8H4")} 
                  title="Create Linear Lead" 
                  href="/create-leads" 
                />
                <MenuItem 
                  icon={renderIcon("M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z")} 
                  title="My Teams" 
                  href="/teams" 
                />
                {isAdmin && (
                  <MenuItem 
                    icon={renderIcon("M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z")} 
                    title="Managers" 
                    href="/staffs" 
                  />
                )}
                <MenuItem 
                  icon={renderIcon("M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z")} 
                  title="Team Leaders" 
                  href="/staffs" 
                />
                <MenuItem 
                  icon={renderIcon("M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z")} 
                  title="Staff Members" 
                  href="/staffs" 
                />
                <MenuItem 
                  icon={renderIcon("M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4")} 
                  title="Pipelines" 
                  href="/pipelines" 
                />
                {isAdmin && (
                  <>
                    <MenuItem 
                      icon={renderIcon("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2")} 
                      title="Auto Lead Assigning" 
                      href="/auto-lead" 
                    />
                    <MenuItem 
                      icon={renderIcon("M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z")} 
                      title="EOD Settings" 
                      href="/eod" 
                    />
                    <MenuItem 
                      icon={renderIcon("M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4")} 
                      title="Export Log" 
                      href="/export-log" 
                    />
                  </>
                )}
              </div>
            </>
          )}

          {(isTeamLeader || isStaff) && (
            <>
              <SectionHeader title="Work" />
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <MenuItem 
                  icon={renderIcon("M12 4v16m8-8H4")} 
                  title="Create Linear Lead" 
                  href="/create-leads" 
                />
                <MenuItem 
                  icon={renderIcon("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4")} 
                  title="To Do List" 
                  href="/todos" 
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
