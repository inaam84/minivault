import { theme } from '../../styles/theme';

export default function StatsGrid({ groups = [] }) {
    const totalSecrets = groups.reduce((sum, g) => sum + (g.secrets?.length || 0), 0);
    const topLevelCount = new Set(groups.map(g => g.path.split('/')[0])).size;
    const lastUpdated = groups.length
        ? new Date(Math.max(...groups.map(g => new Date(g.updatedAt)))).toLocaleDateString()
        : '—';

    const stats = [
        { label: 'Total Secrets', value: totalSecrets, icon: '🗄️', color: theme.colors.info },
        { label: 'Secret Groups', value: groups.length, icon: '📁', color: '#8b5cf6' },
        { label: 'Top-level Paths', value: topLevelCount, icon: '🗂️', color: theme.colors.warning },
        { label: 'Last Updated', value: lastUpdated, icon: '🕐', color: theme.colors.success },
    ];

    return (
        <>
            <style>{`
                .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
                }
            `}</style>
            <div style={styles.grid}>
                {stats.map((s, i) => (
                    <div
                        key={s.label}
                        className="stat-card"
                        style={{
                            ...styles.card,
                            borderTop: `2px solid ${s.color}`,
                            animationDelay: `${i * 80}ms`,
                        }}
                    >
                        <span style={{ fontSize: 28 }}>{s.icon}</span>
                        <div>
                            <p style={{ ...styles.value, color: s.color }}>{s.value}</p>
                            <p style={styles.label}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28,
    },
    card: {
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 12,
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        animation: 'fadeSlideIn 0.4s ease both',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    value: {
        fontSize: 26,
        fontWeight: 800,
        lineHeight: 1,
        fontFamily: theme.fonts.sans,
    },
    label: {
        color: theme.colors.textMuted,
        fontSize: 12,
        marginTop: 4,
        fontFamily: theme.fonts.mono,
    },
};
