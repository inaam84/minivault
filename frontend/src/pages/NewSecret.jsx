import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { globalStyles, theme } from '../styles/theme';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';

const EMPTY_PAIR = () => ({ id: Date.now() + Math.random(), key: '', value: '' });

export default function NewSecret() {
    const navigate = useNavigate();
    const location = useLocation();
    const prefillPath = location.state?.prefillPath || '';

    const user = JSON.parse(localStorage.getItem('user') || '{"name":"User"}');

    const [path, setPath] = useState(prefillPath);
    const [pairs, setPairs] = useState([EMPTY_PAIR()]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const updatePair = (id, field, value) => {
        setPairs(ps => ps.map(p => p.id === id ? { ...p, [field]: value } : p));
        setFieldErrors(e => ({ ...e, [`${id}-${field}`]: '' }));
    };

    const addPair = () => setPairs(ps => [...ps, EMPTY_PAIR()]);

    const removePair = (id) => {
        if (pairs.length === 1) return;
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

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setFieldErrors(errs); return; }
        setError('');
        setLoading(true);

        const token = user?.token;
        try {
            const res = await fetch('/api/secrets/category', {
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
            // Success — go back to dashboard
            navigate('/dashboard', { state: { refetch: true } });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{globalStyles + `
                .pair-input:focus { border-color: ${theme.colors.primary} !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; }
                .add-pair-btn:hover { background: rgba(99,102,241,0.15) !important; color: #a5b4fc !important; border-color: ${theme.colors.primary} !important; }
                .remove-btn:hover:not(:disabled) { color: ${theme.colors.danger} !important; border-color: ${theme.colors.danger} !important; }
                .save-btn:hover:not(:disabled) { background: ${theme.colors.primaryHover} !important; }
                .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .cancel-btn:hover { border-color: ${theme.colors.primary} !important; color: #a5b4fc !important; }
            `}</style>

            <div style={styles.root}>
                <Sidebar activeNav="Secrets" onNavChange={() => navigate('/dashboard')} status="online" />

                <main style={styles.main}>
                    <Topbar user={user} onLogout={handleLogout} />

                    {/* Page header */}
                    <div style={styles.pageHeader}>
                        <div>
                            <div style={styles.breadcrumb}>
                                <span style={styles.breadcrumbLink} onClick={() => navigate('/dashboard')}>vault</span>
                                <span style={styles.breadcrumbSep}>/</span>
                                <span style={styles.breadcrumbCurrent}>new secret</span>
                            </div>
                            <h1 style={styles.pageTitle}>New Secret</h1>
                            <p style={styles.pageSubtitle}>Create a new secret category with key-value pairs</p>
                        </div>
                    </div>

                    <div style={styles.layout}>
                        {/* ── Main form ── */}
                        <div style={styles.formCol}>

                            {/* Path section */}
                            <div style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <span style={styles.cardIcon}>🗂️</span>
                                    <div>
                                        <h3 style={styles.cardTitle}>Secret Path</h3>
                                        <p style={styles.cardSubtitle}>Where this secret lives in the vault tree</p>
                                    </div>
                                </div>
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
                                    {fieldErrors.path
                                        ? <p style={styles.fieldError}>{fieldErrors.path}</p>
                                        : <p style={styles.hint}>Use <span style={{ color: '#a5b4fc' }}>/</span> to nest — e.g. <span style={{ color: '#a5b4fc' }}>Nonprod/service/config</span></p>
                                    }
                                </div>
                            </div>

                            {/* Key-value pairs section */}
                            <div style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <span style={styles.cardIcon}>🔑</span>
                                    <div>
                                        <h3 style={styles.cardTitle}>Key-Value Pairs</h3>
                                        <p style={styles.cardSubtitle}>{pairs.length} pair{pairs.length !== 1 ? 's' : ''} added</p>
                                    </div>
                                </div>

                                {/* Column labels */}
                                <div style={styles.pairColumnLabels}>
                                    <span style={{ width: 24 }} />
                                    <span style={{ flex: 1, ...styles.label }}>KEY</span>
                                    <span style={{ width: 16 }} />
                                    <span style={{ flex: 2, ...styles.label }}>VALUE</span>
                                    <span style={{ width: 32 }} />
                                </div>

                                <div style={styles.pairsContainer}>
                                    {pairs.map((pair, i) => (
                                        <div key={pair.id} style={styles.pairRow}>
                                            {/* Row number */}
                                            <span style={styles.pairIndex}>{String(i + 1).padStart(2, '0')}</span>

                                            {/* Key */}
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    className="pair-input"
                                                    placeholder="key-name"
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

                                            {/* Value */}
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

                                            {/* Remove */}
                                            <button
                                                className="remove-btn"
                                                onClick={() => removePair(pair.id)}
                                                disabled={pairs.length === 1}
                                                style={{
                                                    ...styles.removeBtn,
                                                    opacity: pairs.length === 1 ? 0.25 : 1,
                                                    cursor: pairs.length === 1 ? 'not-allowed' : 'pointer',
                                                }}
                                                title="Remove pair"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add pair */}
                                <button className="add-pair-btn" onClick={addPair} style={styles.addPairBtn}>
                                    + Add another key-value pair
                                </button>
                            </div>

                            {/* Error banner */}
                            {error && (
                                <div style={styles.errorBanner}>⚠️ {error}</div>
                            )}
                        </div>

                        {/* ── Sidebar summary ── */}
                        <div style={styles.summaryCol}>
                            <div style={styles.summaryCard}>
                                <h3 style={styles.summaryTitle}>Summary</h3>

                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Path</span>
                                    <span style={styles.summaryValue}>
                                        {path.trim() || <span style={{ color: theme.colors.textDim }}>not set</span>}
                                    </span>
                                </div>

                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Pairs</span>
                                    <span style={{ ...styles.summaryValue, color: '#a5b4fc' }}>{pairs.length}</span>
                                </div>

                                <div style={styles.summaryDivider} />

                                {/* Preview */}
                                {pairs.filter(p => p.key).length > 0 && (
                                    <div style={styles.previewBlock}>
                                        <p style={styles.previewLabel}>PREVIEW</p>
                                        {pairs.filter(p => p.key).map(p => (
                                            <div key={p.id} style={styles.previewRow}>
                                                <span style={styles.previewKey}>{p.key || '—'}</span>
                                                <span style={styles.previewSep}>:</span>
                                                <span style={styles.previewVal}>{p.value || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <button
                                        className="save-btn"
                                        onClick={handleSave}
                                        disabled={loading}
                                        style={styles.saveBtn}
                                    >
                                        {loading ? 'Saving…' : '💾 Save Secret'}
                                    </button>
                                    <button
                                        className="cancel-btn"
                                        onClick={() => navigate('/dashboard')}
                                        style={styles.cancelBtn}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

const styles = {
    root: { display: 'flex', minHeight: '100vh', background: theme.colors.bg },
    main: { flex: 1, padding: '32px 40px', overflowY: 'auto' },

    pageHeader: { marginBottom: 28 },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
    breadcrumbLink: { color: theme.colors.primary, fontSize: 13, fontFamily: theme.fonts.mono, cursor: 'pointer' },
    breadcrumbSep: { color: theme.colors.textDim, fontFamily: theme.fonts.mono, fontSize: 13 },
    breadcrumbCurrent: { color: theme.colors.textSecondary, fontSize: 13, fontFamily: theme.fonts.mono },
    pageTitle: { color: theme.colors.textPrimary, fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', fontFamily: theme.fonts.sans },
    pageSubtitle: { color: theme.colors.textMuted, fontSize: 13, fontFamily: theme.fonts.mono, marginTop: 4 },

    layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' },

    formCol: { display: 'flex', flexDirection: 'column', gap: 20 },

    card: {
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 14,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
    },
    cardHeader: { display: 'flex', alignItems: 'flex-start', gap: 12 },
    cardIcon: { fontSize: 22, marginTop: 1 },
    cardTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: 700, fontFamily: theme.fonts.sans },
    cardSubtitle: { color: theme.colors.textMuted, fontSize: 12, fontFamily: theme.fonts.mono, marginTop: 3 },

    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: 600, fontFamily: theme.fonts.mono, letterSpacing: '0.08em' },
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
    fieldError: { color: theme.colors.danger, fontSize: 11, fontFamily: theme.fonts.mono, marginTop: 3 },
    hint: { color: theme.colors.textMuted, fontSize: 12, fontFamily: theme.fonts.mono },

    pairColumnLabels: { display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 },
    pairsContainer: { display: 'flex', flexDirection: 'column', gap: 10 },
    pairRow: { display: 'flex', alignItems: 'flex-start', gap: 8 },
    pairIndex: { color: theme.colors.textDim, fontSize: 11, fontFamily: theme.fonts.mono, paddingTop: 11, minWidth: 24 },
    equals: { color: theme.colors.textDim, fontFamily: theme.fonts.mono, fontSize: 16, paddingTop: 9, flexShrink: 0 },
    removeBtn: {
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        width: 32, height: 32,
        borderRadius: 6, fontSize: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
        marginTop: 1, flexShrink: 0,
    },
    addPairBtn: {
        background: 'rgba(99,102,241,0.06)',
        border: `1px dashed ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        borderRadius: 8, padding: '11px',
        fontSize: 13, fontFamily: theme.fonts.mono,
        cursor: 'pointer', width: '100%',
        transition: 'all 0.15s',
    },
    errorBanner: {
        background: 'rgba(239,68,68,0.1)',
        border: `1px solid rgba(239,68,68,0.3)`,
        color: theme.colors.danger,
        borderRadius: 8, padding: '12px 16px',
        fontSize: 13, fontFamily: theme.fonts.mono,
    },

    // Summary sidebar
    summaryCol: { position: 'sticky', top: 0 },
    summaryCard: {
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 14,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minHeight: 320,
    },
    summaryTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: 700, fontFamily: theme.fonts.sans },
    summaryItem: { display: 'flex', flexDirection: 'column', gap: 4 },
    summaryLabel: { color: theme.colors.textDim, fontSize: 11, fontFamily: theme.fonts.mono, letterSpacing: '0.06em' },
    summaryValue: { color: theme.colors.textSecondary, fontSize: 13, fontFamily: theme.fonts.mono, wordBreak: 'break-all' },
    summaryDivider: { height: 1, background: theme.colors.border },
    previewBlock: { display: 'flex', flexDirection: 'column', gap: 6 },
    previewLabel: { color: theme.colors.textDim, fontSize: 10, fontFamily: theme.fonts.mono, letterSpacing: '0.1em', marginBottom: 2 },
    previewRow: { display: 'flex', gap: 6, alignItems: 'baseline' },
    previewKey: { color: '#a5b4fc', fontSize: 12, fontFamily: theme.fonts.mono, fontWeight: 600 },
    previewSep: { color: theme.colors.textDim, fontFamily: theme.fonts.mono, fontSize: 12 },
    previewVal: { color: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.fonts.mono, wordBreak: 'break-all' },

    saveBtn: {
        background: theme.colors.primary,
        color: '#fff', border: 'none',
        borderRadius: 8, padding: '11px',
        fontSize: 14, fontWeight: 700,
        fontFamily: theme.fonts.sans,
        cursor: 'pointer', width: '100%',
        transition: 'background 0.15s',
    },
    cancelBtn: {
        background: 'transparent',
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textMuted,
        borderRadius: 8, padding: '10px',
        fontSize: 13, fontWeight: 600,
        fontFamily: theme.fonts.sans,
        cursor: 'pointer', width: '100%',
        transition: 'all 0.15s',
    },
};
