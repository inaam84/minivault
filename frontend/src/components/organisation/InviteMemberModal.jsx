import { useState } from 'react';
import { theme } from '../../styles/theme';
import { inviteMember } from '../../api/organisationService';

export default function InviteMemberModal({ onClose, onInvited }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInvite = async () => {
        if (!email.trim()) return;
        setLoading(true);
        setError('');
        try {
            await inviteMember(email.trim(), role);
            setSuccess(true);
            setTimeout(() => {
                onInvited?.();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .modal-overlay { animation: fadeIn 0.2s ease both; }
                .modal-card { animation: fadeSlideIn 0.25s ease both; }
                .invite-submit:hover:not(:disabled) { background: ${theme.colors.primaryHover} !important; }
                .invite-input:focus { outline: none; border-color: ${theme.colors.primary} !important; }
                .role-select:focus { outline: none; border-color: ${theme.colors.primary} !important; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
            <div
                className="modal-overlay"
                style={styles.overlay}
                onClick={e => e.target === e.currentTarget && onClose()}
            >
                <div className="modal-card" style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.title}>Invite member</h2>
                        <button style={styles.closeBtn} onClick={onClose}>✕</button>
                    </div>
                    <p style={styles.subtitle}>
                        They'll receive an email with a link to join your organisation.
                        The link expires in 48 hours.
                    </p>

                    <div style={styles.field}>
                        <label style={styles.label}>Email address</label>
                        <input
                            className="invite-input"
                            style={styles.input}
                            type="email"
                            placeholder="colleague@company.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleInvite()}
                            autoFocus
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Role</label>
                        <select
                            className="role-select"
                            style={styles.select}
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="MEMBER">Member — can read/write secrets assigned to their teams</option>
                            <option value="ADMIN">Admin — can manage members, teams and secrets</option>
                        </select>
                    </div>

                    {error && <div style={styles.error}>⚠️ {error}</div>}
                    {success && <div style={styles.successMsg}>✅ Invite sent successfully!</div>}

                    <div style={styles.actions}>
                        <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        <button
                            className="invite-submit"
                            style={{
                                ...styles.submitBtn,
                                opacity: loading || !email.trim() || success ? 0.6 : 1,
                            }}
                            onClick={handleInvite}
                            disabled={loading || !email.trim() || success}
                        >
                            {loading ? 'Sending…' : success ? 'Sent!' : 'Send invite'}
                        </button>
                    </div>
                </div>
            </div>
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
    card: {
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: 16,
        padding: '28px 32px',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        color: theme.colors.textPrimary,
        fontSize: 18,
        fontWeight: 800,
        fontFamily: theme.fonts.sans,
        letterSpacing: '-0.5px',
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: theme.colors.textMuted,
        fontSize: 16,
        cursor: 'pointer',
        padding: 4,
    },
    subtitle: {
        color: theme.colors.textMuted,
        fontSize: 13,
        fontFamily: theme.fonts.sans,
        lineHeight: 1.6,
        marginBottom: 24,
    },
    field: {
        marginBottom: 18,
    },
    label: {
        display: 'block',
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: theme.fonts.sans,
        marginBottom: 7,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    },
    input: {
        width: '100%',
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: 8,
        padding: '10px 14px',
        color: theme.colors.textPrimary,
        fontSize: 14,
        fontFamily: theme.fonts.mono,
        transition: 'border-color 0.15s',
    },
    select: {
        width: '100%',
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: 8,
        padding: '10px 14px',
        color: theme.colors.textPrimary,
        fontSize: 13,
        fontFamily: theme.fonts.sans,
        cursor: 'pointer',
        transition: 'border-color 0.15s',
    },
    error: {
        color: theme.colors.danger,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        marginBottom: 16,
    },
    successMsg: {
        color: theme.colors.success,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        marginBottom: 16,
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 8,
    },
    cancelBtn: {
        background: 'transparent',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        padding: '9px 20px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
    },
    submitBtn: {
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
};
