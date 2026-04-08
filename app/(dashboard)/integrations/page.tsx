export default function IntegrationsPage() {
  const integrations = [
    {
      name: "WhatsApp Business API",
      desc: "Receive new leads from WhatsApp Business in your account.",
      icon: "💬",
      color: "#25D366",
      connected: false,
      fields: ["Access Token", "Phone Number"],
    },
    {
      name: "Facebook Ads",
      desc: "Connect Facebook to automatically pull ad leads into your pipeline.",
      icon: "f",
      color: "#1877F2",
      connected: true,
      fields: [],
    },
    {
      name: "Instagram",
      desc: "Manage Instagram ad leads and campaigns directly from the dashboard.",
      icon: "◈",
      color: "#E1306C",
      connected: false,
      fields: ["Access Token"],
    },
    {
      name: "Website Widget",
      desc: "Connect your website in 2 simple steps. Copy your unique key and share it with your developer.",
      icon: "⊕",
      color: "#4F6EF7",
      connected: false,
      fields: ["Unique Key"],
    },
  ];

  return (
    <div className="page-wrap">
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Integrations</h2>
        <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
          Connect your lead sources and communication channels.
        </p>
      </div>

      <div className="integrations-grid">
        {integrations.map((intg) => (
          <div key={intg.name} className="surface intg-card">
            <div className="intg-header">
              <div className="intg-icon" style={{ background: intg.color + "22", color: intg.color }}>
                {intg.icon}
              </div>
              <span className={`badge ${intg.connected ? "badge-success" : "badge-muted"}`}>
                {intg.connected ? "Connected" : "Not Connected"}
              </span>
            </div>

            <h4 className="intg-name">{intg.name}</h4>
            <p className="text-muted intg-desc">{intg.desc}</p>

            {intg.fields.length > 0 && !intg.connected && (
              <div className="intg-fields">
                {intg.fields.map((f) => (
                  <input key={f} type="text" placeholder={`Paste your ${f.toLowerCase()}`} />
                ))}
              </div>
            )}

            <div className="intg-footer">
              {intg.connected ? (
                <button className="btn-danger">Disconnect</button>
              ) : (
                <button className="btn-primary-sm">Connect</button>
              )}
              <button className="btn-ghost">How to get access token →</button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .page-wrap { display: flex; flex-direction: column; gap: 22px; }
        .integrations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .intg-card { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
        .intg-header { display: flex; align-items: center; justify-content: space-between; }
        .intg-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; }
        .intg-name { font-size: 15px; font-weight: 700; }
        .intg-desc { font-size: 13px; line-height: 1.6; }
        .intg-fields { display: flex; flex-direction: column; gap: 8px; }
        .intg-fields input { height: 38px; padding: 0 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 13px; color: var(--color-text); background: var(--color-bg); outline: none; transition: border-color 0.18s; }
        .intg-fields input:focus { border-color: var(--color-primary); }
        .intg-footer { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
        .btn-primary-sm { height: 36px; padding: 0 18px; background: var(--color-primary); border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; }
        .btn-primary-sm:hover { background: var(--color-primary-dark); }
        .btn-danger { height: 36px; padding: 0 18px; background: #fee2e2; border: 1px solid var(--color-danger); color: var(--color-danger); border-radius: var(--radius-md); font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-danger:hover { background: #fecaca; }
        .btn-ghost { background: none; border: none; font-size: 12.5px; color: var(--color-primary); font-weight: 600; cursor: pointer; padding: 0; }
        .btn-ghost:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
