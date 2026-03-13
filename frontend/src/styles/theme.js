export const theme = {
    colors: {
        bg: '#080c14',
        surface: '#0a0f1a',
        border: '#0f1a2e',
        borderLight: '#1e2d45',
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        primaryMuted: 'rgba(99,102,241,0.12)',
        textPrimary: '#e2e8f0',
        textSecondary: '#94a3b8',
        textMuted: '#475569',
        textDim: '#334155',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1',
    },
    fonts: {
        sans: "'Syne', sans-serif",
        mono: "'IBM Plex Mono', monospace",
    },
    envColors: {
        production: '#ef4444',
        staging: '#f59e0b',
        development: '#22c55e',
    },
    typeIcons: {
        credential: '🔑',
        password: '🔒',
        api_key: '⚡',
        token: '🎟️',
    },
};

export const googleFonts =
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap";

export const globalStyles = `
    @import url('${googleFonts}');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${theme.colors.bg}; font-family: ${theme.fonts.sans}; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0f1623; }
    ::-webkit-scrollbar-thumb { background: #1e2d45; border-radius: 3px; }
    @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
    }
`;
