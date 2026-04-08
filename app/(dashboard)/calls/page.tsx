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
    <div className="page-wrap">
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card surface">
            <p className="stat-label">{s.label}</p>
            <p className="stat-val">{s.val}</p>
            <p className="text-muted" style={{ fontSize: 12 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="surface chart-card">
        <div className="card-header">
          <h3>Calls Over Time</h3>
          <div className="chart-legend">
            <span className="legend-dot" style={{ background: "#4F6EF7" }} /> Incoming
            <span className="legend-dot" style={{ background: "#F59E0B" }} /> Outgoing
            <span className="legend-dot" style={{ background: "#EF4444" }} /> Missed
          </div>
        </div>
        <div className="bar-chart">
          {days.map((d, i) => (
            <div key={d} className="bar-col">
              <div className="bar-outer">
                <div
                  className="bar-inner"
                  style={{
                    height: `${(data[i] / maxVal) * 100}%`,
                    background: "linear-gradient(180deg, #4F6EF7, #7C5CFC)",
                  }}
                />
              </div>
              <span className="bar-label">{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="surface table-wrap">
        <div className="card-header" style={{ padding: "18px 20px 0" }}>
          <h3>Detailed Call Breakdown</h3>
          <button className="btn-outline">Export Report</button>
        </div>
        <table className="calls-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Total Calls</th>
              <th>Incoming</th>
              <th>Outgoing</th>
              <th>Missed</th>
              <th>Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.name}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="staff-av">{s.name[0]}</div>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 700 }}>{s.calls}</td>
                <td className="text-muted">{s.incoming}</td>
                <td className="text-muted">{s.outgoing}</td>
                <td><span className="badge badge-danger">{s.missed}</span></td>
                <td className="text-muted">{s.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .page-wrap { display: flex; flex-direction: column; gap: 22px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; }
        .stat-card { padding: 18px 20px; display: flex; flex-direction: column; gap: 6px; }
        .stat-label { font-size: 12px; font-weight: 600; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-val { font-size: 28px; font-weight: 800; color: var(--color-text); line-height: 1; }
        .chart-card { padding: 22px; }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .card-header h3 { font-size: 15px; font-weight: 700; }
        .chart-legend { display: flex; align-items: center; gap: 14px; font-size: 12px; color: var(--color-muted); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
        .bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 160px; padding-top: 10px; }
        .bar-col { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; height: 100%; }
        .bar-outer { flex: 1; width: 100%; display: flex; align-items: flex-end; background: var(--color-bg); border-radius: 6px; overflow: hidden; }
        .bar-inner { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.4s var(--ease); }
        .bar-label { font-size: 11px; color: var(--color-muted); }
        .table-wrap { overflow-x: auto; }
        .calls-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .calls-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-border); background: var(--color-bg); }
        .calls-table td { padding: 13px 16px; border-bottom: 1px solid var(--color-border); }
        .calls-table tr:last-child td { border-bottom: none; }
        .staff-av { width: 30px; height: 30px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .btn-outline { height: 34px; padding: 0 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: transparent; font-size: 13px; font-weight: 600; color: var(--color-text); cursor: pointer; }
        .btn-outline:hover { border-color: var(--color-primary); background: var(--color-primary-light); color: var(--color-primary); }
      `}</style>
    </div>
  );
}
