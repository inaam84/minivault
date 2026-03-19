import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { globalStyles, theme } from '../styles/theme';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import { publicFetch } from '../utils/apiClient';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const justVerified = location.state?.verified === true;

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
        if (!form.password) errs.password = 'Password is required';
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        setServerError('');
        try {
            const res = await publicFetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                const msg = json.error?.message || json.error || 'Invalid credentials';
                throw new Error(msg);
            }
            // User exists but hasn't verified OTP yet
            if (json.data?.token === null) {
                navigate('/verify-otp', { state: { email: json.data.email } });
                return;
            }
            // Fully authenticated
            localStorage.setItem('user', JSON.stringify(json.data));
            navigate('/dashboard');
        } catch (err) {
            setServerError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{globalStyles + `
                .submit-btn:hover:not(:disabled) { background: ${theme.colors.primaryHover} !important; }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
            `}</style>
            <div style={styles.page}>
                <AuthCard
                    title="Welcome back"
                    subtitle="Sign in to access your vault"
                >
                    <AuthInput
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={set('email')}
                        error={errors.email}
                    />
                    <AuthInput
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={set('password')}
                        error={errors.password}
                    />

                    {/* Forgot password */}
                    <div style={styles.forgotRow}>
                        <Link to="/forgot-password" style={styles.link}>
                            Forgot password?
                        </Link>
                    </div>

                    {/* Verified success banner */}
                    {justVerified && (
                        <div style={styles.successBanner}>
                            ✅ Email verified! You can now sign in.
                        </div>
                    )}

                    {/* Server error */}
                    {serverError && (
                        <div style={styles.errorBanner}>
                            ⚠️ {serverError}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                        style={styles.submitBtn}
                    >
                        {loading ? 'Signing in…' : 'Sign in →'}
                    </button>

                    {/* Divider */}
                    <div style={styles.divider}>
                        <div style={styles.dividerLine} />
                        <span style={styles.dividerText}>or</span>
                        <div style={styles.dividerLine} />
                    </div>

                    {/* Signup link */}
                    <p style={styles.switchText}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={styles.link}>Create one</Link>
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
        backgroundImage: `radial-gradient(ellipse at 60% 20%, rgba(99,102,241,0.08) 0%, transparent 60%)`,
    },
    forgotRow: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: -8,
    },
    link: {
        color: theme.colors.primary,
        textDecoration: 'none',
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        fontWeight: 500,
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
    dividerLine: {
        flex: 1,
        height: 1,
        background: theme.colors.border,
    },
    dividerText: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
    },
    switchText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
    },
    successBanner: {
        background: 'rgba(34,197,94,0.1)',
        border: '1px solid rgba(34,197,94,0.3)',
        color: theme.colors.success,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
        fontFamily: theme.fonts.mono,
    },
};
