export default function EodPage() {
  const reports = [
    { name: "Nick D", date: "03 Feb", callsMade: 12, received: 8, missed: 4, avgDuration: "3:34", status: "Submitted" },
    { name: "Jesse Pinkman", date: "03 Feb", callsMade: 10, received: 7, missed: 3, avgDuration: "4:13", status: "Submitted" },
    { name: "John Wick", date: "03 Feb", callsMade: 8, received: 5, missed: 3, avgDuration: "2:45", status: "Pending" },
  ];

  const performers = [
    { title: "Performer of the Month", name: "Nick D", calls: 130, rate: "69%" },
    { title: "Performer of the Week", name: "Nick D", calls: 50, rate: "54%" },
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      <div
        className="p-[22px] rounded-2xl border"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-start justify-between gap-5 flex-wrap">
          <div>
            <p className="text-[15px] font-bold">Automatic EOD Mode Active</p>
            <p className="text-[13px] mt-1" style={{ color: "var(--color-muted)" }}>
              EOD reports for all staff are generated automatically. Switch to manual mode for manual submissions.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
              style={{ background: "#dcfce7", color: "#16a34a" }}
            >
              Automatic
            </span>
            <button
              className="h-[34px] px-3.5 text-[13px] font-semibold rounded-[10px] bg-transparent cursor-pointer"
              style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)" }}
            >
              Switch to Manual
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {performers.map((p) => (
          <div
            key={p.title}
            className="flex flex-col gap-3 p-5 rounded-2xl border"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--color-muted)" }}>{p.title}</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-bold text-white flex-shrink-0"
                style={{ background: "var(--color-primary)" }}
              >
                {p.name[0]}
              </div>
              <div>
                <p className="font-bold text-[15px]">{p.name}</p>
                <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>{p.calls} calls · {p.rate} success</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="overflow-x-auto rounded-2xl border"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between px-5 pt-[18px] pb-3.5">
          <h3 className="text-[15px] font-bold">EOD Reports</h3>
          <div className="flex gap-2">
            <button
              className="h-[34px] px-3.5 text-[13px] font-semibold rounded-[10px] bg-transparent cursor-pointer"
              style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)" }}
            >
              Export Report
            </button>
            <button
              className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[10px] border-none cursor-pointer"
              style={{ background: "var(--color-primary)" }}
            >
              Regenerate
            </button>
          </div>
        </div>
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["Staff Member", "Date", "Calls Made", "Received", "Missed", "Avg Duration", "Status"].map((h) => (
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
            {reports.map((r) => (
              <tr key={r.name}>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                      style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
                    >
                      {r.name[0]}
                    </div>
                    <span className="font-semibold">{r.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{r.date}</td>
                <td className="px-4 py-3.5 font-bold" style={{ borderBottom: "1px solid var(--color-border)" }}>{r.callsMade}</td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{r.received}</td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide" style={{ background: "#fee2e2", color: "#dc2626" }}>{r.missed}</span>
                </td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{r.avgDuration}</td>
                <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                    style={r.status === "Submitted"
                      ? { background: "#dcfce7", color: "#16a34a" }
                      : { background: "#fef3c7", color: "#b45309" }
                    }
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
