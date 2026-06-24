"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useSidebar } from "@/core/contexts/SidebarContext";
import Button from "@/core/components/ui/Button";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

const NAV = [
  { href: "/overview", label: "Dashboard", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: "/inbox", label: "Inbox", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: "/broadcasts", label: "Broadcasts", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg> },
  { href: "/teams", label: "Teams", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: "/follow-up", label: "Follow Up", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { href: "/ads", label: "Ads Analytics", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> },
  { href: "/calls", label: "Call Analytics", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
  { href: "/pipelines", label: "Pipelines", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> },
  { href: "/wa-pipeline", label: "WA Pipeline", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg> },
  { href: "/automations", label: "Automations", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { href: "/auto-lead", label: "Lead Allocation", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> },
  { href: "/eod", label: "EOD", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { href: "/integration", label: "Integration", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
  { href: "/create-leads", label: "Create Leads", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
  { href: "/export-log", label: "Export Log", svgIcon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
];

import { useAuthContext } from "@/modules/auth/stores/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  const userRole = user?.role?.toLowerCase() || "";
  const isAuthorizedForTeams = userRole === "admin" || userRole === "manager" || userRole === "organization_admin";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const sidebarContent = (
    <>
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="px-2 pb-3">
          <Text as="p" size="xs" weight="semibold" className="uppercase tracking-[0.24em]" style={{ color: "rgba(255,255,255,0.45)" }}>
            Navigation
          </Text>
        </div>
        {NAV.map((item) => {
          if (item.href === "/teams" && !isAuthorizedForTeams) {
            return null;
          }
          if (item.href === "/export-log" && !isAdmin) {
            return null;
          }
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 ${
                active ? "font-bold" : ""
              }`}
              style={{
                backgroundColor: active ? COLORS.primaryXlight : "transparent",
                color: active ? COLORS.text : "rgba(255,255,255,0.8)",
              }}
            >
              <span className="text-[18px] w-6 flex justify-center">
                {item.svgIcon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="rounded-[16px] p-5 flex flex-col items-center text-center" style={{ backgroundColor: COLORS.primaryXlight }}>
          <Text as="h4" size="sm" weight="bold" className="mb-1" style={{ color: COLORS.text }}>
            Upgrade Pro
          </Text>
          <Text as="p" size="xs" className="mb-3" style={{ color: COLORS.muted }}>
            Get all Feature
          </Text>
          <Button variant="secondary" size="sm" className="w-full rounded-full">
            Get Pro
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — visible on md+ */}
      <aside className="hidden md:flex w-[240px] h-full flex-col rounded-tr-3xl overflow-hidden flex-shrink-0" style={{ backgroundColor: COLORS.primaryDark }}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay — visible below md */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="relative w-[280px] max-w-[80vw] h-full max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl"
            style={{ backgroundColor: COLORS.primaryDark, animation: "slideInLeft 0.25s cubic-bezier(.4,0,.2,1)" }}
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-white/80 text-[14px] font-semibold">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            {sidebarContent}
          </aside>

          <style>{`
            @keyframes slideInLeft {
              from { transform: translateX(-100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
