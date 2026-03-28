import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles, theme } from '../styles/theme';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import OrgHeader from '../components/organisation/OrgHeader';
import MembersTable from '../components/organisation/MembersTable';
import TeamsGrid from '../components/organisation/TeamsGrid';
import InviteMemberModal from '../components/organisation/InviteMemberModal';
import CreateOrgForm from '../components/organisation/CreateOrgForm';
import { getMyOrg, getMembers, getTeams } from '../api/organisationService';

export default function Organisation() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{"name":"User"}');

    const [org, setOrg] = useState(null);
    const [members, setMembers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [noOrg, setNoOrg] = useState(false);
    const [showInvite, setShowInvite] = useState(false);

    const loadOrg = async () => {
        setLoading(true);
        setError('');
        try {
            const orgData = await getMyOrg();
            if (!orgData) {
                setNoOrg(true);
                return;
            }
            setOrg(orgData);
            setNoOrg(false);

            const [membersData, teamsData] = await Promise.all([
                getMembers(),
                getTeams(),
            ]);

            setMembers(membersData);
            setTeams(teamsData);

            // Find current user's role
            const me = membersData.find(m => m.email === user.email);
            setUserRole(me?.role || 'MEMBER');

        } catch (err) {
            // 404 means user has no org yet
            if (err.message?.includes('don\'t belong')) {
                setNoOrg(true);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOrg(); }, []);

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
                    Loading organisation…
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
                <button onClick={loadOrg} style={styles.retryBtn}>Retry</button>
            </div>
        </>
    );

    return (
        <>
            <style>{globalStyles}</style>
            <div style={styles.root}>
                <Sidebar
                    activeNav="Organisation"
                    onNavChange={(label) => {
                        if (label === 'Secrets' || label === 'Dashboard') navigate('/dashboard');
                        if (label === 'Audit Log') navigate('/audit');
                    }}
                    status="online"
                />
                <main style={styles.main}>
                    <Topbar user={user} onLogout={handleLogout} />

                    {noOrg ? (
                        <CreateOrgForm onCreated={(newOrg) => {
                            setOrg(newOrg);
                            setNoOrg(false);
                            loadOrg();
                        }} />
                    ) : (
                        <>
                            <OrgHeader
                                org={org}
                                userRole={userRole}
                                onLeave={() => {
                                    setOrg(null);
                                    setNoOrg(true);
                                }}
                            />

                            <MembersTable
                                members={members}
                                userRole={userRole}
                                onMembersChange={loadOrg}
                                onInvite={() => setShowInvite(true)}
                            />

                            <TeamsGrid
                                teams={teams}
                                members={members}
                                userRole={userRole}
                                onTeamsChange={loadOrg}
                            />
                        </>
                    )}
                </main>
            </div>

            {showInvite && (
                <InviteMemberModal
                    onClose={() => setShowInvite(false)}
                    onInvited={loadOrg}
                />
            )}
        </>
    );
}

const styles = {
    root: { display: 'flex', minHeight: '100vh', background: theme.colors.bg },
    main: { flex: 1, padding: '32px 40px', overflowY: 'auto' },
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
    retryBtn: {
        marginTop: 20,
        background: theme.colors.primary,
        color: '#fff',
        border: 'none',
        padding: '10px 24px',
        borderRadius: 8,
        fontSize: 14,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
        fontWeight: 700,
    },
};
