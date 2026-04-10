// components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/Sidebar.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/board', label: 'Job Board', icon: '📋' },
  { path: '/collection', label: 'Leaderboards', icon: '🏆' },
  { path: '/challenges', label: 'Challenges', icon: '⚡' },
  { path: '/friends', label: 'Friends', icon: '👥' },
]

const bottomItems = [
  { path: '/profile', label: 'Profile', icon: '👤' },
]

export default function Sidebar() {
  const { user } = useAuth()

  const currentLevel = user?.currentLevel ?? 1
  const currentXp = user?.currentXp ?? 0
  const xpPerLevel = 60
  const xpIntoLevel = currentXp % xpPerLevel
  const progressPercent = Math.min((xpIntoLevel / xpPerLevel) * 100, 100)

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

        <div className="sidebar__level-compact">
          <div className="sidebar__level-row">
            <div className="sidebar__level-circle">{currentLevel}</div>

            <div className="sidebar__level-info">
              <p className="sidebar__level-label">level {currentLevel}</p>
              <p className="sidebar__level-xp">XP {xpIntoLevel}/{xpPerLevel}</p>
            </div>
          </div>

          <div className="sidebar__level-progress">
            <div
              className="sidebar__level-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="sidebar__bottom">{bottomItems.map(renderLink)}</div>
      </aside>

      <div className="mobile-sidebar-top">
        <NavLink to="/profile" className="mobile-top__icon-link">
          <span className="mobile-top__icon">👤</span>
        </NavLink>

        <div className="mobile-sidebar__logo">Job When?</div>

        <div className="mobile-top-level">
          <div className="mobile-top-level__circle">{currentLevel}</div>

          <div className="mobile-top-level__bar-wrap">
            <div className="mobile-top-level__xp">
              XP {xpIntoLevel}/{xpPerLevel}
            </div>

            <div className="mobile-top-level__bar">
              <div
                className="mobile-top-level__fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
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
          <span className="mobile-sidebar__label">Leaderboards</span>
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
