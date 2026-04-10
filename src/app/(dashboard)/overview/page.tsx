export default function OverviewPage() {
  const stats = [
    { label: "Total Leads", value: "723", change: "+20%", positive: true },
    { label: "Hot Leads", value: "320", change: "+5%", positive: true },
    { label: "Follow Ups", value: "165", change: "2.4%", positive: true },
    { label: "Closed", value: "38", change: "+5%", positive: true },
  ];

  const pipeline = [
    { stage: "New Lead", count: 100, color: "#4F6EF7" },
    { stage: "Hot Lead", count: 320, color: "#F59E0B" },
    { stage: "Follow Up", count: 165, color: "#7C5CFC" },
    { stage: "Closed", count: 38, color: "#22C55E" },
    { stage: "Not Interested", count: 50, color: "#EF4444" },
    { stage: "RNR", count: 50, color: "#6B7280" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-2.5 px-[22px] py-5 rounded-2xl border"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
          >
            <p className="text-[13px] font-semibold" style={{ color: "var(--color-muted)" }}>{s.label}</p>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[30px] font-extrabold leading-none" style={{ color: "var(--color-text)" }}>{s.value}</span>
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  background: s.positive ? "#dcfce7" : "#fee2e2",
                  color: s.positive ? "#16a34a" : "#dc2626",
                }}
              >
                {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div
          className="p-[22px] rounded-2xl border"
          style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center justify-between mb-[18px]">
            <h3 className="text-[15px] font-bold">Lead Pipeline</h3>
            <button
              className="h-[34px] px-4 text-[13px] font-semibold rounded-[10px] bg-transparent cursor-pointer transition-all duration-150"
              style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)" }}
            >
              Export Report
            </button>
          </div>
          <div className="flex flex-col gap-3.5">
            {pipeline.map((p) => (
              <div key={p.stage} className="flex items-center gap-3">
                <span className="text-[12.5px] w-[110px] flex-shrink-0" style={{ color: "var(--color-muted)" }}>{p.stage}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(p.count / 400) * 100}%`, background: p.color }}
                  />
                </div>
                <span className="text-[13px] font-bold w-9 text-right" style={{ color: "var(--color-text)" }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="p-5 rounded-2xl border flex flex-col gap-2.5"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
          >
            <span
              className="self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
              style={{ background: "#dcfce7", color: "#16a34a" }}
            >
              Automatic EOD Mode Active
            </span>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
              EOD reports for all staff are generated automatically. Go to EOD settings to switch to manual mode.
            </p>
          </div>

          <div
            className="p-5 rounded-2xl border flex flex-col gap-2.5"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
          >
            <h4 className="text-[14px] font-bold">Smart Auto Assign</h4>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
              System first checks which team members are present today. Intelligently distributes leads based on availability, skill level, and timing.
            </p>
            <button
              className="self-start h-[34px] px-4 text-[13px] font-semibold text-white rounded-[10px] border-none cursor-pointer"
              style={{ background: "var(--color-primary)" }}
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      <div
        className="p-[22px] rounded-2xl border"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-[18px]">
          <h3 className="text-[15px] font-bold">Team Overview</h3>
          <div className="flex gap-2">
            <button
              className="h-[34px] px-4 text-[13px] font-semibold rounded-[10px] bg-transparent cursor-pointer"
              style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)" }}
            >
              Create Team
            </button>
            <button
              className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[10px] border-none cursor-pointer"
              style={{ background: "var(--color-primary)" }}
            >
              Invite Member
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {["Client Onboarding Team", "Market Research Team", "Sales Team"].map((team) => (
            <div
              key={team}
              className="flex items-center gap-4 px-4 py-3 rounded-[10px]"
              style={{ background: "var(--color-bg)" }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-[15px]"
                  style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
                >
                  {team[0]}
                </div>
                <div>
                  <p className="text-[14px] font-semibold">{team}</p>
                  <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>8 Members</p>
                </div>
              </div>
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
              >
                Active
              </span>
              <button
                className="bg-transparent border-none text-[13px] font-semibold cursor-pointer hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
