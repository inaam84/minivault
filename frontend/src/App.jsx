import { useEffect, useState } from "react";

export default function App() {
  const [getRes, setGetRes] = useState(null);
  const [postRes, setPostRes] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("/api/heartbeat")
      .then((r) => r.json())
      .then(setGetRes)
      .catch((err) => setGetRes({ error: String(err) }));
  }, []);

  const sendBeat = async () => {
    setPostRes(null);
    try {
      const r = await fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      setPostRes(await r.json());
    } catch (e) {
      setPostRes({ error: String(e) });
    }
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: 24,
        lineHeight: 1.5,
      }}
    >
      <h1>MiniVault</h1>
      <p>Backend heartbeat check (GET /api/heartbeat):</p>
      <pre>{JSON.stringify(getRes, null, 2)}</pre>

      <h2>Send a heartbeat (POST)</h2>
      <input
        placeholder="optional note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ padding: 8, marginRight: 8 }}
      />
      <button onClick={sendBeat} style={{ padding: "8px 12px" }}>
        Send
      </button>
      <pre>{postRes ? JSON.stringify(postRes, null, 2) : null}</pre>
    </div>
  );
}
