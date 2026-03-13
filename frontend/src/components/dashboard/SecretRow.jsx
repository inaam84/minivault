import { theme } from '../../styles/theme';

export default function SecretRow({ secret, revealed, copied, onReveal, onCopy, isLast }) {
    const envColor = theme.envColors[secret.env] || '#64748b';
    const typeIcon = theme.typeIcons[secret.type] || '🔐';

    return (
        <>
            <style>{`
                .secret-row:hover { background: rgba(99,102,241,0.06) !important; }
                .icon-btn:hover { background: rgba(99,102,241,0.2) !important; color: #a5b4fc !important; }
            `}</style>
            <div
                className="secret-row"
                style={{
                    ...styles.row,
                    borderBottom: !isLast ? `1px solid ${theme.colors.bg}` : 'none',
                }}
            >
                {/* Name */}
                <span style={{ flex: 3, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{typeIcon}</span>
                    <span style={styles.name}>{secret.name}</span>
                </span>

                {/* Value */}
                <span style={styles.value}>
                    {revealed ? 'sk_live_••••abc123' : '••••••••••••••••'}
                </span>

                {/* Env */}
                <span style={{ flex: 1 }}>
                    <span style={{
                        ...styles.envBadge,
                        background: `${envColor}18`,
                        color: envColor,
                        borderColor: `${envColor}40`,
                    }}>
                        {secret.env}
                    </span>
                </span>

                {/* Updated */}
                <span style={styles.updated}>{secret.updated}</span>

                {/* Actions */}
                <span style={styles.actions}>
                    <button
                        className="icon-btn"
                        onClick={() => onReveal(secret.id)}
                        style={styles.iconBtn}
                        title={revealed ? 'Hide' : 'Reveal'}
                    >
                        {revealed ? '🙈' : '👁'}
                    </button>
                    <button
                        className="icon-btn"
                        onClick={() => onCopy(secret.id)}
                        style={{ ...styles.iconBtn, color: copied ? theme.colors.success : theme.colors.textMuted }}
                        title="Copy"
                    >
                        {copied ? '✓' : '⎘'}
                    </button>
                    <button className="icon-btn" style={styles.iconBtn} title="Edit">✏</button>
                </span>
            </div>
        </>
    );
}

const styles = {
    row: {
        display: 'flex',
        alignItems: 'center',
        padding: '14px 24px',
        transition: 'background 0.15s',
        animation: 'fadeSlideIn 0.3s ease both',
    },
    name: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: theme.fonts.mono,
    },
    value: {
        flex: 2,
        fontFamily: theme.fonts.mono,
        fontSize: 13,
        color: theme.colors.textMuted,
    },
    envBadge: {
        fontSize: 11,
        padding: '3px 8px',
        borderRadius: 4,
        fontWeight: 600,
        fontFamily: theme.fonts.mono,
        border: '1px solid',
    },
    updated: {
        flex: 1,
        color: theme.colors.textMuted,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
    },
    actions: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 6,
    },
    iconBtn: {
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        width: 30,
        height: 30,
        borderRadius: 6,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
};
