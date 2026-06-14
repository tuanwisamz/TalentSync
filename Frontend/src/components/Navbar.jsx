import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';

export default function Navbar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isPublic = !role && !user;

  async function handleLogout() {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  }

  return (
    <nav className="global-nav">
      <Link
        to={isPublic ? '/' : role === 'talent' ? '/talent/dashboard' : '/employer/dashboard'}
        className="global-nav__brand"
      >
        TalentSync
      </Link>

      <div className="global-nav__actions">
        {isPublic ? (
          <>
            <Link to="/login" className="link-on-dark">Sign in</Link>
            <Link to="/register" className="btn-nav-cta">Get started</Link>
          </>
        ) : (
          <>
            {user?.email && (
              <span className="global-nav__email hidden sm:inline">{user.email}</span>
            )}
            <button
              id="navbar-logout"
              onClick={handleLogout}
              className="btn-utility"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
