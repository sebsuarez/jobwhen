// pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { fetchJobApplications } from '../api/boardQueries'
import '../styles/Dashboard.css'

const defaultGoals = [
  { id: 1, label: 'Daily Application', current: 1, target: 3 },
  { id: 2, label: 'Send Encouragement', current: 3, target: 3 },
  { id: 3, label: 'Participate in a Challenge', current: 1, target: 1 },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, interviews: 0, offers: 0, rate: 0 })
  const [goals] = useState(defaultGoals)
  const [mood, setMood] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchJobApplications(user.userId)
      .then((apps) => {
        const applied = apps.filter((a) => a.status !== 'wishlist')
        const interviews = apps.filter((a) => a.status === 'interview').length
        const offers = apps.filter((a) => a.status === 'offer').length
        const total = applied.length
        const rate = total > 0 ? Math.round((interviews / total) * 100) : 0
        setStats({ total, interviews, offers, rate })
      })
      .catch(() => {})
  }, [user])

  const completedGoals = goals.filter((g) => g.current >= g.target).length
  const overallProgress =
    goals.reduce((sum, g) => sum + Math.min(g.current / g.target, 1), 0) / goals.length

  const firstName = user?.fullName?.split(' ')[0] ?? ''

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content dashboard">
        <header className="dashboard__header">
          <h1 className="dashboard__greeting">
            {getGreeting()}, <span className="dashboard__name">{firstName}</span>
          </h1>
          <p className="dashboard__quote">
            "You miss 100% of the shots you don't take" ~ Wayne Gretzky
          </p>
        </header>

        <div className="dashboard__stats">
          <div className="dashboard__stat-card">
            <p className="dashboard__stat-label">Total Applied</p>
            <p className="dashboard__stat-value dashboard__stat-value--total">{stats.total}</p>
          </div>
          <div className="dashboard__stat-card">
            <p className="dashboard__stat-label">Interviews</p>
            <p className="dashboard__stat-value dashboard__stat-value--interview">{stats.interviews}</p>
          </div>
          <div className="dashboard__stat-card">
            <p className="dashboard__stat-label">Offers</p>
            <p className="dashboard__stat-value dashboard__stat-value--offer">{stats.offers}</p>
          </div>
          <div className="dashboard__stat-card">
            <p className="dashboard__stat-label">Interview Rate</p>
            <p className="dashboard__stat-value dashboard__stat-value--rate">{stats.rate}%</p>
          </div>
        </div>

        <div className="dashboard__mid-row">
          <div className="dashboard__card dashboard__goals">
            <h2 className="dashboard__card-title">Today's Goals</h2>
            <div className="dashboard__goals-body">
              <div className="dashboard__goals-summary">
                <p className="dashboard__goals-number">{completedGoals}</p>
                <p className="dashboard__goals-label">Goals</p>
                <p className="dashboard__goals-of">of {goals.length}</p>
                <div className="dashboard__goals-bar">
                  <div
                    className="dashboard__goals-bar-fill"
                    style={{ width: `${overallProgress * 100}%` }}
                  />
                </div>
              </div>
              <div className="dashboard__goals-list">
                {goals.map((goal) => (
                  <div key={goal.id} className="dashboard__goal-item">
                    <div className="dashboard__goal-top">
                      <span className="dashboard__goal-name">{goal.label}</span>
                      <span className="dashboard__goal-progress">{goal.current}/{goal.target}</span>
                    </div>
                    <div className="dashboard__goal-bar">
                      <div
                        className="dashboard__goal-bar-fill"
                        style={{ width: `${Math.min(goal.current / goal.target, 1) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard__card dashboard__mood">
            <h2 className="dashboard__card-title">How are you feeling?</h2>
            <p className="dashboard__mood-subtitle">Your well being matters. Check in daily.</p>
            <div className="dashboard__mood-buttons">
              <button
                type="button"
                className={`dashboard__mood-btn${mood === 'good' ? ' dashboard__mood-btn--active' : ''}`}
                onClick={() => setMood(mood === 'good' ? null : 'good')}
                aria-label="Feeling good"
              >
                👍
              </button>
              <button
                type="button"
                className={`dashboard__mood-btn${mood === 'bad' ? ' dashboard__mood-btn--active' : ''}`}
                onClick={() => setMood(mood === 'bad' ? null : 'bad')}
                aria-label="Feeling bad"
              >
                👎
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard__card dashboard__quick-actions">
          <h2 className="dashboard__card-title">Quick Actions</h2>
          <div className="dashboard__actions-grid">
            <button type="button" className="dashboard__action-btn" onClick={() => navigate('/board')}>
              Add Application
            </button>
            <button type="button" className="dashboard__action-btn" onClick={() => navigate('/collection')}>
              View Badges
            </button>
            <button type="button" className="dashboard__action-btn" onClick={() => navigate('/challenges')}>
              Check Challenges
            </button>
            <button type="button" className="dashboard__action-btn" onClick={() => navigate('/friends')}>
              See Friends
            </button>
            <button type="button" className="dashboard__action-btn">
              Edit Goals
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
