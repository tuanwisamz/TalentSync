import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';
import AuthLayout from '../../components/AuthLayout';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('employer');
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  async function onSubmit({ email, password }) {
    setSubmitting(true);
    try {
      await registerUser(email, password, selectedRole);
      localStorage.setItem('tb_role', selectedRole);
      toast.success('Account created! Complete your profile to get started.');
      if (selectedRole === 'employer') navigate('/employer/profile');
      else navigate('/talent/profile');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join TalentSync today"
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#05070F]">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      }
      footer={<Link to="/login" className="link-on-dark">Sign in</Link>}
    >
      <div style={{ marginBottom: 28 }}>
        <p className="form-label" style={{ marginBottom: 12 }}>I am a…</p>
        <div className="role-toggle">
          {['employer', 'talent'].map((r) => (
            <button
              key={r}
              type="button"
              id={`role-${r}`}
              onClick={() => setSelectedRole(r)}
              className={`role-toggle__btn${selectedRole === r ? ' active' : ''}`}
            >
              {r === 'employer' ? '🏢 Employer' : '🎯 Talent'}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="you@company.com"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <span className="form-error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
          <input
            id="reg-confirm"
            type="password"
            className={`form-input ${errors.confirm ? 'error' : ''}`}
            placeholder="Repeat your password"
            autoComplete="new-password"
            {...register('confirm', {
              required: 'Please confirm your password',
              validate: (v) => v === getValues('password') || 'Passwords do not match',
            })}
          />
          {errors.confirm && <span className="form-error">{errors.confirm.message}</span>}
        </div>

        <button
          id="register-submit"
          type="submit"
          className="btn-primary"
          disabled={submitting}
          style={{ width: '100%', marginTop: 8 }}
        >
          {submitting ? 'Creating account…' : `Create ${selectedRole} account`}
        </button>
      </form>

      <div className="divider" style={{ margin: '24px 0' }} />
      <p className="auth-footer">
        Already have an account?{' '}
        <Link to="/login" className="link">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
