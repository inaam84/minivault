import { useState } from 'react';
import { theme } from '../../styles/theme';
import { createOrg } from '../../api/organisationService';

export default function CreateOrgForm({ onCreated }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setLoading(true);
        setError('');
        try {
            const org = await createOrg(name.trim());
            onCreated(org);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .create-org-btn:hover { background: ${theme.colors.primaryHover} !important; }
                .org-input:focus { outline: none; border-color: ${theme.colors.primary} !important; }
            `}</style>
            <div style={styles.wrap}>
                <div style={styles.card}>
                    <div style={styles.iconWrap}>
                        <span style={{ fontSize: 32 }}>🏢</span>
                    </div>
                    <h2 style={styles.title}>Create your organisation</h2>
                    <p style={styles.subtitle}>
                        Organisations let you manage teams, share secrets securely,
                        and collaborate with your colleagues.
                    </p>

                    <div style={styles.field}>
                        <label style={styles.label}>Organisation name</label>
                        <input
                            className="org-input"
                            style={styles.input}
                            placeholder="e.g. Acme Corp"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            autoFocus
                        />
                        <p style={styles.hint}>
                            A URL-friendly slug will be generated automatically.
                        </p>
                    </div>

                    {error && <div style={styles.error}>⚠️ {error}</div>}

                    <button
                        className="create-org-btn"
                        style={{ ...styles.btn, opacity: loading || !name.trim() ? 0.6 : 1 }}
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                    >
                        {loading ? 'Creating…' : 'Create Organisation'}
                    </button>
                </div>
            </div>
        </>
    );
}

const styles = {
    wrap: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
    },
    card: {
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 16,
        padding: '40px 48px',
        maxWidth: 480,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        animation: 'fadeSlideIn 0.4s ease both',
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 16,
        background: theme.colors.primaryMuted,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        color: theme.colors.textPrimary,
        fontSize: 22,
        fontWeight: 800,
        fontFamily: theme.fonts.sans,
        marginBottom: 10,
        letterSpacing: '-0.5px',
    },
    subtitle: {
        color: theme.colors.textMuted,
        fontSize: 14,
        fontFamily: theme.fonts.sans,
        lineHeight: 1.7,
        marginBottom: 28,
    },
    field: {
        width: '100%',
        textAlign: 'left',
        marginBottom: 20,
    },
    label: {
        display: 'block',
        color: theme.colors.textSecondary,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: theme.fonts.sans,
        marginBottom: 8,
    },
    input: {
        width: '100%',
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: 8,
        padding: '11px 14px',
        color: theme.colors.textPrimary,
        fontSize: 14,
        fontFamily: theme.fonts.mono,
        transition: 'border-color 0.15s',
    },
    hint: {
        color: theme.colors.textDim,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
        marginTop: 6,
    },
    error: {
        color: theme.colors.danger,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        marginBottom: 16,
    },
    btn: {
        width: '100%',
        background: theme.colors.primary,
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '12px',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: theme.fonts.sans,
        cursor: 'pointer',
        transition: 'background 0.15s',
    },
};
