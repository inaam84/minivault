import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { globalStyles, theme } from '../styles/theme';
import { useSecrets } from '../hooks/useSecrets';
import { buildTree } from '../utils/secretsTree';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatsGrid from '../components/dashboard/StatsGrid';
import PathExplorer from '../components/dashboard/PathExplorer';
import SecretGroupDetail from '../components/dashboard/SecretGroupDetail';

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeNav, setActiveNav] = useState('Secrets');
    const [currentPath, setCurrentPath] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{"name":"User"}');
    const { groups, loading, error, refetch } = useSecrets();

    // Refetch if returning from NewSecret page after a save
    useEffect(() => {
        if (location.state?.refetch) {
            refetch();
            // Clear the state so it doesn't refetch again on re-render
            navigate('/dashboard', { replace: true, state: {} });
        }
    }, [location.state?.refetch]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleNewSecret = () => {
        const prefillPath = currentPath.length > 0 ? currentPath.join('/') + '/' : '';
        navigate('/secrets/new', { state: { prefillPath } });
    };

    const tree = buildTree(groups);

    const currentNode = (() => {
        if (currentPath.length === 0) return tree;
        let node = tree;
        for (const seg of currentPath) {
            if (!node[seg]) return {};
            node = { ...node[seg].__children, __groups: node[seg].__groups };
        }
        return node;
    })();

    if (loading) return (
        <>
            <style>{globalStyles}</style>
            <div style={styles.center}>
                <div style={styles.spinner} />
                <p style={{ color: theme.colors.textSecondary, marginTop: 16, fontFamily: theme.fonts.mono }}>
                    Loading vault…
                </p>
            </div>
        </>
    );

    if (error) return (
        <>
            <style>{globalStyles}</style>
            <div style={styles.center}>
                <div style={{ fontSize: 48 }}>⚠️</div>
                <p style={{ color: theme.colors.danger, marginTop: 16, fontFamily: theme.fonts.mono }}>{error}</p>
                <button onClick={refetch} style={styles.retryBtn}>Retry</button>
            </div>
        </>
    );

    return (
        <>
            <style>{globalStyles}</style>
            <div style={styles.root}>
                <Sidebar
                    activeNav={activeNav}
                    onNavChange={(label) => { setActiveNav(label); setCurrentPath([]); setSelectedGroup(null); }}
                    status="online"
                />
                <main style={styles.main}>
                    <Topbar user={user} onLogout={handleLogout} />
                    <StatsGrid groups={groups} />

                    {selectedGroup ? (
                        <SecretGroupDetail
                            group={selectedGroup}
                            onBack={() => setSelectedGroup(null)}
                        />
                    ) : (
                        <PathExplorer
                            node={currentNode}
                            currentPath={currentPath}
                            onNavigate={(path) => { setCurrentPath(path); setSelectedGroup(null); }}
                            onSelectGroup={setSelectedGroup}
                            onNewSecret={handleNewSecret}
                        />
                    )}
                </main>
            </div>
        </>
    );
}

const styles = {
    root: { display: 'flex', minHeight: '100vh', background: theme.colors.bg },
    main: { flex: 1, padding: '32px 40px', overflowY: 'auto' },
    center: { minHeight: '100vh', background: theme.colors.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    spinner: { width: 36, height: 36, border: `3px solid ${theme.colors.borderLight}`, borderTop: `3px solid ${theme.colors.primary}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    retryBtn: { marginTop: 20, background: theme.colors.primary, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: theme.fonts.sans, fontWeight: 700 },
};
