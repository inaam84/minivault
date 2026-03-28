import { useState } from 'react';
import { theme } from '../../styles/theme';
import { createTeam, addTeamMember, removeTeamMember } from '../../api/organisationService';

// ─────────────────────────────────────────
// Team Detail Modal
// ─────────────────────────────────────────
function TeamDetailModal({ team, members, allMembers, userRole, onClose, onChanged }) {
    const [adding, setAdding] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedRole, setSelectedRole] = useState('MEMBER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canManage = userRole === 'OWNER' || userRole === 'ADMIN';

    // Members not already in this team - TODO: removed "!"
    const available = allMembers.filter(
        m => members.find(tm => tm.accountId === m.accountId)
    );

    const handleAdd = async () => {
        if (!selectedAccountId) return;
        setLoading(true);
        setError('');
        try {
            await addTeamMember(team.id, selectedAccountId, selectedRole);
            setAdding(false);
            setSelectedAccountId('');
            onChanged();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (accountId, name) => {
        if (!window.confirm(`Remove ${name} from ${team.name}?`)) return;
        try {
            await removeTeamMember(team.id, accountId);
            onChanged();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <>
            <style>{`
                .tm-overlay { animation: fadeIn 0.2s ease both; }
                .tm-card { animation: fadeSlideIn 0.25s ease both; }
                .tm-add-btn:hover:not(:disabled) { background: ${theme.colors.primaryHover} !important; }
                .tm-rm-btn:hover { background: rgba(239,68,68,0.1) !important; color: ${theme.colors.danger} !important; }
                .tm-select:focus { outline: none; border-color: ${theme.colors.primary} !important; }
            `}</style>
            <div
                className="tm-overlay"
                style={styles.overlay}
                onClick={e => e.target === e.currentTarget && onClose()}
            >
                <div className="tm-card" style={styles.modalCard}>
                    <div style={styles.modalHeader}>
                        <div>
                            <h2 style={styles.modalTitle}>👥 {team.name}</h2>
                            {team.description && (
                                <p style={styles.modalDesc}>{team.description}</p>
                            )}
                        </div>
                        <button style={styles.closeBtn} onClick={onClose}>✕</button>
                    </div>

                    {/* Member list */}
                    <div style={styles.memberList}>
                        {members.length === 0 && (
                            <p style={styles.empty}>No members in this team yet.</p>
                        )}
                        {members.map(member => (
                            <div key={member.accountId} style={styles.memberRow}>
                                <div style={styles.memberAvatar}>
                                    {(member.name || 'U')[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={styles.memberName}>{member.name}</p>
                                    <p style={styles.memberEmail}>{member.email}</p>
                                </div>
                                <span style={{
                                    ...styles.rolePill,
                                    color: member.role === 'LEAD' ? theme.colors.warning : theme.colors.textMuted,
                                    borderColor: member.role === 'LEAD' ? theme.colors.warning : theme.colors.borderLight,
                                }}>
                                    {member.role}
                                </span>
                                {canManage && (
                                    <button
                                        className="tm-rm-btn"
                                        style={styles.rmBtn}
                                        onClick={() => handleRemove(member.accountId, member.name)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add member */}
                    {canManage && (
                        <div style={styles.addSection}>
                            {!adding ? (
                                <button
                                    style={styles.addToggleBtn}
                                    onClick={() => setAdding(true)}
                                >
                                    + Add member
                                </button>
                            ) : (
                                <div style={styles.addForm}>
                                    <select
                                        className="tm-select"
                                        style={styles.select}
                                        value={selectedAccountId}
                                        onChange={e => setSelectedAccountId(e.target.value)}
                                    >
                                        <option value="">Select a member…</option>
                                        {available.map(m => (
                                            <option key={m.accountId} value={m.accountId}>
                                                {m.name} ({m.email})
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        className="tm-select"
                                        style={styles.select}
                                        value={selectedRole}
                                        onChange={e => setSelectedRole(e.target.value)}
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="LEAD">Lead</option>
                                    </select>
                                    {error && <p style={{ color: theme.colors.danger, fontSize: 12, fontFamily: theme.fonts.mono }}>{error}</p>}
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            className="tm-add-btn"
                                            style={{
                                                ...styles.addSubmitBtn,
                                                opacity: loading || !selectedAccountId ? 0.6 : 1,
                                            }}
                                            onClick={handleAdd}
                                            disabled={loading || !selectedAccountId}
                                        >
                                            {loading ? 'Adding…' : 'Add'}
                                        </button>
                                        <button
                                            style={styles.cancelBtn}
                                            onClick={() => { setAdding(false); setError(''); }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────
// Teams Grid
// ─────────────────────────────────────────
export default function TeamsGrid({ teams, members, userRole, onTeamsChange }) {
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);

    const canManage = userRole === 'OWNER' || userRole === 'ADMIN';

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        setCreateError('');
        try {
            await createTeam(newName.trim(), newDesc.trim());
            setNewName('');
            setNewDesc('');
            setShowCreate(false);
            onTeamsChange();
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            <style>{`
                .team-card:hover { border-color: ${theme.colors.primary} !important; transform: translateY(-2px); }
                .create-team-btn:hover { background: ${theme.colors.primaryHover} !important; }
                .tg-input:focus { outline: none; border-color: ${theme.colors.primary} !important; }
            `}</style>
            <div style={styles.panel}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Teams</h2>
                        <p style={styles.subtitle}>{teams.length} team{teams.length !== 1 ? 's' : ''}</p>
                    </div>
                    {canManage && (
                        <button
                            className="create-team-btn"
                            style={styles.createBtn}
                            onClick={() => setShowCreate(v => !v)}
                        >
                            {showCreate ? '✕ Cancel' : '+ New team'}
                        </button>
                    )}
                </div>

                {/* Create team form */}
                {showCreate && (
                    <div style={styles.createForm}>
                        <input
                            className="tg-input"
                            style={styles.input}
                            placeholder="Team name e.g. backend-team"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            autoFocus
                        />
                        <input
                            className="tg-input"
                            style={styles.input}
                            placeholder="Description (optional)"
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                        />
                        {createError && (
                            <p style={{ color: theme.colors.danger, fontSize: 12, fontFamily: theme.fonts.mono }}>
                                ⚠️ {createError}
                            </p>
                        )}
                        <button
                            className="create-team-btn"
                            style={{ ...styles.createBtn, opacity: creating || !newName.trim() ? 0.6 : 1 }}
                            onClick={handleCreate}
                            disabled={creating || !newName.trim()}
                        >
                            {creating ? 'Creating…' : 'Create team'}
                        </button>
                    </div>
                )}

                {/* Teams grid */}
                <div style={styles.grid}>
                    {teams.length === 0 && !showCreate && (
                        <p style={styles.empty}>No teams yet. Create one to get started.</p>
                    )}
                    {teams.map(team => (
                        <div
                            key={team.id}
                            className="team-card"
                            style={styles.teamCard}
                            onClick={() => setSelectedTeam(team)}
                        >
                            <div style={styles.teamIcon}>👥</div>
                            <p style={styles.teamName}>{team.name}</p>
                            {team.description && (
                                <p style={styles.teamDesc}>{team.description}</p>
                            )}
                            <div style={styles.teamFooter}>
                                <span style={styles.memberCount}>
                                    {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                                </span>
                                <span style={styles.viewLink}>View →</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team detail modal */}
            {selectedTeam && (
                <TeamDetailModal
                    team={selectedTeam}
                    members={members.filter(m =>
                        // In a real app you'd fetch team-specific members from the API
                        // For now passing all org members
                        true
                    )}
                    allMembers={members}
                    userRole={userRole}
                    onClose={() => setSelectedTeam(null)}
                    onChanged={() => { onTeamsChange(); }}
                />
            )}
        </>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
    },
    modalCard: {
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: 16,
        padding: '28px 32px',
        width: '100%',
        maxWidth: 540,
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    modalTitle: {
        color: theme.colors.textPrimary,
        fontSize: 18,
        fontWeight: 800,
        fontFamily: theme.fonts.sans,
        letterSpacing: '-0.5px',
    },
    modalDesc: {
        color: theme.colors.textMuted,
        fontSize: 13,
        fontFamily: theme.fonts.sans,
        marginTop: 4,
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: theme.colors.textMuted,
        fontSize: 16,
        cursor: 'pointer',
    },
    memberList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        marginBottom: 20,
    },
    empty: {
        color: theme.colors.textDim,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        textAlign: 'center',
        padding: '20px 0',
    },
    memberRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 8,
        background: theme.colors.bg,
        marginBottom: 4,
    },
    memberAvatar: {
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
    memberName: {
        color: theme.colors.textPrimary,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: theme.fonts.sans,
    },
    memberEmail: {
        color: theme.colors.textMuted,
        fontSize: 11,
        fontFamily: theme.fonts.mono,
    },
    rolePill: {
        fontSize: 10,
        fontFamily: theme.fonts.mono,
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: 4,
        border: '1px solid',
        background: 'transparent',
    },
    rmBtn: {
        background: 'transparent',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 11,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
        fontWeight: 600,
        transition: 'all 0.15s',
        flexShrink: 0,
    },
    addSection: {
        borderTop: `1px solid ${theme.colors.border}`,
        paddingTop: 16,
    },
    addToggleBtn: {
        background: 'transparent',
        border: `1px dashed ${theme.colors.borderLight}`,
        color: theme.colors.primary,
        padding: '8px 16px',
        borderRadius: 8,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
        fontWeight: 600,
        width: '100%',
    },
    addForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    select: {
        width: '100%',
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: 8,
        padding: '9px 12px',
        color: theme.colors.textPrimary,
        fontSize: 13,
        fontFamily: theme.fonts.sans,
        cursor: 'pointer',
        transition: 'border-color 0.15s',
    },
    addSubmitBtn: {
        background: theme.colors.primary,
        color: '#fff',
        border: 'none',
        padding: '9px 20px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
        transition: 'background 0.15s',
    },
    cancelBtn: {
        background: 'transparent',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        padding: '9px 16px',
        borderRadius: 8,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
    },
    panel: {
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        animation: 'fadeSlideIn 0.3s ease both',
        animationDelay: '0.1s',
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
    createBtn: {
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
    createForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '16px 24px',
        borderBottom: `1px solid ${theme.colors.border}`,
        background: theme.colors.bg,
    },
    input: {
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: 8,
        padding: '9px 12px',
        color: theme.colors.textPrimary,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        transition: 'border-color 0.15s',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
        padding: 24,
    },
    teamCard: {
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 12,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
    },
    teamIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    teamName: {
        color: theme.colors.textPrimary,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: theme.fonts.mono,
    },
    teamDesc: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontFamily: theme.fonts.sans,
        lineHeight: 1.5,
        flex: 1,
    },
    teamFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    memberCount: {
        color: theme.colors.textDim,
        fontSize: 11,
        fontFamily: theme.fonts.mono,
    },
    viewLink: {
        color: theme.colors.primary,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
        fontWeight: 600,
    },
};
