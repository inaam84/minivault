import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Layout from '../components/Layout';

export default function Dashboard() {
  const navigate = useNavigate();
  const [heartbeat, setHeartbeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendUp, setBackendUp] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = user?.token;
    fetch('/api/heartbeat/simple', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Backend not reachable');
        return res.json();
      })
      .then((data) => {
        setHeartbeat(data);
        setBackendUp(true);
      })
      .catch(() => setBackendUp(false))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <Layout>Loading dashboard…</Layout>;
  if (!backendUp) return <Layout>❌ Backend is down. Please try again later.</Layout>;

  return (
    <Layout fullWidth>
      <div style={{ width: 350, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: 16 }}>Welcome {user?.name || 'User'} to MiniVault</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: 24 }}>
          Backend status: {heartbeat?.app || 'Running'}
        </p>
        <Button
          onClick={handleLogout}
          style={{ width: '100%', backgroundColor: 'white', color: '#2575fc' }}
        >
          Logout
        </Button>
      </div>
    </Layout>
  );
}
