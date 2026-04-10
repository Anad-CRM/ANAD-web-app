"use client";

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
    <div className="flex flex-col gap-[22px]">
      <div>
        <h2 className="text-[16px] font-bold">Integrations</h2>
        <p className="text-[13px] mt-1" style={{ color: "var(--color-muted)" }}>
          Connect your lead sources and communication channels.
        </p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {integrations.map((intg) => (
          <div
            key={intg.name}
            className="flex flex-col gap-3.5 p-[22px] rounded-2xl border"
            style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-11 h-11 rounded-[12px] flex items-center justify-center text-[20px] font-extrabold"
                style={{ background: intg.color + "22", color: intg.color }}
              >
                {intg.icon}
              </div>
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                style={intg.connected
                  ? { background: "#dcfce7", color: "#16a34a" }
                  : { background: "#f3f4f6", color: "var(--color-muted)" }
                }
              >
                {intg.connected ? "Connected" : "Not Connected"}
              </span>
            </div>

            <h4 className="text-[15px] font-bold">{intg.name}</h4>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-muted)" }}>{intg.desc}</p>

            {intg.fields.length > 0 && !intg.connected && (
              <div className="flex flex-col gap-2">
                {intg.fields.map((f) => (
                  <input
                    key={f}
                    type="text"
                    placeholder={`Paste your ${f.toLowerCase()}`}
                    className="h-[38px] px-3 rounded-[10px] text-[13px] outline-none transition-all duration-200"
                    style={{
                      border: "1.5px solid var(--color-border)",
                      color: "var(--color-text)",
                      background: "var(--color-bg)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-1">
              {intg.connected ? (
                <button
                  className="h-9 px-[18px] rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all duration-150"
                  style={{ background: "#fee2e2", border: "1px solid var(--color-danger)", color: "var(--color-danger)" }}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  className="h-9 px-[18px] text-white rounded-[10px] border-none text-[13px] font-semibold cursor-pointer"
                  style={{ background: "var(--color-primary)" }}
                >
                  Connect
                </button>
              )}
              <button
                className="bg-transparent border-none text-[12.5px] font-semibold cursor-pointer p-0 hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                How to get access token →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
