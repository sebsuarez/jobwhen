// pages/Collection.jsx
import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import BadgeHex from '../components/BadgeHex'
import { fetchProfileInsights } from '../api/profileQueries'
import '../styles/Collection.css'

export default function Collection() {
  const [badges, setBadges] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchProfileInsights()
      .then(({ myBadges, allBadges }) => {
        if (cancelled) return
        const earnedBadgeIds = new Set(myBadges.map((entry) => entry.badge.badgeId))
        setBadges(
          allBadges.map((badge, index) => ({
            level: badge.levelRequired ?? index + 1,
            label: badge.badgeName,
            unlocked: earnedBadgeIds.has(badge.badgeId),
            current: false,
          }))
        )
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

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

          {error && <p className="collection-panel__error">{error}</p>}

          <div className="badge-grid">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className={`badge-row${rowIndex % 2 === 1 ? ' badge-row--offset' : ''}`}>
                {row.map(({ level, label, unlocked, current }) => (
                  <BadgeHex key={`${level}-${label}`} level={level} label={label} unlocked={unlocked} current={current} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
