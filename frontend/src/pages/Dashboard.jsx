// pages/Dashboard.jsx
import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { fetchJobApplications } from '../api/boardQueries'
// TODO: re-add fetchActiveGoals import once backend goal endpoints are live
import { fetchMoodInsights, logMoodCheckin } from '../api/dashboardQueries'
import '../styles/Dashboard.css'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Preset weekly goals - TODO: replace with backend goals one endpoints are live
const GOAL_CONFIGS = [
  { type: 'applications', label: 'Job Applications' },
  { type: 'wellness', label: 'Wellness Check-in' },
  { type: 'interview_prep', label: 'Interview Prep' },
]

const GOAL_XP = 30

// TODO: remove mock data and replace once backend goal endpoints are live
const MOCK_GOALS = [
  { id: 1, goalType: 'applications', current: 2, target: 5, isCompleted: false },
  { id: 2, goalType: 'wellness', current: 1, target: 3, isCompleted: false },
  { id: 3, goalType: 'interview_prep', current: 0, target: 2, isCompleted: false },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const goalsRef = useRef(null)

  const [stats, setStats] = useState({ total: 0, interviews: 0, offers: 0, rate: 0 })
  const [goals, setGoals] = useState(MOCK_GOALS)

  // Goal interaction state
  const [editingGoalType, setEditingGoalType] = useState(null)
  const [editTargetValue, setEditTargetValue] = useState('')
  const [xpEarnedGoal, setXpEarnedGoal] = useState(null)
  const [mood, setMood] = useState(null)
  const [burnoutAlerts, setBurnoutAlerts] = useState([])
  const [moodHistory, setMoodHistory] = useState([])
  const [moodMessage, setMoodMessage] = useState('')

  useEffect(() => {
    if (!user) return

    let cancelled = false

    Promise.all([
      fetchJobApplications(user.userId),
      // TODO: add fetchActiveGoals() back here once backend goal endpoints are live
      fetchMoodInsights(),
    ])
      .then(([apps, moodInsights]) => {
        if (cancelled) return
        const applied = apps.filter((a) => a.status !== 'wishlist')
        const interviews = apps.filter((a) => a.status === 'interview').length
        const offers = apps.filter((a) => a.status === 'offer').length
        const total = applied.length
        const rate = total > 0 ? Math.round((interviews / total) * 100) : 0
        setStats({ total, interviews, offers, rate })
        setMoodHistory(moodInsights.myMoodHistory)
        setBurnoutAlerts(moodInsights.myBurnoutAlerts.filter((alert) => !alert.resolved))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [user])

  const completedGoals = goals.filter((g) => g.current >= g.target).length
  const overallProgress =
    goals.length > 0
      ? goals.reduce((sum, g) => sum + Math.min(g.current / g.target, 1), 0) / goals.length
      : 0

  const firstName = user?.fullName?.split(' ')[0] ?? ''
  const latestMood = moodHistory[0]
  const latestBurnoutAlert = burnoutAlerts[0]

  const handleMoodCheckin = async (score, nextMood) => {
    try {
      setMood(nextMood)
      const response = await logMoodCheckin(score)
      setMoodMessage(response?.message ?? 'Mood check-in saved.')
      const refreshed = await fetchMoodInsights()
      setMoodHistory(refreshed.myMoodHistory)
      setBurnoutAlerts(refreshed.myBurnoutAlerts.filter((alert) => !alert.resolved))
    } catch (error) {
      setMoodMessage(error.message)
    }
  }

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
          {/* TODO: replace placeholder value with completedChallenges count once backend exposes it */}
          <div className="dashboard__stat-card">
            <p className="dashboard__stat-label">Challenges Completed</p>
            <p className="dashboard__stat-value dashboard__stat-value--challenges">—</p>
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
                {goals.length === 0 && <p className="dashboard__empty">No active goals right now.</p>}
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
                onClick={() => handleMoodCheckin(4, mood === 'good' ? null : 'good')}
                aria-label="Feeling good"
              >
                👍
              </button>
              <button
                type="button"
                className={`dashboard__mood-btn${mood === 'bad' ? ' dashboard__mood-btn--active' : ''}`}
                onClick={() => handleMoodCheckin(2, mood === 'bad' ? null : 'bad')}
                aria-label="Feeling bad"
              >
                👎
              </button>
            </div>
            {moodMessage && <p className="dashboard__mood-message">{moodMessage}</p>}
            {latestMood && (
              <p className="dashboard__mood-history">
                Latest check-in: score {latestMood.moodScore}
              </p>
            )}
            {latestBurnoutAlert && (
              <div className="dashboard__burnout-alert">
                <p className="dashboard__burnout-title">Burnout Alert</p>
                <p className="dashboard__burnout-message">{latestBurnoutAlert.supportiveMessage}</p>
              </div>
            )}
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
