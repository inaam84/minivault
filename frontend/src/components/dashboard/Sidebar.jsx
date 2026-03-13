import { theme } from '../../styles/theme';

const navItems = [
    { icon: '▦', label: 'Dashboard' },
    { icon: '🗝', label: 'Secrets' },
    { icon: '👥', label: 'Access' },
    { icon: '📋', label: 'Audit Log' },
    { icon: '⚙️', label: 'Settings' },
];

export default function Sidebar({ activeNav, onNavChange, status = 'online' }) {
    return (
        <>
            <style>{`
                .nav-item:hover { background: rgba(99,102,241,0.06); color: #94a3b8; }
            `}</style>
            <aside style={styles.sidebar}>
                <div style={styles.logo}>
                    <span style={{ fontSize: 22 }}>🔐</span>
                    <span style={styles.logoText}>MiniVault</span>
                </div>

                <nav style={styles.nav}>
                    {navItems.map(item => (
                        <div
                            key={item.label}
                            className="nav-item"
                            onClick={() => onNavChange?.(item.label)}
                            style={{
                                ...styles.navItem,
                                ...(activeNav === item.label ? styles.navItemActive : {}),
                            }}
                        >
                            <span style={{ fontSize: 16 }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={styles.footer}>
                    <div style={{
                        ...styles.statusDot,
                        background: status === 'online' ? theme.colors.success : theme.colors.danger,
                    }} />
                    <span style={styles.statusText}>vault-core · {status}</span>
                </div>
            </aside>
        </>
    );
}

const styles = {
    sidebar: {
        width: 220,
        background: theme.colors.surface,
        borderRight: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 0',
        flexShrink: 0,
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 24px 32px',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 800,
        color: theme.colors.textPrimary,
        letterSpacing: '-0.5px',
        fontFamily: theme.fonts.sans,
    },
    nav: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '0 12px',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        color: theme.colors.textMuted,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
        transition: 'all 0.15s',
    },
    navItemActive: {
        background: theme.colors.primaryMuted,
        color: '#a5b4fc',
    },
    footer: {
        padding: '20px 24px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        animation: 'pulse 2s infinite',
    },
    statusText: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
    },
};
