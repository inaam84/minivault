import { theme } from '../../styles/theme';

export default function Topbar({ user, onLogout }) {
    const initial = (user?.name || 'U')[0].toUpperCase();

    return (
        <>
            <style>{`
                .logout-btn:hover { border-color: ${theme.colors.primary} !important; color: #a5b4fc !important; }
            `}</style>
            <header style={styles.topbar}>
                <div>
                    <p style={styles.greeting}>Good morning,</p>
                    <h1 style={styles.userName}>{user?.name || 'User'}</h1>
                </div>
                <div style={styles.right}>
                    <div style={styles.avatar}>{initial}</div>
                    <button className="logout-btn" onClick={onLogout} style={styles.logoutBtn}>
                        Sign out
                    </button>
                </div>
            </header>
        </>
    );
}

const styles = {
    topbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 36,
    },
    greeting: {
        color: theme.colors.textMuted,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        marginBottom: 4,
    },
    userName: {
        color: theme.colors.textPrimary,
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: '-0.5px',
        fontFamily: theme.fonts.sans,
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 15,
        fontFamily: theme.fonts.sans,
    },
    logoutBtn: {
        background: 'transparent',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        padding: '7px 16px',
        borderRadius: 8,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
        fontWeight: 600,
        transition: 'all 0.15s',
    },
};
