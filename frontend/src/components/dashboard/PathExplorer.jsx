import { theme } from '../../styles/theme';
import { getFolders, getGroups } from '../../utils/secretsTree';

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export default function PathExplorer({ node, currentPath = [], onNavigate, onSelectGroup, onNewSecret }) {
    const folders = getFolders(node);
    const groups = getGroups(node);
    const isEmpty = folders.length === 0 && groups.length === 0;

    return (
        <>
            <style>{`
                .path-row:hover { background: rgba(99,102,241,0.06) !important; }
                .path-row { transition: background 0.15s; cursor: pointer; }
                .new-btn:hover { background: ${theme.colors.primaryHover} !important; }
            `}</style>

            <div style={styles.panel}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>
                            {currentPath.length === 0 ? 'Secrets' : currentPath.join(' / ')}
                        </h2>
                        {currentPath.length > 0 && (
                            <p style={styles.subtitle}>
                                {folders.length} folder{folders.length !== 1 ? 's' : ''}
                                {groups.length > 0 && ` · ${groups.reduce((s, g) => s + g.secrets.length, 0)} secrets`}
                            </p>
                        )}
                    </div>
                    <button className="new-btn" style={styles.newBtn} onClick={onNewSecret}>+ New Secret</button>
                </div>

                {/* Breadcrumb */}
                {currentPath.length > 0 && (
                    <div style={styles.breadcrumb}>
                        <span
                            style={styles.breadcrumbLink}
                            onClick={() => onNavigate([])}
                        >
                            vault
                        </span>
                        {currentPath.map((seg, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={styles.breadcrumbSep}>/</span>
                                <span
                                    style={{
                                        ...styles.breadcrumbLink,
                                        ...(i === currentPath.length - 1 ? styles.breadcrumbCurrent : {}),
                                    }}
                                    onClick={() => i < currentPath.length - 1 && onNavigate(currentPath.slice(0, i + 1))}
                                >
                                    {seg}
                                </span>
                            </span>
                        ))}
                    </div>
                )}

                {/* Column headers */}
                <div style={styles.tableHeader}>
                    <span style={{ flex: 1 }}>NAME</span>
                    <span style={{ flex: 1 }}>TYPE</span>
                    <span style={{ flex: 1 }}>UPDATED</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>SECRETS</span>
                </div>

                {/* Folders */}
                {folders.map((folder, i) => {
                    const child = node[folder];
                    const secretCount = countDeep(child);
                    const isLast = i === folders.length - 1 && groups.length === 0;
                    return (
                        <div
                            key={folder}
                            className="path-row"
                            onClick={() => onNavigate([...currentPath, folder])}
                            style={{
                                ...styles.row,
                                borderBottom: !isLast ? `1px solid ${theme.colors.bg}` : 'none',
                            }}
                        >
                            <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={styles.folderIcon}>📁</span>
                                <span style={styles.name}>{folder}</span>
                            </span>
                            <span style={{ flex: 1 }}>
                                <span style={styles.typeBadge}>folder</span>
                            </span>
                            <span style={styles.meta}>—</span>
                            <span style={{ ...styles.meta, textAlign: 'right' }}>
                                <span style={styles.countBadge}>{secretCount}</span>
                            </span>
                        </div>
                    );
                })}

                {/* Secret groups (leaf nodes) */}
                {groups.map((group, i) => (
                    <div
                        key={group.id}
                        className="path-row"
                        onClick={() => onSelectGroup(group)}
                        style={{
                            ...styles.row,
                            borderBottom: i < groups.length - 1 ? `1px solid ${theme.colors.bg}` : 'none',
                        }}
                    >
                        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={styles.folderIcon}>🔐</span>
                            <span style={styles.name}>{group.path.split('/').pop()}</span>
                        </span>
                        <span style={{ flex: 1 }}>
                            <span style={{ ...styles.typeBadge, background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,0.3)' }}>
                                secrets
                            </span>
                        </span>
                        <span style={styles.meta}>{formatDate(group.updatedAt)}</span>
                        <span style={{ ...styles.meta, textAlign: 'right' }}>
                            <span style={styles.countBadge}>{group.secrets.length}</span>
                        </span>
                    </div>
                ))}

                {isEmpty && (
                    <div style={styles.empty}>This path is empty</div>
                )}
            </div>
        </>
    );
}

// Recursively count all secrets under a tree node
function countDeep(node) {
    let count = (node.__groups || []).reduce((s, g) => s + g.secrets.length, 0);
    for (const key of Object.keys(node.__children || {})) {
        count += countDeep(node.__children[key]);
    }
    return count;
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
    subtitle: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
        marginTop: 4,
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
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '12px 24px',
        borderBottom: `1px solid ${theme.colors.border}`,
        background: theme.colors.bg,
    },
    breadcrumbLink: {
        color: theme.colors.primary,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        cursor: 'pointer',
        textDecoration: 'none',
    },
    breadcrumbSep: {
        color: theme.colors.textDim,
        fontFamily: theme.fonts.mono,
        fontSize: 13,
    },
    breadcrumbCurrent: {
        color: theme.colors.textSecondary,
        cursor: 'default',
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
    },
    folderIcon: { fontSize: 18 },
    name: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: theme.fonts.mono,
    },
    typeBadge: {
        fontSize: 11,
        padding: '3px 8px',
        borderRadius: 4,
        fontWeight: 600,
        fontFamily: theme.fonts.mono,
        border: '1px solid',
        background: 'rgba(100,116,139,0.12)',
        color: '#64748b',
        borderColor: 'rgba(100,116,139,0.3)',
    },
    meta: {
        flex: 1,
        color: theme.colors.textMuted,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
    },
    countBadge: {
        background: theme.colors.primaryMuted,
        color: '#a5b4fc',
        fontSize: 12,
        padding: '2px 10px',
        borderRadius: 20,
        fontFamily: theme.fonts.mono,
        fontWeight: 600,
    },
    empty: {
        padding: '48px 0',
        textAlign: 'center',
        color: theme.colors.textDim,
        fontFamily: theme.fonts.mono,
    },
};
