import { useState } from 'react';
import { theme } from '../../styles/theme';

function formatDate(iso) {
    return new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function SecretGroupDetail({ group, onBack }) {
    const [revealed, setRevealed] = useState({});
    const [copied, setCopied] = useState(null);

    const toggleReveal = (id) => setRevealed(r => ({ ...r, [id]: !r[id] }));

    const handleCopy = (id, value) => {
        navigator.clipboard.writeText(value).catch(() => {});
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <>
            <style>{`
                .secret-row:hover { background: rgba(99,102,241,0.06) !important; }
                .icon-btn:hover { background: rgba(99,102,241,0.2) !important; color: #a5b4fc !important; }
                .new-btn:hover { background: ${theme.colors.primaryHover} !important; }
                .back-btn:hover { border-color: ${theme.colors.primary} !important; color: #a5b4fc !important; }
            `}</style>

            <div style={styles.panel}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <div style={styles.pathRow}>
                            <button className="back-btn" onClick={onBack} style={styles.backBtn}>
                                ← Back
                            </button>
                            <span style={styles.pathSep}>/</span>
                            <span style={styles.pathText}>{group.path}</span>
                        </div>
                        <p style={styles.subtitle}>
                            {group.secrets.length} secret{group.secrets.length !== 1 ? 's' : ''}
                            {' · '}updated {formatDate(group.updatedAt)}
                        </p>
                    </div>
                    <button className="new-btn" style={styles.newBtn}>+ Add Secret</button>
                </div>

                {/* Table header */}
                <div style={styles.tableHeader}>
                    <span style={{ flex: 2 }}>KEY</span>
                    <span style={{ flex: 3 }}>VALUE</span>
                    <span style={{ flex: 2 }}>CREATED</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>ACTIONS</span>
                </div>

                {/* Rows */}
                {group.secrets.map((secret, i) => (
                    <div
                        key={secret.id}
                        className="secret-row"
                        style={{
                            ...styles.row,
                            borderBottom: i < group.secrets.length - 1 ? `1px solid ${theme.colors.bg}` : 'none',
                            animationDelay: `${i * 40}ms`,
                        }}
                    >
                        {/* Key */}
                        <span style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={styles.keyIcon}>🔑</span>
                            <span style={styles.keyText}>{secret.key}</span>
                        </span>

                        {/* Value */}
                        <span style={{ flex: 3, fontFamily: theme.fonts.mono, fontSize: 13, color: theme.colors.textMuted }}>
                            {revealed[secret.id]
                                ? <span style={{ color: '#a5b4fc' }}>{secret.value}</span>
                                : '••••••••••••••••'
                            }
                        </span>

                        {/* Created */}
                        <span style={{ flex: 2, color: theme.colors.textMuted, fontSize: 12, fontFamily: theme.fonts.mono }}>
                            {formatDate(secret.createdAt)}
                        </span>

                        {/* Actions */}
                        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                                className="icon-btn"
                                onClick={() => toggleReveal(secret.id)}
                                style={styles.iconBtn}
                                title={revealed[secret.id] ? 'Hide' : 'Reveal'}
                            >
                                {revealed[secret.id] ? '🙈' : '👁'}
                            </button>
                            <button
                                className="icon-btn"
                                onClick={() => handleCopy(secret.id, secret.value)}
                                style={{ ...styles.iconBtn, color: copied === secret.id ? theme.colors.success : theme.colors.textMuted }}
                                title="Copy value"
                            >
                                {copied === secret.id ? '✓' : '⎘'}
                            </button>
                            <button className="icon-btn" style={styles.iconBtn} title="Edit">✏</button>
                            <button className="icon-btn" style={{ ...styles.iconBtn, color: '#ef444466' }} title="Delete">🗑</button>
                        </span>
                    </div>
                ))}

                {group.secrets.length === 0 && (
                    <div style={styles.empty}>No secrets in this group</div>
                )}
            </div>
        </>
    );
}

const styles = {
    panel: {
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 14,
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '20px 24px',
        borderBottom: `1px solid ${theme.colors.border}`,
    },
    pathRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    backBtn: {
        background: 'transparent',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        padding: '4px 12px',
        borderRadius: 6,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: theme.fonts.mono,
        transition: 'all 0.15s',
    },
    pathSep: {
        color: theme.colors.textDim,
        fontFamily: theme.fonts.mono,
    },
    pathText: {
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.mono,
        fontSize: 15,
        fontWeight: 600,
    },
    subtitle: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
        marginTop: 2,
    },
    newBtn: {
        background: theme.colors.primary,
        color: '#fff',
        border: 'none',
        padding: '8px 18px',
        borderRadius: 8,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
        fontWeight: 700,
        transition: 'background 0.15s',
    },
    tableHeader: {
        display: 'flex',
        padding: '10px 24px',
        color: theme.colors.textDim,
        fontSize: 11,
        fontFamily: theme.fonts.mono,
        letterSpacing: '0.08em',
        borderBottom: `1px solid ${theme.colors.border}`,
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        padding: '14px 24px',
        animation: 'fadeSlideIn 0.3s ease both',
        transition: 'background 0.15s',
    },
    keyIcon: { fontSize: 14 },
    keyText: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: theme.fonts.mono,
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
    empty: {
        padding: '48px 0',
        textAlign: 'center',
        color: theme.colors.textDim,
        fontFamily: theme.fonts.mono,
    },
};
