import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [backendUp, setBackendUp] = useState(false);
  const navigate = useNavigate();
  const [getRes, setGetRes] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout

    fetch('/api/heartbeat/simple', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Heartbeat failed');
        return res.json();
      })
      .then(() => setBackendUp(true))
      .catch(() => setBackendUp(false))
      .finally(() => setLoading(false));

    return () => clearTimeout(timeout);
  }, []);

  // Loading screen (1–2 sec max)
  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Checking system status…</div>;
  }

  // Backend is DOWN
  if (!backendUp) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'red' }}>
        ❌ Backend is currently unavailable.
        <br />
        Please try again later.
      </div>
    );
  }

  // Backend is UP → Show normal landing page
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', // center horizontally
        height: '100vh', // full viewport height
        width: '100vw', // full viewport width
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        background: 'linear-gradient(to right, #6a11cb, #2575fc)',
        color: 'white',
      }}
    >
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>MiniVault</h1>
      <p
        style={{
          fontSize: '1.5rem',
          marginBottom: '3rem',
          fontStyle: 'italic',
        }}
      >
        A secure, simple vault to safely store your credentials
      </p>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <button
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'white',
            color: '#2575fc',
            fontWeight: 'bold',
          }}
          onClick={() => navigate('/login')}
        >
          Login
        </button>

        <button
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#2575fc',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          }}
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
