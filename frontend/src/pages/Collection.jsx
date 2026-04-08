// pages/Collection.jsx
import Sidebar from '../components/Sidebar'
import BadgeHex from '../components/BadgeHex'
import { useAuth } from '../hooks/useAuth'
import '../styles/Collection.css'

const TOTAL_BADGES = 11

export default function Collection() {
  const { user } = useAuth()
  const currentLevel = user?.currentLevel ?? 0

  const badges = Array.from({ length: TOTAL_BADGES }, (_, i) => {
    const level = i + 1
    return {
      level,
      label: `Level ${level} Badge`,
      unlocked: level < currentLevel,
      current: level === currentLevel,
    }
  })

  return (
    <div className="collection-page">
      <Sidebar />
      <div className="collection-page__main">
        <div className="collection-panel">
          <div>
            <h1 className="collection-panel__title">Collection</h1>
            <p className="collection-panel__subtitle">Collect more badges with more XP!</p>
          </div>

          <div className="badge-grid">
            {badges.map(({ level, unlocked, current }) => (
              <BadgeHex key={level} level={level} unlocked={unlocked} current={current} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
