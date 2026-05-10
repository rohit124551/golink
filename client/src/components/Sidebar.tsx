import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Link2, BarChart2, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.tsx'
import { ThemeToggle } from './ThemeProvider.tsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/links', icon: Link2, label: 'Links' },
  { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-go">go.</span>
        <span className="sidebar__logo-domain">rohitkumarranjan.in</span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <span className="sidebar__email">{session?.user?.email}</span>
        <div className="sidebar__actions">
          <ThemeToggle />
          <button
            className="btn btn-ghost btn-icon sidebar__logout"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background-color: var(--bg-surface);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          z-index: 200;
        }
        .sidebar__logo {
          padding: 16px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: baseline;
          gap: 2px;
          height: 52px;
        }
        .sidebar__logo-go {
          font-family: var(--font-mono);
          font-size: 16px;
          font-weight: 600;
          color: var(--accent-text);
        }
        .sidebar__logo-domain {
          font-size: 13px;
          color: var(--text-tertiary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sidebar__nav {
          flex: 1;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .sidebar__nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--transition);
          border-left: 2px solid transparent;
          text-decoration: none;
        }
        .sidebar__nav-item:hover {
          color: var(--text-primary);
          background-color: var(--bg-elevated);
        }
        .sidebar__nav-item.active {
          color: var(--text-primary);
          background-color: var(--bg-elevated);
          border-left-color: var(--accent);
        }
        .sidebar__bottom {
          padding: 12px 16px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sidebar__email {
          font-size: 11px;
          color: var(--text-tertiary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sidebar__actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .sidebar__logout:hover {
          color: var(--danger-text) !important;
        }

        /* Mobile: bottom tab bar */
        @media (max-width: 768px) {
          .sidebar {
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 56px;
            flex-direction: row;
            align-items: center;
            border-right: none;
            border-top: 1px solid var(--border-subtle);
          }
          .sidebar__logo { display: none; }
          .sidebar__nav {
            flex-direction: row;
            flex: 1;
            padding: 0;
            gap: 0;
            justify-content: space-around;
          }
          .sidebar__nav-item {
            flex-direction: column;
            gap: 2px;
            font-size: 10px;
            padding: 6px 8px;
            border-left: none;
            border-top: 2px solid transparent;
            border-radius: 0;
            min-width: 56px;
            justify-content: center;
            align-items: center;
          }
          .sidebar__nav-item.active {
            border-left-color: transparent;
            border-top-color: var(--accent);
            background-color: transparent;
          }
          .sidebar__bottom { display: none; }
        }
      `}</style>
    </aside>
  )
}
