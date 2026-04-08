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
    <div className="page-wrap">
      <div className="page-actions">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Teams</h2>
          <p className="text-muted" style={{ fontSize: 13 }}>4 Teams · 42 Members · 3 Active</p>
        </div>
        <div className="action-btns">
          <button className="btn-outline">Invite Member</button>
          <button className="btn-primary-sm">+ Create Team</button>
        </div>
      </div>

      <div className="teams-grid">
        {teams.map((t) => (
          <div key={t.name} className="surface team-card">
            <div className="team-card-header">
              <div className="team-icon">{t.name[0]}</div>
              <span className={`badge ${t.active ? "badge-success" : "badge-muted"}`}>
                {t.active ? "Active" : "Inactive"}
              </span>
            </div>
            <h4 className="team-name">{t.name}</h4>
            <p className="text-muted" style={{ fontSize: 12 }}>{t.members} Members · {t.leads} Leads</p>
            <div className="perf-wrap">
              <div className="perf-bar-track">
                <div className="perf-bar" style={{ width: `${t.performance}%` }} />
              </div>
              <span className="perf-pct">{t.performance}%</span>
            </div>
            <div className="team-actions">
              <button className="btn-ghost">View Details →</button>
              <button className="btn-ghost">Assign Ads</button>
            </div>
          </div>
        ))}
      </div>

      <div className="surface">
        <div className="card-header" style={{ padding: "18px 20px 0" }}>
          <h3>Staff Members</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-outline">Filter Present Staff</button>
          </div>
        </div>
        <table className="staff-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Skill Level</th>
              <th>Join Date</th>
              <th>Attendance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.name}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="staff-av">{s.name[0]}</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</p>
                      <p className="text-muted" style={{ fontSize: 12 }}>Joined {s.joinDate}</p>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-primary">{s.role}</span></td>
                <td className="text-muted">{s.skillLevel}</td>
                <td className="text-muted">{s.joinDate}</td>
                <td>
                  <span className={`badge ${s.absent ? "badge-danger" : "badge-success"}`}>
                    {s.absent ? "Absent" : "Present"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="action-btn">Profile</button>
                    <button className="action-btn">Assign</button>
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
        .action-btns { display: flex; gap: 10px; }
        .teams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .team-card { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .team-card-header { display: flex; align-items: center; justify-content: space-between; }
        .team-icon { width: 42px; height: 42px; border-radius: 12px; background: var(--color-primary-light); color: var(--color-primary); font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center; }
        .team-name { font-size: 15px; font-weight: 700; }
        .perf-wrap { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
        .perf-bar-track { flex: 1; height: 6px; background: var(--color-border); border-radius: var(--radius-full); overflow: hidden; }
        .perf-bar { height: 100%; border-radius: var(--radius-full); background: linear-gradient(90deg, #4F6EF7, #7C5CFC); }
        .perf-pct { font-size: 12px; font-weight: 700; color: var(--color-primary); }
        .team-actions { display: flex; gap: 12px; margin-top: 4px; }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .card-header h3 { font-size: 15px; font-weight: 700; }
        .staff-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .staff-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-border); background: var(--color-bg); }
        .staff-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border); }
        .staff-table tr:last-child td { border-bottom: none; }
        .staff-av { width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .row-actions { display: flex; gap: 8px; }
        .action-btn { padding: 4px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--color-primary); }
        .action-btn:hover { background: var(--color-primary-light); }
        .btn-outline { height: 34px; padding: 0 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: transparent; font-size: 13px; font-weight: 600; color: var(--color-text); cursor: pointer; }
        .btn-outline:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .btn-primary-sm { height: 34px; padding: 0 16px; background: var(--color-primary); border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; }
        .btn-ghost { background: none; border: none; font-size: 12.5px; color: var(--color-primary); font-weight: 600; cursor: pointer; padding: 0; }
      `}</style>
    </div>
  );
}
