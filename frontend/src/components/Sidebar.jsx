// components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import '../styles/Sidebar.css'

const navItems = [
  {path: '/dashboard', label: 'Dashboard', icon: '📊' },
  {path: '/board', label: 'Job Board', icon: '📋' },
  {path: '/collection', label: 'Collection', icon: '🏆' },
  {path: '/challenges', label: 'Challenges', icon: '⚡' },
  {path: '/friends', label: 'Friends', icon: '👥' },
]

const bottomItems = [
  {path: '/profile', label: 'Profile', icon: '👤' },
  {path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  const renderLink = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
    >
      <span className="sidebar__icon">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  )

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">Job When?</div>
      <nav className="sidebar__nav">{navItems.map(renderLink)}</nav>
      <div className="sidebar__bottom">{bottomItems.map(renderLink)}</div>
    </aside>
  )
}