import { useState } from 'react';
import { theme } from '../../styles/theme';

export default function AuthInput({ label, type = 'text', placeholder, value, onChange, error }) {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div style={styles.wrapper}>
            {label && <label style={styles.label}>{label}</label>}
            <div style={{
                ...styles.inputWrap,
                borderColor: error
                    ? theme.colors.danger
                    : focused
                        ? theme.colors.primary
                        : theme.colors.borderLight,
                boxShadow: focused ? `0 0 0 3px rgba(99,102,241,0.12)` : 'none',
            }}>
                <input
                    type={isPassword && showPassword ? 'text' : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={styles.input}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        style={styles.toggle}
                    >
                        {showPassword ? '🙈' : '👁'}
                    </button>
                )}
            </div>
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
}

const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
    },
    inputWrap: {
        display: 'flex',
        alignItems: 'center',
        background: '#080c14',
        border: '1px solid',
        borderRadius: 8,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#e2e8f0',
        padding: '11px 14px',
        fontSize: 14,
        fontFamily: "'IBM Plex Mono', monospace",
    },
    toggle: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0 12px',
        fontSize: 14,
        color: '#475569',
    },
    error: {
        color: '#ef4444',
        fontSize: 12,
        fontFamily: "'IBM Plex Mono', monospace",
        marginTop: 2,
    },
};
