import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import AuthLayout from '../../components/AuthLayout';
import toast from 'react-hot-toast';

// Password strength helper
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_CLASSES = ['', 'weak', 'fair', 'good', 'strong'];

function PasswordStrengthBar({ password }) {
  const strength = getStrength(password);
  const label = password ? STRENGTH_LABELS[strength] : '';
  return (
    <div className="password-strength">
      <div className="password-strength__bar">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`password-strength__seg ${i <= strength && password ? STRENGTH_CLASSES[strength] : ''}`}
          />
        ))}
      </div>
      {label && <p className="password-strength__label">{label}</p>}
    </div>
  );
}

function PasswordRules({ password }) {
  const rules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];
  return (
    <div className="password-rules">
      {rules.map((r) => (
        <div key={r.label} className={`password-rule ${r.met ? 'met' : ''}`}>
          <div className="password-rule__icon">{r.met ? '✓' : ''}</div>
          {r.label}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Email form ──
function Step1({ onSent }) {
  const { supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password`,
      });
      if (err) throw err;
      onSent(email);
    } catch (err) {
      setError(err.message?.includes('not found') ? 'No account found with this email' : (err.message || 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="fp-email">Email address</label>
        <input
          id="fp-email"
          type="email"
          className={`form-input ${error ? 'error' : ''}`}
          placeholder="your@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
        />
        {error && <span className="form-error">{error}</span>}
      </div>

      <button
        id="fp-send-btn"
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{ width: '100%', marginTop: 8 }}
      >
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <p style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/login" className="link" style={{ fontSize: 14 }}>
          ← Back to sign in
        </Link>
      </p>
    </form>
  );
}

// ── Step 2: Confirmation ──
function Step2({ email, onResend }) {
  const [resending, setResending] = useState(false);
  const { supabase } = useAuth();

  async function handleResend() {
    setResending(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password`,
      });
      toast.success('Reset link resent!');
    } catch {
      toast.error('Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="confirm-icon">✉️</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10, fontFamily: 'var(--font-display)' }}>
        Check your inbox
      </h2>
      <p className="t-caption" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 8, lineHeight: 1.6 }}>
        We've sent a reset link to{' '}
        <strong style={{ color: '#fff' }}>{email}</strong>.
        The link expires in 15 minutes.
      </p>
      <p style={{ marginTop: 24, fontSize: 14 }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 14, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          {resending ? 'Resending…' : 'Resend link'}
        </button>
      </p>
      <p style={{ marginTop: 16 }}>
        <Link to="/login" className="link" style={{ fontSize: 14 }}>← Back to sign in</Link>
      </p>
    </div>
  );
}

// ── Step 3: New password form ──
function Step3() {
  const { supabase } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (getStrength(password) < 2) { setError('Please choose a stronger password'); return; }
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      toast.success('Password updated! You can now sign in.');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="confirm-icon">✅</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10, fontFamily: 'var(--font-display)' }}>
          Password updated!
        </h2>
        <p className="t-caption" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
          Your password has been changed successfully.
        </p>
        <Link to="/login" className="btn-primary" style={{ display: 'inline-block' }}>
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="fp-newpw">New password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="fp-newpw"
            type={showPw ? 'text' : 'password'}
            className={`form-input ${error ? 'error' : ''}`}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            style={{ paddingRight: 44 }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 18, padding: 0 }}
          >
            {showPw ? '🙈' : '👁'}
          </button>
        </div>
        {password && <PasswordStrengthBar password={password} />}
        {password && <PasswordRules password={password} />}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="fp-confirmpw">Confirm new password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="fp-confirmpw"
            type={showConfirm ? 'text' : 'password'}
            className={`form-input ${error ? 'error' : ''}`}
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(''); }}
            style={{ paddingRight: 44 }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 18, padding: 0 }}
          >
            {showConfirm ? '🙈' : '👁'}
          </button>
        </div>
        {error && <span className="form-error">{error}</span>}
      </div>

      <button
        id="fp-update-btn"
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{ width: '100%', marginTop: 8 }}
      >
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}

// ── Main component ──
export default function ForgotPassword() {
  // Detect if arrived via reset email link (Supabase sets #access_token in URL hash)
  const isResetFlow = window.location.hash.includes('access_token');

  const [step, setStep] = useState(isResetFlow ? 3 : 1);
  const [sentEmail, setSentEmail] = useState('');

  function handleSent(email) {
    setSentEmail(email);
    setStep(2);
  }

  const TITLES = {
    1: { title: 'Reset your password', subtitle: "Enter the email address on your account. We'll send a reset link." },
    2: { title: 'Email sent', subtitle: 'Check your inbox for the reset link.' },
    3: { title: 'Set a new password', subtitle: 'Choose a strong password for your account.' },
  };

  return (
    <AuthLayout
      title={TITLES[step].title}
      subtitle={TITLES[step].subtitle}
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#05070F]">
          <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M2 9l10 6 10-6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      }
      footer={<Link to="/login" className="link-on-dark">Back to sign in</Link>}
    >
      {step === 1 && <Step1 onSent={handleSent} />}
      {step === 2 && <Step2 email={sentEmail} onResend={() => setStep(1)} />}
      {step === 3 && <Step3 />}
    </AuthLayout>
  );
}
