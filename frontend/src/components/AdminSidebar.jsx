// components/AdminSidebar.jsx
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/AdminSidebar.css'

const navItems = [
  { path: '/admin/challenges', label: 'Review Challenges', icon: '📋' },
  { path: '/admin/users', label: 'Review Users', icon: '👥' },
]

export default function AdminSidebar() {
  const { user } = useAuth()

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A'

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">Job When?</div>
      <nav className="sidebar__nav">
        {navItems.map((item) => (
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
        ))}
      </nav>
      <div className="sidebar__bottom sidebar__admin-footer">
        <span className="sidebar__admin-label">
          {user?.fullName?.split(' ')[0] ?? 'Admin'}
        </span>
        <div className="sidebar__avatar">{initials}</div>
      </div>
    </aside>
  )
}