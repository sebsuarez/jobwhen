// components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import '../styles/Sidebar.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/board', label: 'Job Board', icon: '📋' },
  { path: '/collection', label: 'Collection', icon: '🏆' },
  { path: '/challenges', label: 'Challenges', icon: '⚡' },
  { path: '/friends', label: 'Friends', icon: '👥' },
]

const bottomItems = [
  { path: '/profile', label: 'Profile', icon: '👤' },
]

export default function Sidebar() {
  const renderLink = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
      }
    >
      <span className="sidebar__icon">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  )

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar__logo">Job When?</div>
        <nav className="sidebar__nav">{navItems.map(renderLink)}</nav>
        <div className="sidebar__bottom">{bottomItems.map(renderLink)}</div>
      </aside>

      <div className="mobile-sidebar-top">
        <NavLink to="/profile" className="mobile-top__icon-link">
          <span className="mobile-top__icon">👤</span>
        </NavLink>

        <div className="mobile-sidebar__logo">Job When?</div>
        
      </div>

      <nav className="mobile-sidebar-bottom">
        <NavLink to="/dashboard" className="mobile-sidebar__link">
          <span className="mobile-sidebar__icon">📊</span>
          <span className="mobile-sidebar__label">Dashboard</span>
        </NavLink>

        <NavLink to="/board" className="mobile-sidebar__link">
          <span className="mobile-sidebar__icon">📋</span>
          <span className="mobile-sidebar__label">Job Board</span>
        </NavLink>

        <NavLink to="/collection" className="mobile-sidebar__link">
          <span className="mobile-sidebar__icon">🏆</span>
          <span className="mobile-sidebar__label">Collection</span>
        </NavLink>

        <NavLink to="/challenges" className="mobile-sidebar__link">
          <span className="mobile-sidebar__icon">⚡</span>
          <span className="mobile-sidebar__label">Challenges</span>
        </NavLink>

        <NavLink to="/friends" className="mobile-sidebar__link">
          <span className="mobile-sidebar__icon">👥</span>
          <span className="mobile-sidebar__label">Friends</span>
        </NavLink>
      </nav>
    </>
  )
}