import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, theme } from '../styles/theme';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatsGrid from '../components/dashboard/StatsGrid';
import SecretsPanel from '../components/dashboard/SecretsPanel';

const MOCK_SECRETS = [
    { id: 1, name: 'AWS_SECRET_KEY', type: 'credential', updated: '2h ago', env: 'production' },
    { id: 2, name: 'DB_PASSWORD', type: 'password', updated: '1d ago', env: 'staging' },
    { id: 3, name: 'STRIPE_API_KEY', type: 'api_key', updated: '3d ago', env: 'production' },
    { id: 4, name: 'JWT_SECRET', type: 'token', updated: '5d ago', env: 'development' },
    { id: 5, name: 'REDIS_URL', type: 'credential', updated: '1w ago', env: 'production' },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [heartbeat, setHeartbeat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [backendUp, setBackendUp] = useState(true);
    const [activeNav, setActiveNav] = useState('Dashboard');

    const user = JSON.parse(localStorage.getItem('user') || '{"name":"Alex"}');

    useEffect(() => {
        const token = user?.token;
        fetch('/api/heartbeat/simple', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => { setHeartbeat(data); setBackendUp(true); })
            .catch(() => setBackendUp(false))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return (
        <>
            <style>{globalStyles}</style>
            <div style={styles.center}>
                <div style={styles.spinner} />
                <p style={{ color: theme.colors.textSecondary, marginTop: 16, fontFamily: theme.fonts.mono }}>
                    Connecting to vault…
                </p>
            </div>
        </>
    );

    if (!backendUp) return (
        <>
            <style>{globalStyles}</style>
            <div style={styles.center}>
                <div style={{ fontSize: 48 }}>⚠️</div>
                <p style={{ color: theme.colors.danger, marginTop: 16, fontFamily: theme.fonts.mono }}>
                    Backend unreachable. Please try again later.
                </p>
            </div>
        </>
    );

    return (
        <>
            <style>{globalStyles}</style>
            <div style={styles.root}>
                <Sidebar
                    activeNav={activeNav}
                    onNavChange={setActiveNav}
                    status={backendUp ? 'online' : 'offline'}
                />
                <main style={styles.main}>
                    <Topbar user={user} onLogout={handleLogout} />
                    <StatsGrid secrets={MOCK_SECRETS} />
                    <SecretsPanel secrets={MOCK_SECRETS} />
                </main>
            </div>
        </>
    );
}

const styles = {
    root: {
        display: 'flex',
        minHeight: '100vh',
        background: theme.colors.bg,
    },
    main: {
        flex: 1,
        padding: '32px 40px',
        overflowY: 'auto',
    },
    center: {
        minHeight: '100vh',
        background: theme.colors.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        width: 36,
        height: 36,
        border: `3px solid ${theme.colors.borderLight}`,
        borderTop: `3px solid ${theme.colors.primary}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
};
