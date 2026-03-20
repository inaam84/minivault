import { useState, useEffect } from 'react';
import { theme } from '../../styles/theme';
import { privateFetch } from '../utils/apiClient';

const EMPTY_PAIR = () => ({ id: Date.now() + Math.random(), key: '', value: '' });

export default function NewSecretModal({ isOpen, onClose, onSuccess, prefillPath = '' }) {
    const [path, setPath] = useState(prefillPath);
    const [pairs, setPairs] = useState([EMPTY_PAIR()]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [visible, setVisible] = useState(false);

    // Animate in/out
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setVisible(true), 10);
            setPath(prefillPath);
            setPairs([EMPTY_PAIR()]);
            setError('');
            setFieldErrors({});
        } else {
            setVisible(false);
        }
    }, [isOpen, prefillPath]);

    if (!isOpen) return null;

    const updatePair = (id, field, value) => {
        setPairs(ps => ps.map(p => p.id === id ? { ...p, [field]: value } : p));
        setFieldErrors(e => ({ ...e, [`${id}-${field}`]: '' }));
    };

    const addPair = () => setPairs(ps => [...ps, EMPTY_PAIR()]);

    const removePair = (id) => {
        if (pairs.length === 1) return; // keep at least one
        setPairs(ps => ps.filter(p => p.id !== id));
    };

    const validate = () => {
        const errs = {};
        if (!path.trim()) errs.path = 'Path is required';
        pairs.forEach(p => {
            if (!p.key.trim()) errs[`${p.id}-key`] = 'Required';
            if (!p.value.trim()) errs[`${p.id}-value`] = 'Required';
        });
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setFieldErrors(errs); return; }
        setError('');
        setLoading(true);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = user?.token;

        try {
            const res = await privateFetch('/api/secrets/category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    path: path.trim(),
                    secrets: pairs.map(({ key, value }) => ({ key: key.trim(), value: value.trim() })),
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error?.message || 'Failed to create secret');
            }
            onSuccess(json.data);
            handleClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 200);
    };

    return (
        <>
            <style>{`
                @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalIn { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes modalOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(16px) scale(0.98); } }
                .pair-input:focus { border-color: ${theme.colors.primary} !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; }
                .add-pair-btn:hover { background: rgba(99,102,241,0.15) !important; color: #a5b4fc !important; }
                .remove-btn:hover { color: ${theme.colors.danger} !important; border-color: ${theme.colors.danger} !important; }
                .cancel-btn:hover { border-color: ${theme.colors.primary} !important; color: #a5b4fc !important; }
                .submit-btn:hover:not(:disabled) { background: ${theme.colors.primaryHover} !important; }
                .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .modal-close:hover { background: rgba(255,255,255,0.08) !important; }
            `}</style>

            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    ...styles.backdrop,
                    animation: 'backdropIn 0.2s ease',
                }}
            />

            {/* Modal */}
            <div style={{
                ...styles.modal,
                animation: visible
                    ? 'modalIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards'
                    : 'modalOut 0.2s ease forwards',
            }}>
                {/* Modal header */}
                <div style={styles.modalHeader}>
                    <div>
                        <h2 style={styles.modalTitle}>New Secret</h2>
                        <p style={styles.modalSubtitle}>Create a new secret category with key-value pairs</p>
                    </div>
                    <button className="modal-close" onClick={handleClose} style={styles.closeBtn}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    {/* Path input */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>PATH</label>
                        <input
                            className="pair-input"
                            placeholder="e.g. Nonprod/km-backend/resource-details"
                            value={path}
                            onChange={e => { setPath(e.target.value); setFieldErrors(fe => ({ ...fe, path: '' })); }}
                            style={{
                                ...styles.input,
                                borderColor: fieldErrors.path ? theme.colors.danger : theme.colors.borderLight,
                            }}
                        />
                        {fieldErrors.path && <p style={styles.fieldError}>{fieldErrors.path}</p>}
                        <p style={styles.hint}>Use / to nest paths — e.g. <span style={{ color: '#a5b4fc' }}>Nonprod/service/config</span></p>
                    </div>

                    {/* Divider */}
                    <div style={styles.sectionDivider}>
                        <span style={styles.sectionLabel}>KEY — VALUE PAIRS</span>
                        <div style={styles.dividerLine} />
                    </div>

                    {/* Key-value pairs */}
                    <div style={styles.pairsContainer}>
                        {pairs.map((pair, i) => (
                            <div key={pair.id} style={styles.pairRow}>
                                <div style={styles.pairIndex}>{String(i + 1).padStart(2, '0')}</div>

                                <div style={styles.pairInputs}>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            className="pair-input"
                                            placeholder="key"
                                            value={pair.key}
                                            onChange={e => updatePair(pair.id, 'key', e.target.value)}
                                            style={{
                                                ...styles.input,
                                                borderColor: fieldErrors[`${pair.id}-key`] ? theme.colors.danger : theme.colors.borderLight,
                                            }}
                                        />
                                        {fieldErrors[`${pair.id}-key`] && (
                                            <p style={styles.fieldError}>{fieldErrors[`${pair.id}-key`]}</p>
                                        )}
                                    </div>
                                    <span style={styles.equals}>=</span>
                                    <div style={{ flex: 2 }}>
                                        <input
                                            className="pair-input"
                                            placeholder="value"
                                            value={pair.value}
                                            onChange={e => updatePair(pair.id, 'value', e.target.value)}
                                            style={{
                                                ...styles.input,
                                                borderColor: fieldErrors[`${pair.id}-value`] ? theme.colors.danger : theme.colors.borderLight,
                                            }}
                                        />
                                        {fieldErrors[`${pair.id}-value`] && (
                                            <p style={styles.fieldError}>{fieldErrors[`${pair.id}-value`]}</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className="remove-btn"
                                    onClick={() => removePair(pair.id)}
                                    disabled={pairs.length === 1}
                                    style={{
                                        ...styles.removeBtn,
                                        opacity: pairs.length === 1 ? 0.3 : 1,
                                        cursor: pairs.length === 1 ? 'not-allowed' : 'pointer',
                                    }}
                                    title="Remove pair"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        {/* Add pair button */}
                        <button className="add-pair-btn" onClick={addPair} style={styles.addPairBtn}>
                            + Add another key-value pair
                        </button>
                    </div>

                    {/* Server error */}
                    {error && (
                        <div style={styles.errorBanner}>⚠️ {error}</div>
                    )}
                </div>

                {/* Footer */}
                <div style={styles.modalFooter}>
                    <button className="cancel-btn" onClick={handleClose} style={styles.cancelBtn}>
                        Cancel
                    </button>
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                        style={styles.submitBtn}
                    >
                        {loading ? 'Creating…' : `Create Secret${pairs.length > 1 ? ` (${pairs.length} pairs)` : ''}`}
                    </button>
                </div>
            </div>
        </>
    );
}

const styles = {
    backdrop: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
    },
    modal: {
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 16,
        width: '100%',
        maxWidth: 580,
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 101,
        overflow: 'hidden',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '24px 28px 20px',
        borderBottom: `1px solid ${theme.colors.border}`,
        flexShrink: 0,
    },
    modalTitle: {
        color: theme.colors.textPrimary,
        fontSize: 18,
        fontWeight: 800,
        fontFamily: theme.fonts.sans,
        letterSpacing: '-0.3px',
    },
    modalSubtitle: {
        color: theme.colors.textMuted,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        marginTop: 4,
    },
    closeBtn: {
        background: 'transparent',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        width: 32, height: 32,
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
        flexShrink: 0,
    },
    modalBody: {
        padding: '24px 28px',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 10,
        padding: '16px 28px',
        borderTop: `1px solid ${theme.colors.border}`,
        flexShrink: 0,
    },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: {
        color: theme.colors.textSecondary,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: theme.fonts.mono,
        letterSpacing: '0.08em',
    },
    input: {
        background: theme.colors.bg,
        border: `1px solid`,
        borderRadius: 8,
        padding: '10px 14px',
        color: theme.colors.textPrimary,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        outline: 'none',
        width: '100%',
        transition: 'border-color 0.15s, box-shadow 0.15s',
    },
    fieldError: {
        color: theme.colors.danger,
        fontSize: 11,
        fontFamily: theme.fonts.mono,
        marginTop: 3,
    },
    hint: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
        marginTop: 2,
    },
    sectionDivider: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    sectionLabel: {
        color: theme.colors.textDim,
        fontSize: 11,
        fontFamily: theme.fonts.mono,
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
    },
    dividerLine: { flex: 1, height: 1, background: theme.colors.border },
    pairsContainer: { display: 'flex', flexDirection: 'column', gap: 10 },
    pairRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
    },
    pairIndex: {
        color: theme.colors.textDim,
        fontSize: 11,
        fontFamily: theme.fonts.mono,
        paddingTop: 12,
        minWidth: 20,
    },
    pairInputs: {
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
    },
    equals: {
        color: theme.colors.textDim,
        fontFamily: theme.fonts.mono,
        fontSize: 16,
        paddingTop: 10,
        flexShrink: 0,
    },
    removeBtn: {
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        width: 32, height: 32,
        borderRadius: 6,
        fontSize: 11,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
        marginTop: 2,
        flexShrink: 0,
    },
    addPairBtn: {
        background: 'rgba(99,102,241,0.08)',
        border: `1px dashed ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        borderRadius: 8,
        padding: '10px',
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        cursor: 'pointer',
        width: '100%',
        transition: 'all 0.15s',
        marginTop: 4,
    },
    errorBanner: {
        background: 'rgba(239,68,68,0.1)',
        border: `1px solid rgba(239,68,68,0.3)`,
        color: theme.colors.danger,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
        fontFamily: theme.fonts.mono,
    },
    cancelBtn: {
        background: 'transparent',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        padding: '9px 20px',
        borderRadius: 8,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
        fontWeight: 600,
        transition: 'all 0.15s',
    },
    submitBtn: {
        background: theme.colors.primary,
        color: '#fff',
        border: 'none',
        padding: '9px 24px',
        borderRadius: 8,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: theme.fonts.sans,
        fontWeight: 700,
        transition: 'background 0.15s',
    },
};
