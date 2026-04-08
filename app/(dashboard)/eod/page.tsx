export default function EodPage() {
  const reports = [
    { name: "Nick D", date: "03 Feb", callsMade: 12, received: 8, missed: 4, avgDuration: "3:34", status: "Submitted" },
    { name: "Jesse Pinkman", date: "03 Feb", callsMade: 10, received: 7, missed: 3, avgDuration: "4:13", status: "Submitted" },
    { name: "John Wick", date: "03 Feb", callsMade: 8, received: 5, missed: 3, avgDuration: "2:45", status: "Pending" },
  ];

  return (
    <div className="page-wrap">
      <div className="surface mode-card">
        <div className="mode-info">
          <div>
            <p className="mode-title">Automatic EOD Mode Active</p>
            <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
              EOD reports for all staff are generated automatically. Switch to manual mode for manual submissions.
            </p>
          </div>
          <div className="toggle-wrap">
            <span className="badge badge-success">Automatic</span>
            <button className="btn-outline">Switch to Manual</button>
          </div>
        </div>
      </div>

      <div className="performer-grid">
        {[
          { title: "Performer of the Month", name: "Nick D", calls: 130, rate: "69%" },
          { title: "Performer of the Week", name: "Nick D", calls: 50, rate: "54%" },
        ].map((p) => (
          <div key={p.title} className="surface performer-card">
            <p className="perf-title">{p.title}</p>
            <div className="perf-user">
              <div className="perf-av">{p.name[0]}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</p>
                <p className="text-muted" style={{ fontSize: 12 }}>{p.calls} calls · {p.rate} success</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="surface table-wrap">
        <div className="card-header" style={{ padding: "18px 20px 0" }}>
          <h3>EOD Reports</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-outline">Export Report</button>
            <button className="btn-primary-sm">Regenerate</button>
          </div>
        </div>
        <table className="eod-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Date</th>
              <th>Calls Made</th>
              <th>Received</th>
              <th>Missed</th>
              <th>Avg Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.name}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="staff-av">{r.name[0]}</div>
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                  </div>
                </td>
                <td className="text-muted">{r.date}</td>
                <td style={{ fontWeight: 700 }}>{r.callsMade}</td>
                <td className="text-muted">{r.received}</td>
                <td><span className="badge badge-danger">{r.missed}</span></td>
                <td className="text-muted">{r.avgDuration}</td>
                <td>
                  <span className={`badge ${r.status === "Submitted" ? "badge-success" : "badge-warning"}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .page-wrap { display: flex; flex-direction: column; gap: 22px; }
        .mode-card { padding: 22px; }
        .mode-info { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .mode-title { font-size: 15px; font-weight: 700; }
        .toggle-wrap { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .performer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .performer-card { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .perf-title { font-size: 12px; font-weight: 600; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .perf-user { display: flex; align-items: center; gap: 12px; }
        .perf-av { width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary); color: #fff; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .table-wrap { overflow-x: auto; }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .card-header h3 { font-size: 15px; font-weight: 700; }
        .eod-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .eod-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-border); background: var(--color-bg); }
        .eod-table td { padding: 13px 16px; border-bottom: 1px solid var(--color-border); }
        .eod-table tr:last-child td { border-bottom: none; }
        .staff-av { width: 30px; height: 30px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .btn-outline { height: 34px; padding: 0 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: transparent; font-size: 13px; font-weight: 600; color: var(--color-text); cursor: pointer; }
        .btn-outline:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .btn-primary-sm { height: 34px; padding: 0 16px; background: var(--color-primary); border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; }
      `}</style>
    </div>
  );
}
