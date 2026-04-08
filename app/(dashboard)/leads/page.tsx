export default function LeadsPage() {
  const leads = [
    { name: "Jagan kid", mobile: "9876677573", source: "Facebook", status: "New Lead", assignedTo: "Nick D", date: "20-03-2026" },
    { name: "Jesse Pinkman", mobile: "8947377337", source: "Manual", status: "Hot Lead", assignedTo: "Nick D", date: "20-02-2026" },
    { name: "John Wick", mobile: "597366478", source: "WhatsApp", status: "Follow Up", assignedTo: "Nick D", date: "03-02-2026" },
  ];

  const statusColor: Record<string, string> = {
    "New Lead": "badge-primary",
    "Hot Lead": "badge-warning",
    "Follow Up": "badge-info",
    "Closed": "badge-success",
    "Not Interested": "badge-danger",
    "RNR": "badge-muted",
  };

  return (
    <div className="page-wrap">
      <div className="page-actions">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>All Leads</h2>
          <p className="text-muted" style={{ fontSize: 13 }}>723 total leads</p>
        </div>
        <div className="action-btns">
          <button className="btn-outline">Bulk Upload CSV</button>
          <button className="btn-outline">Filter</button>
          <button className="btn-primary-sm">+ New Lead</button>
        </div>
      </div>

      <div className="pipeline-summary">
        {[
          { label: "New Leads", val: 100 },
          { label: "Hot Leads", val: 320 },
          { label: "Follow Up", val: 165 },
          { label: "Closed", val: 38 },
          { label: "Not Interested", val: 50 },
          { label: "RNR", val: 50 },
        ].map((p) => (
          <div key={p.label} className="pipe-chip surface">
            <span className="pipe-chip-val">{p.val}</span>
            <span className="pipe-chip-label">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="surface table-wrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Source</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.mobile}>
                <td><span className="lead-name">{l.name}</span></td>
                <td className="text-muted">{l.mobile}</td>
                <td><span className="badge badge-muted">{l.source}</span></td>
                <td><span className={`badge ${statusColor[l.status] ?? "badge-muted"}`}>{l.status}</span></td>
                <td>{l.assignedTo}</td>
                <td className="text-muted">{l.date}</td>
                <td>
                  <div className="row-actions">
                    <button className="action-btn">View</button>
                    <button className="action-btn danger">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .page-wrap { display: flex; flex-direction: column; gap: 22px; }
        .page-actions { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .action-btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .pipeline-summary { display: flex; gap: 12px; flex-wrap: wrap; }
        .pipe-chip { padding: 14px 18px; display: flex; flex-direction: column; gap: 4px; min-width: 100px; }
        .pipe-chip-val { font-size: 22px; font-weight: 800; color: var(--color-text); }
        .pipe-chip-label { font-size: 11px; color: var(--color-muted); font-weight: 500; }
        .table-wrap { overflow-x: auto; padding: 0; }
        .leads-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .leads-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-border); background: var(--color-bg); }
        .leads-table td { padding: 13px 16px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .leads-table tr:last-child td { border-bottom: none; }
        .leads-table tr:hover td { background: #fafbff; }
        .lead-name { font-weight: 600; color: var(--color-text); }
        .row-actions { display: flex; gap: 8px; }
        .action-btn { padding: 4px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--color-primary); transition: background 0.15s; }
        .action-btn:hover { background: var(--color-primary-light); }
        .action-btn.danger { color: var(--color-danger); }
        .action-btn.danger:hover { background: #fee2e2; border-color: var(--color-danger); }
        .btn-outline { height: 36px; padding: 0 16px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: transparent; font-size: 13px; font-weight: 600; color: var(--color-text); cursor: pointer; transition: border-color 0.15s, background 0.15s; }
        .btn-outline:hover { border-color: var(--color-primary); background: var(--color-primary-light); color: var(--color-primary); }
        .btn-primary-sm { height: 36px; padding: 0 16px; background: var(--color-primary); border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; }
        .btn-primary-sm:hover { background: var(--color-primary-dark); }
      `}</style>
    </div>
  );
}
