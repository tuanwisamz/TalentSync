import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const navItems = [
  { to: '/talent/dashboard',    label: 'Dashboard',     icon: '◼' },
  { to: '/talent/profile',      label: 'My Profile',    icon: '👤' },
  { to: '/talent/jobs',         label: 'Browse Jobs',   icon: '🔍' },
  { to: '/talent/applications', label: 'Applications',  icon: '📋' },
  { to: '/talent/messages',     label: 'Messages',      icon: '💬' },
];

export default function TalentLayout() {
  return (
    <div className="min-h-screen bg-parchment">
      <Navbar role="talent" />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar__label">Talent</div>
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
