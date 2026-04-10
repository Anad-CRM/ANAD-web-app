export default function TeamsPage() {
  const teams = [
    { name: "Client Onboarding Team", members: 8, leads: 25, performance: 60, active: true },
    { name: "Market Research Team", members: 6, leads: 25, performance: 54, active: true },
    { name: "Sales Team", members: 8, leads: 43, performance: 69, active: false },
  ];

  const staff = [
    { name: "Nick D", role: "Manager", skillLevel: "Beginner", joinDate: "15/4/2024", absent: false },
    { name: "Jesse Pinkman", role: "Staff", skillLevel: "Intermediate", joinDate: "6/5/2025", absent: false },
    { name: "John", role: "Staff Member", skillLevel: "Beginner", joinDate: "6/6/2025", absent: true },
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[16px] font-bold">Teams</h2>
          <p className="text-[13px]" style={{ color: "var(--color-muted)" }}>4 Teams · 42 Members · 3 Active</p>
        </div>
        <div className="flex gap-2.5">
          <button
            className="h-[34px] px-3.5 text-[13px] font-semibold rounded-[10px] bg-transparent cursor-pointer"
            style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)" }}
          >
            Invite Member
          </button>
          <button
            className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[10px] border-none cursor-pointer"
            style={{ background: "var(--color-primary)" }}
          >
            + Create Team
          </button>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {teams.map((t) => (
          <div
            key={t.name}
            className="flex flex-col gap-2.5 p-5 rounded-2xl border"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center font-extrabold text-[18px]"
                style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
              >
                {t.name[0]}
              </div>
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                style={t.active ? { background: "#dcfce7", color: "#16a34a" } : { background: "#f3f4f6", color: "var(--color-muted)" }}
              >
                {t.active ? "Active" : "Inactive"}
              </span>
            </div>
            <h4 className="text-[15px] font-bold">{t.name}</h4>
            <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>{t.members} Members · {t.leads} Leads</p>
            <div className="flex items-center gap-2.5 mt-1">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${t.performance}%`, background: "linear-gradient(90deg, #4F6EF7, #7C5CFC)" }}
                />
              </div>
              <span className="text-[12px] font-bold" style={{ color: "var(--color-primary)" }}>{t.performance}%</span>
            </div>
            <div className="flex gap-3 mt-1">
              <button className="bg-transparent border-none text-[12.5px] font-semibold cursor-pointer p-0 hover:underline" style={{ color: "var(--color-primary)" }}>View Details →</button>
              <button className="bg-transparent border-none text-[12.5px] font-semibold cursor-pointer p-0 hover:underline" style={{ color: "var(--color-primary)" }}>Assign Ads</button>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between px-5 pt-[18px] pb-3.5">
          <h3 className="text-[15px] font-bold">Staff Members</h3>
          <button
            className="h-[34px] px-3.5 text-[13px] font-semibold rounded-[10px] bg-transparent cursor-pointer"
            style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)" }}
          >
            Filter Present Staff
          </button>
        </div>
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["Name", "Role", "Skill Level", "Join Date", "Attendance", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.05em]"
                  style={{ color: "var(--color-muted)", borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.name}>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                      style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
                    >
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-[14px]">{s.name}</p>
                      <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>Joined {s.joinDate}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>{s.role}</span>
                </td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{s.skillLevel}</td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{s.joinDate}</td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                    style={s.absent ? { background: "#fee2e2", color: "#dc2626" } : { background: "#dcfce7", color: "#16a34a" }}
                  >
                    {s.absent ? "Absent" : "Present"}
                  </span>
                </td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-[6px] text-[12px] font-semibold bg-transparent cursor-pointer" style={{ border: "1px solid var(--color-border)", color: "var(--color-primary)" }}>Profile</button>
                    <button className="px-3 py-1 rounded-[6px] text-[12px] font-semibold bg-transparent cursor-pointer" style={{ border: "1px solid var(--color-border)", color: "var(--color-primary)" }}>Assign</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
