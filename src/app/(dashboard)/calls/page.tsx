export default function CallsPage() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = [130, 104, 165, 120, 200, 80, 50];
  const maxVal = Math.max(...data);

  const statCards = [
    { label: "Total Calls", val: "300", sub: "This Period" },
    { label: "Incoming", val: "130", sub: "+36%" },
    { label: "Outgoing", val: "104", sub: "+45%" },
    { label: "Missed", val: "34", sub: "54%" },
    { label: "Avg Duration", val: "4:13", sub: "Per Call" },
  ];

  const staff = [
    { name: "Nick D", calls: 50, incoming: 23, outgoing: 18, missed: 9, duration: "3:34" },
    { name: "Jesse Pinkman", calls: 43, incoming: 20, outgoing: 15, missed: 8, duration: "4:13" },
    { name: "John Wick", calls: 38, incoming: 18, outgoing: 12, missed: 8, duration: "2:45" },
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        {statCards.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1.5 px-5 py-[18px] rounded-2xl border"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.05em]" style={{ color: "var(--color-muted)" }}>{s.label}</p>
            <p className="text-[28px] font-extrabold leading-none" style={{ color: "var(--color-text)" }}>{s.val}</p>
            <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div
        className="p-[22px] rounded-2xl border"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-bold">Calls Over Time</h3>
          <div className="flex items-center gap-3.5 text-[12px]" style={{ color: "var(--color-muted)" }}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#4F6EF7" }} /> Incoming
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#F59E0B" }} /> Outgoing
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#EF4444" }} /> Missed
            </span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40 pt-2.5">
          {days.map((d, i) => (
            <div key={d} className="flex flex-col items-center gap-1.5 flex-1 h-full">
              <div className="flex-1 w-full flex items-end rounded-[6px] overflow-hidden" style={{ background: "var(--color-bg)" }}>
                <div
                  className="w-full rounded-[6px_6px_0_0] transition-all duration-500"
                  style={{
                    height: `${(data[i] / maxVal) * 100}%`,
                    background: "linear-gradient(180deg, #4F6EF7, #7C5CFC)",
                  }}
                />
              </div>
              <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="overflow-x-auto rounded-2xl border"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between px-5 pt-[18px] pb-0 mb-0">
          <h3 className="text-[15px] font-bold">Detailed Call Breakdown</h3>
          <button
            className="h-[34px] px-3.5 text-[13px] font-semibold rounded-[10px] bg-transparent cursor-pointer"
            style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)" }}
          >
            Export Report
          </button>
        </div>
        <table className="w-full border-collapse text-[13.5px] mt-3">
          <thead>
            <tr>
              {["Staff Member", "Total Calls", "Incoming", "Outgoing", "Missed", "Avg Duration"].map((h) => (
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
                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                      style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
                    >
                      {s.name[0]}
                    </div>
                    <span className="font-semibold">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-bold" style={{ borderBottom: "1px solid var(--color-border)" }}>{s.calls}</td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{s.incoming}</td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{s.outgoing}</td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide" style={{ background: "#fee2e2", color: "#dc2626" }}>{s.missed}</span>
                </td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{s.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
