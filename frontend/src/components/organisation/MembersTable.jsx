import { useState } from 'react';
import { theme } from '../../styles/theme';
import { removeMember } from '../../api/organisationService';

export default function MembersTable({ members, userRole, onMembersChange, onInvite }) {
    const [removingId, setRemovingId] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleRemove = async (member) => {
        if (!window.confirm(`Remove ${member.name} from the organisation?`)) return;
        setRemovingId(member.accountId);
        try {
            await removeMember(member.accountId);
            onMembersChange();
        } catch (err) {
            alert(err.message);
        } finally {
            setRemovingId(null);
        }
    };

    const canManage = userRole === 'OWNER' || userRole === 'ADMIN';

    const roleColor = {
        OWNER: theme.colors.warning,
        ADMIN: theme.colors.primary,
        MEMBER: theme.colors.textMuted,
    };

    return (
        <>
            <style>{`
                .member-row:hover { background: rgba(99,102,241,0.04) !important; }
                .remove-btn:hover { background: rgba(239,68,68,0.12) !important; color: ${theme.colors.danger} !important; }
                .invite-btn:hover { background: ${theme.colors.primaryHover} !important; }
            `}</style>
            <div style={styles.panel}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Members</h2>
                        <p style={styles.subtitle}>{members.length} member{members.length !== 1 ? 's' : ''}</p>
                    </div>
                    {canManage && (
                        <button className="invite-btn" style={styles.inviteBtn} onClick={onInvite}>
                            + Invite member
                        </button>
                    )}
                </div>

                <div style={styles.tableHeader}>
                    <span style={{ flex: 2 }}>NAME</span>
                    <span style={{ flex: 2 }}>EMAIL</span>
                    <span style={{ flex: 1 }}>ROLE</span>
                    <span style={{ flex: 1 }}>JOINED</span>
                    {canManage && <span style={{ flex: 1, textAlign: 'right' }}>ACTIONS</span>}
                </div>

                {members.map((member, i) => (
                    <div
                        key={member.accountId}
                        className="member-row"
                        style={{
                            ...styles.row,
                            borderBottom: i < members.length - 1 ? `1px solid ${theme.colors.bg}` : 'none',
                        }}
                    >
                        <span style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={styles.avatar}>
                                {(member.name || 'U')[0].toUpperCase()}
                            </div>
                            <span style={styles.name}>{member.name}</span>
                            {member.accountId === user.id && (
                                <span style={styles.youBadge}>you</span>
                            )}
                        </span>
                        <span style={{ flex: 2, color: theme.colors.textMuted, fontSize: 13, fontFamily: theme.fonts.mono }}>
                            {member.email}
                        </span>
                        <span style={{ flex: 1 }}>
                            <span style={{
                                ...styles.roleBadge,
                                color: roleColor[member.role] || theme.colors.textMuted,
                                borderColor: roleColor[member.role] || theme.colors.textMuted,
                            }}>
                                {member.role}
                            </span>
                        </span>
                        <span style={{ flex: 1, color: theme.colors.textMuted, fontSize: 12, fontFamily: theme.fonts.mono }}>
                            {new Date(member.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        {canManage && (
                            <span style={{ flex: 1, textAlign: 'right' }}>
                                {member.role !== 'OWNER' && member.accountId !== user.id && (
                                    <button
                                        className="remove-btn"
                                        style={styles.removeBtn}
                                        onClick={() => handleRemove(member)}
                                        disabled={removingId === member.accountId}
                                    >
                                        {removingId === member.accountId ? '…' : 'Remove'}
                                    </button>
                                )}
                            </span>
                        )}
                    </div>
                ))}
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
        marginBottom: 24,
        animation: 'fadeSlideIn 0.3s ease both',
        animationDelay: '0.05s',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: `1px solid ${theme.colors.border}`,
    },
    title: {
        color: theme.colors.textPrimary,
        fontSize: 15,
        fontWeight: 700,
        fontFamily: theme.fonts.sans,
    },
    subtitle: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
        marginTop: 3,
    },
    inviteBtn: {
        background: theme.colors.primary,
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
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
        transition: 'background 0.15s',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
    },
    name: {
        color: theme.colors.textPrimary,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: theme.fonts.sans,
    },
    youBadge: {
        fontSize: 10,
        fontFamily: theme.fonts.mono,
        color: theme.colors.primary,
        background: theme.colors.primaryMuted,
        padding: '1px 6px',
        borderRadius: 4,
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
    removeBtn: {
        background: 'transparent',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        padding: '5px 12px',
        borderRadius: 6,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
        fontWeight: 600,
        transition: 'all 0.15s',
    },
};
