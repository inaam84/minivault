import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  const [glitch, setGlitch] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000);
    return () => clearInterval(glitchInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div style={styles.root}>
      {/* Grid background */}
      <div style={styles.grid} />

      {/* Glow orb */}
      <div style={styles.orb} />

      <div style={styles.container}>

        {/* Lock icon */}
        <div style={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="22" width="32" height="22" rx="4" fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="1.5"/>
            <path d="M16 22V16C16 10.477 20.477 6 26 6C28.387 6 30.58 6.855 32.284 8.284" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="24" cy="33" r="3" fill="#6366f1"/>
            <line x1="24" y1="36" x2="24" y2="40" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* 404 */}
        <div style={styles.codeWrap}>
          <span style={{
            ...styles.code,
            ...(glitch ? styles.codeGlitch : {}),
          }}>
            404
          </span>
          {glitch && (
            <>
              <span style={{ ...styles.code, ...styles.glitchR }}>404</span>
              <span style={{ ...styles.code, ...styles.glitchB }}>404</span>
            </>
          )}
        </div>

        {/* Message */}
        <h1 style={styles.title}>Secret not found</h1>
        <p style={styles.subtitle}>
          The path you're looking for doesn't exist in the vault.<br />
          It may have been moved, deleted, or never existed.
        </p>

        {/* Terminal block */}
        <div style={styles.terminal}>
          <div style={styles.terminalHeader}>
            <span style={styles.dot} />
            <span style={{ ...styles.dot, background: "#f59e0b" }} />
            <span style={{ ...styles.dot, background: "#10b981" }} />
            <span style={styles.terminalTitle}>minivault ~ error</span>
          </div>
          <div style={styles.terminalBody}>
            <span style={styles.prompt}>$ </span>
            <span style={styles.cmd}>vault kv get </span>
            <span style={styles.path}>{window.location.pathname}</span>
            <br />
            <span style={styles.error}>Error: no secret exists at path "{window.location.pathname}"</span>
            <br />
            <span style={styles.hint}>Did you mean to navigate to </span>
            <span
              style={styles.link}
              onClick={() => navigate("/dashboard")}
            >
              /dashboard
            </span>
            <span style={styles.hint}>?</span>
            <span style={styles.cursor}>█</span>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.btnPrimary} onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
          <button style={styles.btnSecondary} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>

        {/* Countdown */}
        <p style={styles.countdown}>
          Redirecting to dashboard in{" "}
          <span style={styles.countdownNum}>{countdown}s</span>
        </p>

      </div>

      <style>{`
        @keyframes pulse-orb {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mv-404-btn-primary:hover {
          background: #4338ca !important;
          transform: translateY(-1px);
        }
        .mv-404-btn-secondary:hover {
          background: rgba(99,102,241,0.12) !important;
          border-color: #6366f1 !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0f0f13",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  orb: {
    position: "absolute",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
    animation: "pulse-orb 6s ease-in-out infinite",
    pointerEvents: "none",
  },
  container: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "40px 24px",
    animation: "fadeUp 0.6s ease both",
    maxWidth: 560,
    width: "100%",
  },
  iconWrap: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.2)",
  },
  codeWrap: {
    position: "relative",
    marginBottom: 16,
  },
  code: {
    display: "block",
    fontSize: 96,
    fontWeight: 800,
    fontFamily: "'Courier New', monospace",
    color: "#4f46e5",
    lineHeight: 1,
    letterSpacing: "-4px",
    userSelect: "none",
  },
  codeGlitch: {
    textShadow: "2px 0 #ec4899, -2px 0 #06b6d4",
  },
  glitchR: {
    position: "absolute",
    top: 0,
    left: 2,
    color: "#ec4899",
    opacity: 0.6,
    clipPath: "polygon(0 30%, 100% 30%, 100% 50%, 0 50%)",
  },
  glitchB: {
    position: "absolute",
    top: 0,
    left: -2,
    color: "#06b6d4",
    opacity: 0.6,
    clipPath: "polygon(0 60%, 100% 60%, 100% 80%, 0 80%)",
  },
  title: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: 700,
    margin: "0 0 12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 15,
    lineHeight: 1.7,
    margin: "0 0 32px",
    fontFamily: "'Courier New', monospace",
  },
  terminal: {
    width: "100%",
    background: "#0a0a0f",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 32,
    textAlign: "left",
  },
  terminalHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 16px",
    background: "rgba(99,102,241,0.08)",
    borderBottom: "1px solid rgba(99,102,241,0.15)",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#ef4444",
  },
  terminalTitle: {
    color: "#475569",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    marginLeft: 8,
  },
  terminalBody: {
    padding: "16px 20px",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    lineHeight: 2,
    color: "#94a3b8",
  },
  prompt: { color: "#4f46e5" },
  cmd:    { color: "#a5b4fc" },
  path:   { color: "#f59e0b" },
  error:  { color: "#ef4444" },
  hint:   { color: "#475569" },
  link: {
    color: "#6366f1",
    cursor: "pointer",
    textDecoration: "underline",
  },
  cursor: {
    color: "#4f46e5",
    animation: "blink 1s step-end infinite",
    marginLeft: 2,
  },
  actions: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  btnPrimary: {
    className: "mv-404-btn-primary",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Segoe UI', sans-serif",
  },
  btnSecondary: {
    className: "mv-404-btn-secondary",
    background: "transparent",
    color: "#a5b4fc",
    border: "1px solid rgba(99,102,241,0.3)",
    padding: "12px 28px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Segoe UI', sans-serif",
  },
  countdown: {
    color: "#334155",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
  },
  countdownNum: {
    color: "#6366f1",
    fontWeight: 700,
  },
};
