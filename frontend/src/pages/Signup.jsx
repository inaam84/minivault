import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { globalStyles, theme } from '../styles/theme';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';

export default function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
        if (!form.confirm) errs.confirm = 'Please confirm your password';
        else if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        setServerError('');
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.name, email: form.email, password: form.password, confirmPassword: form.confirm }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                const msg = json.error?.message || json.error || json.data?.message || 'Signup failed';
                throw new Error(msg);
            }
            // OTP sent — pass email to verify page
            navigate('/verify-otp', { state: { email: form.email } });
        } catch (err) {
            setServerError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const strength = (() => {
        const p = form.password;
        if (!p) return null;
        if (p.length < 6) return { label: 'Weak', color: theme.colors.danger, width: '25%' };
        if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: theme.colors.warning, width: '55%' };
        return { label: 'Strong', color: theme.colors.success, width: '100%' };
    })();

    return (
        <>
            <style>{globalStyles + `
                .submit-btn:hover:not(:disabled) { background: ${theme.colors.primaryHover} !important; }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
            `}</style>
            <div style={styles.page}>
                <AuthCard
                    title="Create account"
                    subtitle="Start managing your secrets securely"
                >
                    <AuthInput
                        label="Full Name"
                        type="text"
                        placeholder="Alex Johnson"
                        value={form.name}
                        onChange={set('name')}
                        error={errors.name}
                    />
                    <AuthInput
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={set('email')}
                        error={errors.email}
                    />
                    <div>
                        <AuthInput
                            label="Password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={form.password}
                            onChange={set('password')}
                            error={errors.password}
                        />
                        {/* Password strength bar */}
                        {strength && (
                            <div style={styles.strengthWrap}>
                                <div style={styles.strengthTrack}>
                                    <div style={{ ...styles.strengthBar, width: strength.width, background: strength.color }} />
                                </div>
                                <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</span>
                            </div>
                        )}
                    </div>
                    <AuthInput
                        label="Confirm Password"
                        type="password"
                        placeholder="Repeat your password"
                        value={form.confirm}
                        onChange={set('confirm')}
                        error={errors.confirm}
                    />

                    {/* Server error */}
                    {serverError && (
                        <div style={styles.errorBanner}>⚠️ {serverError}</div>
                    )}

                    {/* Submit */}
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                        style={styles.submitBtn}
                    >
                        {loading ? 'Creating account…' : 'Create account →'}
                    </button>

                    {/* Divider */}
                    <div style={styles.divider}>
                        <div style={styles.dividerLine} />
                        <span style={styles.dividerText}>or</span>
                        <div style={styles.dividerLine} />
                    </div>

                    {/* Login link */}
                    <p style={styles.switchText}>
                        Already have an account?{' '}
                        <Link to="/login" style={styles.link}>Sign in</Link>
                    </p>
                </AuthCard>
            </div>
        </>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: theme.colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundImage: `radial-gradient(ellipse at 40% 80%, rgba(99,102,241,0.08) 0%, transparent 60%)`,
    },
    strengthWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
    },
    strengthTrack: {
        flex: 1,
        height: 3,
        background: theme.colors.border,
        borderRadius: 99,
        overflow: 'hidden',
    },
    strengthBar: {
        height: '100%',
        borderRadius: 99,
        transition: 'width 0.3s, background 0.3s',
    },
    strengthLabel: {
        fontSize: 11,
        fontFamily: theme.fonts.mono,
        fontWeight: 600,
        minWidth: 40,
    },
    errorBanner: {
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: theme.colors.danger,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
        fontFamily: theme.fonts.mono,
    },
    submitBtn: {
        background: theme.colors.primary,
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '12px',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: theme.fonts.sans,
        cursor: 'pointer',
        width: '100%',
        transition: 'background 0.15s',
        marginTop: 4,
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '4px 0',
    },
    dividerLine: { flex: 1, height: 1, background: theme.colors.border },
    dividerText: { color: theme.colors.textMuted, fontSize: 12, fontFamily: theme.fonts.mono },
    switchText: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 13, fontFamily: theme.fonts.mono },
    link: { color: theme.colors.primary, textDecoration: 'none', fontSize: 13, fontFamily: theme.fonts.mono, fontWeight: 500 },
};
