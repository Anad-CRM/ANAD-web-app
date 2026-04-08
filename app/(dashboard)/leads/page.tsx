export default function LeadsPage() {
  const leads = [
    { name: "Jagan kid", mobile: "9876677573", source: "Facebook", status: "New Lead", assignedTo: "Nick D", date: "20-03-2026" },
    { name: "Jesse Pinkman", mobile: "8947377337", source: "Manual", status: "Hot Lead", assignedTo: "Nick D", date: "20-02-2026" },
    { name: "John Wick", mobile: "597366478", source: "WhatsApp", status: "Follow Up", assignedTo: "Nick D", date: "03-02-2026" },
  ];

  const statusStyle: Record<string, { bg: string; color: string }> = {
    "New Lead":       { bg: "var(--color-primary-light)", color: "var(--color-primary)" },
    "Hot Lead":       { bg: "#fef3c7", color: "#b45309" },
    "Follow Up":      { bg: "#dbeafe", color: "#1d4ed8" },
    "Closed":         { bg: "#dcfce7", color: "#16a34a" },
    "Not Interested": { bg: "#fee2e2", color: "#dc2626" },
    "RNR":            { bg: "#f3f4f6", color: "var(--color-muted)" },
  };

  const pipeline = [
    { label: "New Leads", val: 100 },
    { label: "Hot Leads", val: 320 },
    { label: "Follow Up", val: 165 },
    { label: "Closed", val: 38 },
    { label: "Not Interested", val: 50 },
    { label: "RNR", val: 50 },
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[16px] font-bold">All Leads</h2>
          <p className="text-[13px]" style={{ color: "var(--color-muted)" }}>723 total leads</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button
            className="h-9 px-4 text-[13px] font-semibold rounded-[10px] bg-transparent cursor-pointer transition-all duration-150"
            style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)" }}
          >
            Bulk Upload CSV
          </button>
          <button
            className="h-9 px-4 text-[13px] font-semibold rounded-[10px] bg-transparent cursor-pointer transition-all duration-150"
            style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text)" }}
          >
            Filter
          </button>
          <button
            className="h-9 px-4 text-[13px] font-semibold text-white rounded-[10px] border-none cursor-pointer"
            style={{ background: "var(--color-primary)" }}
          >
            + New Lead
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {pipeline.map((p) => (
          <div
            key={p.label}
            className="flex flex-col gap-1 px-[18px] py-3.5 rounded-2xl border min-w-[100px]"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
          >
            <span className="text-[22px] font-extrabold" style={{ color: "var(--color-text)" }}>{p.val}</span>
            <span className="text-[11px] font-medium" style={{ color: "var(--color-muted)" }}>{p.label}</span>
          </div>
        ))}
      </div>

      <div
        className="overflow-x-auto rounded-2xl border"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
      >
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["Name", "Mobile", "Source", "Status", "Assigned To", "Created", "Actions"].map((h) => (
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
            {leads.map((l) => {
              const s = statusStyle[l.status] ?? { bg: "#f3f4f6", color: "var(--color-muted)" };
              return (
                <tr key={l.mobile} className="hover:[&>td]:bg-[#fafbff]">
                  <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <span className="font-semibold" style={{ color: "var(--color-text)" }}>{l.name}</span>
                  </td>
                  <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{l.mobile}</td>
                  <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide" style={{ background: "#f3f4f6", color: "var(--color-muted)" }}>{l.source}</span>
                  </td>
                  <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide" style={{ background: s.bg, color: s.color }}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>{l.assignedTo}</td>
                  <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{l.date}</td>
                  <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded-[6px] text-[12px] font-semibold cursor-pointer bg-transparent transition-all duration-150"
                        style={{ border: "1px solid var(--color-border)", color: "var(--color-primary)" }}
                      >
                        View
                      </button>
                      <button
                        className="px-3 py-1 rounded-[6px] text-[12px] font-semibold cursor-pointer bg-transparent transition-all duration-150"
                        style={{ border: "1px solid var(--color-border)", color: "var(--color-danger)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
