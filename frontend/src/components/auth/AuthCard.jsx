import { theme } from '../../styles/theme';

export default function AuthCard({ title, subtitle, children }) {
    return (
        <div style={styles.card}>
            <div style={styles.logoRow}>
                <span style={{ fontSize: 28 }}>🔐</span>
                <span style={styles.logoText}>MiniVault</span>
            </div>
            <h1 style={styles.title}>{title}</h1>
            {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
            <div style={styles.body}>{children}</div>
        </div>
    );
}

const styles = {
    card: {
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 16,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        animation: 'shimmer 0.4s ease both',
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 28,
    },
    logoText: {
        fontSize: 20,
        fontWeight: 800,
        color: theme.colors.textPrimary,
        letterSpacing: '-0.5px',
        fontFamily: theme.fonts.sans,
    },
    title: {
        color: theme.colors.textPrimary,
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: '-0.4px',
        fontFamily: theme.fonts.sans,
        marginBottom: 6,
    },
    subtitle: {
        color: theme.colors.textMuted,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        marginBottom: 28,
        lineHeight: 1.6,
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
};
