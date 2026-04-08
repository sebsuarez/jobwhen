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
      unlocked: level < currentLevel,
      current: level === currentLevel,
    }
  })

  // chunk badges into alternating rows of 4 and 3
  const rows = []
  let i = 0
  let rowIndex = 0
  while (i < badges.length) {
    const size = rowIndex % 2 === 0 ? 4 : 3
    rows.push(badges.slice(i, i + size))
    i += size
    rowIndex++
  }

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
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className={`badge-row${rowIndex % 2 === 1 ? ' badge-row--offset' : ''}`}>
                {row.map(({ level, unlocked, current }) => (
                  <BadgeHex key={level} level={level} unlocked={unlocked} current={current} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
