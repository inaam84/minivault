import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  const [getRes, setGetRes] = useState(null);

  useEffect(() => {
    fetch("/api/heartbeat/simple")
      .then((r) => r.json())
      .then(setGetRes)
      .catch((err) => setGetRes({ error: String(err) }));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center", // center horizontally
        height: "100vh", // full viewport height
        width: "100vw", // full viewport width
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>MiniVault</h1>
      <p
        style={{
          fontSize: "1.5rem",
          marginBottom: "3rem",
          fontStyle: "italic",
        }}
      >
        A secure, simple vault to safely store your credentials
      </p>
      <p>Backend heartbeat check (GET /api/heartbeat):</p>
      <pre>{JSON.stringify(getRes, null, 2)}</pre>

      <div style={{ display: "flex", gap: "2rem" }}>
        <button
          style={{
            padding: "12px 24px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#2575fc",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <button
          style={{
            padding: "12px 24px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#2575fc",
            color: "white",
            fontWeight: "bold",
            boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          }}
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
