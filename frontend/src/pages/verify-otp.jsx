import { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { globalStyles, theme } from '../styles/theme';
import AuthCard from '../components/auth/AuthCard';

const OTP_LENGTH = 6;

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resent, setResent] = useState(false);
    const [resending, setResending] = useState(false);
    const refs = useRef([]);

    const otp = digits.join('');
    const isComplete = otp.length === OTP_LENGTH && digits.every(d => d !== '');

    const handleChange = (index, value) => {
        // Allow only single digit
        const digit = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = digit;
        setDigits(next);
        setError('');

        // Auto-advance to next box
        if (digit && index < OTP_LENGTH - 1) {
            refs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (digits[index]) {
                // Clear current
                const next = [...digits];
                next[index] = '';
                setDigits(next);
            } else if (index > 0) {
                // Move back
                refs.current[index - 1]?.focus();
            }
        }
        if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill('');
        pasted.split('').forEach((ch, i) => { next[i] = ch; });
        setDigits(next);
        // Focus last filled or last box
        const lastIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        refs.current[lastIndex]?.focus();
    };

    const handleVerify = async () => {
        if (!isComplete) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error?.message || 'Invalid or expired OTP');
            }
            // Verified — go to login
            navigate('/login', { state: { verified: true } });
        } catch (err) {
            setError(err.message);
            // Shake effect — clear after reset
            setDigits(Array(OTP_LENGTH).fill(''));
            setTimeout(() => refs.current[0]?.focus(), 50);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        setResent(false);
        try {
            await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setResent(true);
            setDigits(Array(OTP_LENGTH).fill(''));
            refs.current[0]?.focus();
        } catch {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <>
            <style>{globalStyles + `
                .otp-input:focus {
                    border-color: ${theme.colors.primary} !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
                    color: #fff !important;
                }
                .otp-input.filled {
                    border-color: ${theme.colors.primary} !important;
                    color: #a5b4fc !important;
                }
                .verify-btn:hover:not(:disabled) { background: ${theme.colors.primaryHover} !important; }
                .verify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .resend-btn:hover { color: ${theme.colors.primary} !important; }
                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    20%     { transform: translateX(-6px); }
                    40%     { transform: translateX(6px); }
                    60%     { transform: translateX(-4px); }
                    80%     { transform: translateX(4px); }
                }
                .shake { animation: shake 0.35s ease; }
            `}</style>

            <div style={styles.page}>
                <AuthCard
                    title="Check your email"
                    subtitle={
                        email
                            ? `We sent a 6-digit code to ${email}`
                            : 'We sent a 6-digit verification code to your email'
                    }
                >
                    {/* OTP boxes */}
                    <div
                        style={styles.otpRow}
                        className={error ? 'shake' : ''}
                    >
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => refs.current[i] = el}
                                className={`otp-input${digit ? ' filled' : ''}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                onPaste={handlePaste}
                                style={styles.otpInput}
                                autoFocus={i === 0}
                            />
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={styles.errorBanner}>⚠️ {error}</div>
                    )}

                    {/* Resent confirmation */}
                    {resent && !error && (
                        <div style={styles.successBanner}>
                            ✅ New code sent to {email}
                        </div>
                    )}

                    {/* Verify button */}
                    <button
                        className="verify-btn"
                        onClick={handleVerify}
                        disabled={!isComplete || loading}
                        style={styles.submitBtn}
                    >
                        {loading ? 'Verifying…' : 'Verify email →'}
                    </button>

                    {/* Resend */}
                    <p style={styles.resendRow}>
                        Didn't receive it?{' '}
                        <button
                            className="resend-btn"
                            onClick={handleResend}
                            disabled={resending}
                            style={styles.resendBtn}
                        >
                            {resending ? 'Sending…' : 'Resend code'}
                        </button>
                    </p>

                    {/* Back to signup */}
                    <p style={styles.backRow}>
                        <Link to="/signup" style={styles.link}>← Back to signup</Link>
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
        backgroundImage: `radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.1) 0%, transparent 60%)`,
    },
    otpRow: {
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
        margin: '8px 0 4px',
    },
    otpInput: {
        width: 48,
        height: 56,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 700,
        fontFamily: theme.fonts.mono,
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: 10,
        color: theme.colors.textSecondary,
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, color 0.15s',
        caretColor: theme.colors.primary,
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
    successBanner: {
        background: 'rgba(34,197,94,0.1)',
        border: '1px solid rgba(34,197,94,0.3)',
        color: theme.colors.success,
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
    resendRow: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
    },
    resendBtn: {
        background: 'none',
        border: 'none',
        color: theme.colors.textSecondary,
        fontSize: 13,
        fontFamily: theme.fonts.mono,
        cursor: 'pointer',
        textDecoration: 'underline',
        padding: 0,
        transition: 'color 0.15s',
    },
    backRow: {
        textAlign: 'center',
    },
    link: {
        color: theme.colors.textMuted,
        textDecoration: 'none',
        fontSize: 13,
        fontFamily: theme.fonts.mono,
    },
};
