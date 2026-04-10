// pages/Collection.jsx
import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import { fetchLeaderboards } from '../api/leaderboardQueries'
import '../styles/Collection.css'

const SECTIONS = [
  {
    key: 'byLevel',
    title: 'Top by Level',
    subtitle: 'Highest current levels across the platform',
    valueLabel: 'Level',
  },
  {
    key: 'byChallenges',
    title: 'Top by Challenges Completed',
    subtitle: 'Recurring challenge completions count individually',
    valueLabel: 'Challenges',
  },
  {
    key: 'byApplications',
    title: 'Top by Applications Submitted',
    subtitle: 'Most total applications logged',
    valueLabel: 'Applications',
  },
]

export default function Collection() {
  const [leaderboards, setLeaderboards] = useState({
    byLevel: [],
    byChallenges: [],
    byApplications: [],
  })
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchLeaderboards()
      .then((data) => {
        if (!cancelled) {
          setLeaderboards(data)
        }
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

  return (
    <div className="collection-page">
      <Sidebar />
      <div className="collection-page__main">
        <div className="collection-panel">
          <div>
            <h1 className="collection-panel__title">Leaderboards</h1>
            <p className="collection-panel__subtitle">See who is leading the way across the app.</p>
          </div>

          {error && <p className="collection-panel__error">{error}</p>}

          <div className="leaderboards-grid">
            {SECTIONS.map((section) => {
              const entries = leaderboards[section.key] ?? []
              const winner = entries[0]
              const rest = entries.slice(1)

              return (
                <Card key={section.key} className="leaderboard-card">
                  <div className="leaderboard-card__header">
                    <div>
                      <h2 className="leaderboard-card__title">{section.title}</h2>
                      <p className="leaderboard-card__subtitle">{section.subtitle}</p>
                    </div>
                  </div>

                  {!winner ? (
                    <p className="leaderboard-card__empty">No rankings yet.</p>
                  ) : (
                    <>
                      <Card className="leaderboard-winner">
                        <div className="leaderboard-winner__crown">👑</div>
                        <div className="leaderboard-winner__avatar">{winner.avatar || '🙂'}</div>
                        <p className="leaderboard-winner__rank">#1</p>
                        <h3 className="leaderboard-winner__name">{winner.fullName}</h3>
                        <p className="leaderboard-winner__value">{winner.value} {section.valueLabel}</p>
                      </Card>

                      <div className="leaderboard-list">
                        {rest.map((entry, index) => (
                          <Card key={`${section.key}-${entry.userId}`} className="leaderboard-row">
                            <div className="leaderboard-row__left">
                              <span className="leaderboard-row__rank">#{index + 2}</span>
                              <span className="leaderboard-row__avatar">{entry.avatar || '🙂'}</span>
                              <span className="leaderboard-row__name">{entry.fullName}</span>
                            </div>
                            <span className="leaderboard-row__value">{entry.value}</span>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
