import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const navItems = [
  { to: '/employer/dashboard',     label: 'Dashboard',       icon: '◼' },
  { to: '/employer/profile',       label: 'Company Profile', icon: '🏢' },
  { to: '/employer/post-job',      label: 'Post a Job',      icon: '＋' },
  { to: '/employer/talent-search', label: 'Find Talent',     icon: '🔍' },
  { to: '/employer/applications',  label: 'Applications',    icon: '📋' },
  { to: '/employer/messages',      label: 'Messages',        icon: '💬' },
];

export default function EmployerLayout() {
  return (
    <div className="min-h-screen bg-parchment">
      <Navbar role="employer" />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar__label">Employer</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="sidebar-link__icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </aside>

        <main className="main-content page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
