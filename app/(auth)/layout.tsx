export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex" style={{ background: "#163172", fontFamily: "'Inter', sans-serif" }}>
      <div className="hidden md:flex flex-1 items-center justify-center" style={{ background: "#163172" }}>
        <img
          src="/login/login.png"
          alt="ANAD CRM"
          className="h-auto rounded-[26px]"
          style={{ width: "clamp(100px, 18vw, 170px)" }}
        />
      </div>

      <div
        className="relative flex-1 flex items-center justify-center py-12 px-7 min-h-screen md:rounded-[60px_0_0_60px]"
        style={{ background: "#1E56A0" }}
      >
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: -28,
            left: -28,
            width: 106,
            height: 106,
            background: "rgba(30, 86, 160, 0.2)",
          }}
        />
        <div
          className="relative w-full max-w-[500px] overflow-hidden"
          style={{
            background: "#F6F6F6",
            borderRadius: 22,
            boxShadow: "-7px 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
