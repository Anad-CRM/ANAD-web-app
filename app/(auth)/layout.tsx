export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-root">
      {/* ── Left panel: dark navy + logo ── */}
      <div className="auth-left">
        <img src="/login/login.png" alt="ANAD CRM" className="auth-logo" />
      </div>

      {/* ── Right panel: medium blue curved panel ── */}
      <div className="auth-right">
        {/* Decorative circle at top junction — matches Figma */}
        <div className="auth-deco-circle" />
        {/* The white card */}
        <div className="auth-card">{children}</div>
      </div>

      <style>{`
        /* ─── Shell ─── */
        .auth-root {
          min-height: 100vh;
          display: flex;
          background: #163172;
          font-family: 'Inter', sans-serif;
        }

        /* ─── Left: dark navy ─── */
        .auth-left {
          display: none;
          flex: 1;
          align-items: center;
          justify-content: center;
          background: #163172;
        }
        @media (min-width: 768px) {
          .auth-left { display: flex; }
        }
        .auth-logo {
          width: clamp(100px, 18vw, 170px);
          height: auto;
          border-radius: 26px;
        }

        /* ─── Right: #1E56A0 with large border-radius on left edge ─── */
        .auth-right {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1E56A0;
          border-radius: 60px 0 0 60px;   /* mimics the curved path from Figma */
          padding: 48px 28px;
          min-height: 100vh;
        }
        @media (max-width: 767px) {
          .auth-right { border-radius: 0; }
        }

        /* Decorative semi-circle at top-left corner of right panel */
        .auth-deco-circle {
          position: absolute;
          top: -28px;
          left: -28px;
          width: 106px;
          height: 106px;
          border-radius: 50%;
          background: rgba(30, 86, 160, 0.2);
          pointer-events: none;
        }

        /* ─── Card ─── */
        .auth-card {
          position: relative;
          background: #F6F6F6;
          border-radius: 22px;
          width: 100%;
          max-width: 500px;
          overflow: hidden;
          box-shadow: -7px 8px 24px rgba(0,0,0,0.18);
        }
      `}</style>
    </div>
  );
}
