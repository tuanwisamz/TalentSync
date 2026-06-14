import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';
import AuthLayout from '../../components/AuthLayout';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  async function onSubmit({ email, password }) {
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      setTimeout(() => {
        const savedRole = localStorage.getItem('tb_role');
        if (savedRole === 'talent') navigate('/talent/dashboard');
        else navigate('/employer/dashboard');
      }, 300);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your TalentSync account"
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#05070F]">
          <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      }
      footer={<Link to="/register" className="link-on-dark">Create account</Link>}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="form-input"
            placeholder="you@company.com"
            autoComplete="email"
            {...register('email')}
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
            >Forgot password?</Link>
          </div>
          <input
            id="login-password"
            type="password"
            className="form-input"
            placeholder="Your password"
            autoComplete="current-password"
            {...register('password')}
          />
        </div>

        <button
          id="login-submit"
          type="submit"
          className="btn-primary"
          disabled={submitting}
          style={{ width: '100%', marginTop: 8 }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="divider" style={{ margin: '24px 0' }} />
      <p className="auth-footer">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="link">Create one</Link>
      </p>
    </AuthLayout>
  );
}
