import { useState } from 'react';
import { theme } from '../../styles/theme';
import SecretRow from './SecretRow';

export default function SecretsPanel({ secrets = [] }) {
    const [revealed, setRevealed] = useState({});
    const [copied, setCopied] = useState(null);
    const [search, setSearch] = useState('');
    const [activeEnv, setActiveEnv] = useState('all');

    const toggleReveal = (id) => setRevealed(r => ({ ...r, [id]: !r[id] }));

    const handleCopy = (id) => {
        navigator.clipboard.writeText(`secret_value_${id}`).catch(() => {});
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    };

    const filtered = secrets.filter(s => {
        const matchEnv = activeEnv === 'all' || s.env === activeEnv;
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
        return matchEnv && matchSearch;
    });

    return (
        <>
            <style>{`
                .new-btn:hover { background: ${theme.colors.primaryHover} !important; }
                .search-input:focus { border-color: ${theme.colors.primary} !important; }
            `}</style>
            <div style={styles.panel}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>Secrets</h2>
                    <button className="new-btn" style={styles.newBtn}>+ New Secret</button>
                </div>

                {/* Filters */}
                <div style={styles.filters}>
                    <input
                        className="search-input"
                        placeholder="Search secrets…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={styles.searchInput}
                    />
                    <div style={styles.pills}>
                        {['all', 'production', 'staging', 'development'].map(env => (
                            <span
                                key={env}
                                onClick={() => setActiveEnv(env)}
                                style={{
                                    ...styles.pill,
                                    background: activeEnv === env ? theme.colors.primary : '#0f1623',
                                    color: activeEnv === env ? '#fff' : theme.colors.textMuted,
                                    borderColor: activeEnv === env ? theme.colors.primary : theme.colors.borderLight,
                                }}
                            >
                                {env === 'all' ? 'All' : env}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Table Header */}
                <div style={styles.tableHeader}>
                    <span style={{ flex: 3 }}>NAME</span>
                    <span style={{ flex: 2 }}>VALUE</span>
                    <span style={{ flex: 1 }}>ENV</span>
                    <span style={{ flex: 1 }}>UPDATED</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>ACTIONS</span>
                </div>

                {/* Rows */}
                {filtered.map((s, i) => (
                    <SecretRow
                        key={s.id}
                        secret={s}
                        revealed={!!revealed[s.id]}
                        copied={copied === s.id}
                        onReveal={toggleReveal}
                        onCopy={handleCopy}
                        isLast={i === filtered.length - 1}
                    />
                ))}

                {filtered.length === 0 && (
                    <div style={styles.empty}>No secrets found</div>
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
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: `1px solid ${theme.colors.border}`,
    },
    title: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: 700,
        fontFamily: theme.fonts.sans,
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
    filters: {
        display: 'flex',
        gap: 16,
        padding: '16px 24px',
        borderBottom: `1px solid ${theme.colors.border}`,
        alignItems: 'center',
    },
    searchInput: {
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.borderLight}`,
        color: theme.colors.textSecondary,
        padding: '8px 14px',
        borderRadius: 8,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        outline: 'none',
        width: 240,
        transition: 'border-color 0.15s',
    },
    pills: { display: 'flex', gap: 8 },
    pill: {
        padding: '5px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        border: '1px solid',
        fontFamily: theme.fonts.mono,
        cursor: 'pointer',
        transition: 'all 0.15s',
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
    empty: {
        padding: '48px 0',
        textAlign: 'center',
        color: theme.colors.textDim,
        fontFamily: theme.fonts.mono,
    },
};
