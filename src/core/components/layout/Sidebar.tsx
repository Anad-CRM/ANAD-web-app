"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/overview", label: "Dashboard", icon: "⌂" },
  { href: "/teams", label: "Teams", icon: "👥" },
  { href: "/follow-up", label: "Follow Up", icon: "📅" },
  { href: "/ads", label: "Ads Analytics", icon: "🔊" },
  { href: "/calls", label: "Call Analytics", icon: "📞" },
  { href: "/pipelines", label: "Pipelines", icon: "📊" },
  { href: "/auto-lead", label: "Auto Lead", icon: "🪄" },
  { href: "/eod", label: "EOD", icon: "📄" },
  { href: "/integration", label: "Integration", icon: "🔗" },
  { href: "/create-leads", label: "Create Leads", icon: "👥" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] bg-[#233A78] h-full flex flex-col rounded-tr-3xl">
      <nav className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[15px] font-medium transition-all duration-200 ${
                active ? "bg-[#E2E8F0] text-black font-bold" : "text-white/90 hover:bg-white/10"
              }`}
            >
              <span className="text-[18px] w-6 flex justify-center">
                {active && item.href === "/overview" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                ) : (
                  item.icon
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-[#E2E8F0] rounded-[16px] p-5 flex flex-col items-center text-center">
          <h4 className="text-[14px] font-bold text-black mb-1">Upgrade Pro</h4>
          <p className="text-[12px] text-[#64748B] mb-3">Get all Feature</p>
          <button className="bg-[#233A78] text-white text-[13px] font-bold py-2 px-6 rounded-full w-full">
            Get Pro
          </button>
        </div>
      </div>
    </aside>
  );
}
