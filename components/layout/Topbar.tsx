"use client";

import { useAuthContext } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const PAGE_LABELS: Record<string, string> = {
  "/overview": "Dashboard",
  "/leads": "Leads",
  "/calls": "Call Analytics",
  "/teams": "Teams",
  "/eod": "EOD Reports",
  "/integrations": "Integrations",
  "/ads": "Ads Analytics",
  "/subscription": "Subscription",
};

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  const pageTitle = PAGE_LABELS[pathname] ?? "Dashboard";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{pageTitle}</h1>
        <p className="topbar-date">{today}</p>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <span className="search-icon">⌕</span>
          <input placeholder="Search leads, teams, staff…" />
        </div>

        <button className="topbar-icon-btn" aria-label="Notifications">
          <span>🔔</span>
          <span className="notif-badge">3</span>
        </button>

        <div className="topbar-avatar" title={user?.name ?? "Profile"}>
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>

      <style>{`
        .topbar {
          height: var(--topbar-height);
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          display: flex; align-items: center;
          padding: 0 28px; gap: 20px;
          position: sticky; top: 0; z-index: 40;
        }
        .topbar-left { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .topbar-title { font-size: 18px; font-weight: 800; color: var(--color-text); line-height: 1.2; }
        .topbar-date { font-size: 12px; color: var(--color-muted); }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .topbar-search {
          display: flex; align-items: center; gap: 8px;
          height: 36px; padding: 0 14px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          min-width: 220px;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .topbar-search:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(79,110,247,0.1); }
        .search-icon { color: var(--color-subtle); font-size: 16px; }
        .topbar-search input { border: none; background: transparent; font-size: 13px; color: var(--color-text); flex: 1; outline: none; }
        .topbar-icon-btn {
          width: 36px; height: 36px;
          background: var(--color-bg); border: 1px solid var(--color-border);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px; position: relative;
          transition: background 0.15s, border-color 0.15s;
        }
        .topbar-icon-btn:hover { background: var(--color-primary-light); border-color: var(--color-primary); }
        .notif-badge {
          position: absolute; top: -3px; right: -3px;
          background: var(--color-danger); color: #fff;
          font-size: 9px; font-weight: 700;
          width: 15px; height: 15px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid #fff;
        }
        .topbar-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--color-primary);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: #fff; cursor: pointer;
          box-shadow: 0 2px 8px rgba(79,110,247,0.25);
        }
      `}</style>
    </header>
  );
}
