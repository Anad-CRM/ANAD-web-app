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
    <div className="page-wrap">
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card surface">
            <p className="stat-label">{s.label}</p>
            <div className="stat-row">
              <span className="stat-val">{s.value}</span>
              <span className={`badge ${s.positive ? "badge-success" : "badge-danger"}`}>
                {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <div className="surface pipeline-card">
          <div className="card-header">
            <h3>Lead Pipeline</h3>
            <button className="btn-outline">Export Report</button>
          </div>
          <div className="pipeline-bars">
            {pipeline.map((p) => (
              <div key={p.stage} className="pipeline-row">
                <span className="pipe-label">{p.stage}</span>
                <div className="pipe-track">
                  <div
                    className="pipe-fill"
                    style={{
                      width: `${(p.count / 400) * 100}%`,
                      background: p.color,
                    }}
                  />
                </div>
                <span className="pipe-count">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="side-cards">
          <div className="surface eod-card">
            <div className="eod-badge badge badge-success">Automatic EOD Mode Active</div>
            <p className="eod-desc">
              EOD reports for all staff are generated automatically. Go to EOD
              settings to switch to manual mode.
            </p>
          </div>

          <div className="surface auto-card">
            <h4>Smart Auto Assign</h4>
            <p className="text-muted" style={{ fontSize: 13 }}>
              System first checks which team members are present today.
              Intelligently distributes leads based on availability, skill level,
              and timing.
            </p>
            <button className="btn-primary-sm">Configure</button>
          </div>
        </div>
      </div>

      <div className="surface teams-card">
        <div className="card-header">
          <h3>Team Overview</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-outline">Create Team</button>
            <button className="btn-primary-sm">Invite Member</button>
          </div>
        </div>
        <div className="teams-grid">
          {["Client Onboarding Team", "Market Research Team", "Sales Team"].map((team) => (
            <div key={team} className="team-row">
              <div className="team-info">
                <div className="team-avatar">{team[0]}</div>
                <div>
                  <p className="team-name">{team}</p>
                  <p className="text-muted" style={{ fontSize: 12 }}>8 Members</p>
                </div>
              </div>
              <span className="badge badge-primary">Active</span>
              <button className="btn-ghost">View Details →</button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .page-wrap { display: flex; flex-direction: column; gap: 24px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
        .stat-card { padding: 20px 22px; display: flex; flex-direction: column; gap: 10px; }
        .stat-label { font-size: 13px; font-weight: 600; color: var(--color-muted); }
        .stat-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .stat-val { font-size: 30px; font-weight: 800; color: var(--color-text); line-height: 1; }
        .main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        @media (max-width: 1100px) { .main-grid { grid-template-columns: 1fr; } }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .card-header h3 { font-size: 15px; font-weight: 700; }
        .pipeline-card { padding: 22px; }
        .pipeline-bars { display: flex; flex-direction: column; gap: 14px; }
        .pipeline-row { display: flex; align-items: center; gap: 12px; }
        .pipe-label { font-size: 12.5px; color: var(--color-muted); width: 110px; flex-shrink: 0; }
        .pipe-track { flex: 1; height: 8px; background: var(--color-border); border-radius: var(--radius-full); overflow: hidden; }
        .pipe-fill { height: 100%; border-radius: var(--radius-full); transition: width 0.4s var(--ease); }
        .pipe-count { font-size: 13px; font-weight: 700; color: var(--color-text); width: 36px; text-align: right; }
        .side-cards { display: flex; flex-direction: column; gap: 16px; }
        .eod-card { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .eod-badge { align-self: flex-start; }
        .eod-desc { font-size: 13px; color: var(--color-muted); line-height: 1.6; }
        .auto-card { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .auto-card h4 { font-size: 14px; font-weight: 700; }
        .teams-card { padding: 22px; }
        .teams-grid { display: flex; flex-direction: column; gap: 12px; }
        .team-row { display: flex; align-items: center; gap: 16px; padding: 12px 16px; background: var(--color-bg); border-radius: var(--radius-md); }
        .team-info { display: flex; align-items: center; gap: 12px; flex: 1; }
        .team-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--color-primary-light); color: var(--color-primary); font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; }
        .team-name { font-size: 14px; font-weight: 600; }
        .btn-outline { height: 34px; padding: 0 16px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: transparent; font-size: 13px; font-weight: 600; color: var(--color-text); cursor: pointer; transition: border-color 0.15s, background 0.15s; }
        .btn-outline:hover { border-color: var(--color-primary); background: var(--color-primary-light); color: var(--color-primary); }
        .btn-primary-sm { height: 34px; padding: 0 16px; background: var(--color-primary); border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; transition: background 0.15s; }
        .btn-primary-sm:hover { background: var(--color-primary-dark); }
        .btn-ghost { background: none; border: none; font-size: 13px; color: var(--color-primary); font-weight: 600; cursor: pointer; }
        .btn-ghost:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
