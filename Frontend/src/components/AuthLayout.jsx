import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, icon, children, footer }) {
  return (
    <div className="auth-page">
      <nav className="global-nav">
        <Link to="/" className="global-nav__brand">
          TalentSync
        </Link>
        <div className="global-nav__actions">
          {footer}
        </div>
      </nav>

      <div className="auth-page__body">
        <div className="auth-page__container animate-fade-in-up">
          <div className="auth-page__header">
            {icon && <div className="auth-page__icon">{icon}</div>}
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="card auth-card">{children}</div>
        </div>
      </div>
    </div>
  );
}
