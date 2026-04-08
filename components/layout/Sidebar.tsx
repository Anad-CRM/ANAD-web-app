"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  {
    section: "Main",
    items: [
      { href: "/overview", label: "Dashboard", icon: "⊞" },
      { href: "/leads", label: "Leads", icon: "◈" },
      { href: "/calls", label: "Call Analytics", icon: "◎" },
    ],
  },
  {
    section: "Management",
    items: [
      { href: "/teams", label: "Teams", icon: "◷" },
      { href: "/eod", label: "EOD Reports", icon: "◻" },
      { href: "/integrations", label: "Integrations", icon: "⊕" },
    ],
  },
  {
    section: "Settings",
    items: [
      { href: "/ads", label: "Ads Analytics", icon: "◈" },
      { href: "/subscription", label: "Subscription", icon: "★" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="s-logo-icon">A</div>
        <span className="s-logo-text">ANAD CRM</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((group) => (
          <div key={group.section} className="nav-group">
            <p className="nav-section-label">{group.section}</p>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${active ? " active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {active && <span className="nav-dot" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="s-user">
          <div className="s-avatar">{user?.name?.[0]?.toUpperCase() ?? "U"}</div>
          <div className="s-user-info">
            <p className="s-user-name">{user?.name ?? "User"}</p>
            <p className="s-user-role">{user?.role ?? "—"}</p>
          </div>
        </div>
        <button className="s-logout" onClick={logout} title="Sign out">
          ⎋
        </button>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          min-width: var(--sidebar-width);
          height: 100vh;
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          padding: 0;
          position: sticky;
          top: 0;
          overflow-y: auto;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 22px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .s-logo-icon {
          width: 34px; height: 34px;
          background: var(--color-primary);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: #fff;
          box-shadow: 0 2px 10px rgba(79,110,247,0.4);
          flex-shrink: 0;
        }
        .s-logo-text {
          font-size: 15px; font-weight: 800;
          color: #fff; letter-spacing: -0.3px;
        }
        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex; flex-direction: column; gap: 24px;
          overflow-y: auto;
        }
        .nav-group { display: flex; flex-direction: column; gap: 2px; }
        .nav-section-label {
          font-size: 10px; font-weight: 700;
          color: #475569;
          text-transform: uppercase; letter-spacing: 0.08em;
          padding: 0 8px; margin-bottom: 4px;
        }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px;
          border-radius: 9px;
          text-decoration: none;
          color: var(--sidebar-text);
          font-size: 13.5px; font-weight: 500;
          transition: background 0.18s var(--ease), color 0.18s var(--ease);
          position: relative;
        }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .nav-item.active {
          background: var(--sidebar-active-bg);
          color: var(--sidebar-active-text);
          font-weight: 600;
        }
        .nav-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
        .nav-label { flex: 1; }
        .nav-dot {
          width: 6px; height: 6px;
          background: var(--color-primary);
          border-radius: 50%;
        }
        .sidebar-footer {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .s-user { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .s-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--color-primary);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .s-user-info { min-width: 0; }
        .s-user-name { font-size: 13px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .s-user-role { font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .s-logout {
          background: none; border: none; color: #475569; font-size: 18px;
          cursor: pointer; padding: 4px 6px; border-radius: 6px;
          transition: color 0.15s, background 0.15s; flex-shrink: 0;
        }
        .s-logout:hover { color: var(--color-danger); background: rgba(239,68,68,0.1); }
      `}</style>
    </aside>
  );
}
