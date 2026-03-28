import { useState } from 'react';
import { theme } from '../../styles/theme';
import { removeMember } from '../../api/organisationService';

export default function OrgHeader({ org, userRole, onLeave }) {
    const [leaving, setLeaving] = useState(false);
    const [error, setError] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this organisation?')) return;
        setLeaving(true);
        setError('');
        try {
            await removeMember(user.id);
            onLeave();
        } catch (err) {
            setError(err.message);
        } finally {
            setLeaving(false);
        }
    };

    const roleColor = {
        OWNER: theme.colors.warning,
        ADMIN: theme.colors.primary,
        MEMBER: theme.colors.textMuted,
    }[userRole] || theme.colors.textMuted;

    return (
        <div style={styles.wrap}>
            <div style={styles.left}>
                <div style={styles.orgIcon}>🏢</div>
                <div>
                    <div style={styles.nameRow}>
                        <h1 style={styles.name}>{org.name}</h1>
                        <span style={{ ...styles.roleBadge, color: roleColor, borderColor: roleColor }}>
                            {userRole}
                        </span>
                    </div>
                    <p style={styles.slug}>/{org.slug}</p>
                    <div style={styles.statsRow}>
                        <span style={styles.stat}>
                            <span style={styles.statNum}>{org.memberCount}</span>
                            <span style={styles.statLabel}>members</span>
                        </span>
                        <span style={styles.divider}>·</span>
                        <span style={styles.stat}>
                            <span style={styles.statNum}>{org.teamCount}</span>
                            <span style={styles.statLabel}>teams</span>
                        </span>
                    </div>
                </div>
            </div>

            <div style={styles.right}>
                {error && <span style={styles.error}>{error}</span>}
                {userRole !== 'OWNER' && (
                    <button
                        style={styles.leaveBtn}
                        onClick={handleLeave}
                        disabled={leaving}
                    >
                        {leaving ? 'Leaving…' : 'Leave org'}
                    </button>
                )}
            </div>
        </div>
    );
}

const styles = {
    wrap: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 14,
        padding: '24px 28px',
        marginBottom: 24,
        animation: 'fadeSlideIn 0.3s ease both',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: 18,
    },
    orgIcon: {
        fontSize: 36,
        width: 56,
        height: 56,
        background: theme.colors.primaryMuted,
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
    },
    name: {
        color: theme.colors.textPrimary,
        fontSize: 20,
        fontWeight: 800,
        fontFamily: theme.fonts.sans,
        letterSpacing: '-0.5px',
    },
    roleBadge: {
        fontSize: 11,
        fontFamily: theme.fonts.mono,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 4,
        border: '1px solid',
        background: 'transparent',
    },
    slug: {
        color: theme.colors.textDim,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        marginBottom: 8,
    },
    statsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    stat: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
    },
    statNum: {
        color: theme.colors.textPrimary,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: theme.fonts.mono,
    },
    statLabel: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
    },
    divider: {
        color: theme.colors.textDim,
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    error: {
        color: theme.colors.danger,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
    },
    leaveBtn: {
        background: 'transparent',
        border: `1px solid ${theme.colors.danger}`,
        color: theme.colors.danger,
        padding: '8px 16px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: theme.fonts.sans,
        cursor: 'pointer',
    },
};
