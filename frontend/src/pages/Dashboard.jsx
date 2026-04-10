// pages/Dashboard.jsx
import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
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
  const [editModalGoal, setEditModalGoal] = useState(null)
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

  // Always show all 3 goal rows, filling in data where available
  const allGoals = GOAL_CONFIGS.map((config) => {
    const found = goals.find((g) => g.goalType === config.type)
    return {
      type: config.type,
      label: config.label,
      id: found?.id ?? null,
      current: found?.current ?? 0,
      target: found?.target ?? null,
      isCompleted: found?.isCompleted ?? false,
    }
  })

  const completedGoals = allGoals.filter((g) => g.isCompleted).length
  // Unset goals count as 0 so the bar reflects real state across all 3
  const overallProgress =
    allGoals.reduce((sum, g) => sum + (g.target ? Math.min(g.current / g.target, 1) : 0), 0) / 3

  const firstName = user?.fullName?.split(' ')[0] ?? ''
  const latestMood = moodHistory[0]
  const latestBurnoutAlert = burnoutAlerts[0]

  function applyGoalUpdate(goalType, patch) {
    setGoals((prev) =>
      prev.map((g) => (g.goalType === goalType ? { ...g, ...patch } : g))
    )
  }

  // TODO: replace body with proper API call once backend endpoint is live
  const handleIncrementGoal = (goalType) => {
    const goal = goals.find((g) => g.goalType === goalType)
    if (!goal || goal.isCompleted) return

    const newCurrent = goal.current + 1
    const justCompleted = newCurrent >= goal.target
    applyGoalUpdate(goalType, { current: newCurrent, isCompleted: justCompleted })

    if (justCompleted) {
      setXpEarnedGoal(goalType)
      setTimeout(() => setXpEarnedGoal(null), 2500)
    }
  }

  // TODO: replace body with proper API call once backend endpoint is live
  const handleDecrementGoal = (goalType) => {
    const goal = goals.find((g) => g.goalType === goalType)
    if (!goal || goal.current <= 0) return

    const newCurrent = goal.current - 1
    const stillCompleted = newCurrent >= goal.target
    applyGoalUpdate(goalType, { current: newCurrent, isCompleted: stillCompleted })
  }

  // TODO: replace body with proper API call once backend endpoint is live
  const handleSetTarget = (goalType) => {
    const target = parseInt(editTargetValue, 10)
    setEditModalGoal(null)
    if (!target || target < 1) return

    const goal = goals.find((g) => g.goalType === goalType)
    const wasCompleted = goal?.isCompleted ?? false
    const newCompleted = (goal?.current ?? 0) >= target
    applyGoalUpdate(goalType, { target, isCompleted: newCompleted })

    if (newCompleted && !wasCompleted) {
      setXpEarnedGoal(goalType)
      setTimeout(() => setXpEarnedGoal(null), 2500)
    }
  }

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
          <Card className="dashboard__stat-card">
            <p className="dashboard__stat-label">Total Applied</p>
            <p className="dashboard__stat-value dashboard__stat-value--total">{stats.total}</p>
          </Card>
          {/* TODO: replace placeholder value with completedChallenges count once backend exposes it */}
          <Card className="dashboard__stat-card">
            <p className="dashboard__stat-label">Challenges Completed</p>
            <p className="dashboard__stat-value dashboard__stat-value--challenges">—</p>
          </Card>
          <Card className="dashboard__stat-card">
            <p className="dashboard__stat-label">Offers</p>
            <p className="dashboard__stat-value dashboard__stat-value--offer">{stats.offers}</p>
          </Card>
          <Card className="dashboard__stat-card">
            <p className="dashboard__stat-label">Interview Rate</p>
            <p className="dashboard__stat-value dashboard__stat-value--rate">{stats.rate}%</p>
          </Card>
        </div>

        <div className="dashboard__mid-row">
          <Card className="dashboard__goals" ref={goalsRef}>
            <h2 className="dashboard__card-title">This Week's Goals</h2>
            <div className="dashboard__goals-body">
              <div className="dashboard__goals-summary">
                <p className="dashboard__goals-number">{completedGoals}</p>
                <p className="dashboard__goals-label">Goals</p>
                <p className="dashboard__goals-of">of 3</p>
                <div className="dashboard__goals-bar">
                  <div
                    className="dashboard__goals-bar-fill"
                    style={{ width: `${overallProgress * 100}%` }}
                  />
                </div>
              </div>
              <div className="dashboard__goals-list">
                {allGoals.map((goal) => (
                  <div
                    key={goal.type}
                    className={`dashboard__goal-item${goal.isCompleted ? ' dashboard__goal-item--done' : ''}`}
                  >
                    <div className="dashboard__goal-top">
                      <span className="dashboard__goal-name">{goal.label}</span>
                      <div className="dashboard__goal-controls">
                        {xpEarnedGoal === goal.type ? (
                          <span className="dashboard__goal-xp-earned">+{GOAL_XP} XP</span>
                        ) : (
                          <span className="dashboard__goal-progress">
                            {goal.target !== null ? `${goal.current}/${goal.target}` : '—'}
                          </span>
                        )}

                        {goal.isCompleted ? (
                          <span className="dashboard__goal-done-badge">Done</span>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              className="dashboard__goal-increment-btn"
                              onClick={() => handleDecrementGoal(goal.type)}
                              disabled={goal.target === null || goal.current <= 0}
                              aria-label={`Remove progress from ${goal.label}`}
                            >
                              −
                            </Button>
                            <Button
                              variant="ghost"
                              className="dashboard__goal-increment-btn"
                              onClick={() => handleIncrementGoal(goal.type)}
                              disabled={goal.target === null}
                              aria-label={`Add progress to ${goal.label}`}
                            >
                              +
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          className="dashboard__goal-icon-btn"
                          onClick={() => {
                            setEditModalGoal({ type: goal.type, label: goal.label })
                            setEditTargetValue(goal.target !== null ? String(goal.target) : '')
                          }}
                          aria-label={`Edit ${goal.label} target`}
                        >
                          ✎
                        </Button>
                      </div>
                    </div>
                    {goal.target !== null ? (
                      <div className="dashboard__goal-bar">
                        <div
                          className="dashboard__goal-bar-fill"
                          style={{ width: `${Math.min(goal.current / goal.target, 1) * 100}%` }}
                        />
                      </div>
                    ) : (
                      <p className="dashboard__goal-unset">Set a target to start tracking</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="dashboard__mood">
            <h2 className="dashboard__card-title">How are you feeling?</h2>
            <p className="dashboard__mood-subtitle">Your well being matters. Check in daily.</p>
            <div className="dashboard__mood-buttons">
              <Button
                variant="ghost"
                className={`dashboard__mood-btn${mood === 'good' ? ' dashboard__mood-btn--active' : ''}`}
                onClick={() => handleMoodCheckin(4, mood === 'good' ? null : 'good')}
                aria-label="Feeling good"
              >
                👍
              </Button>
              <Button
                variant="ghost"
                className={`dashboard__mood-btn${mood === 'bad' ? ' dashboard__mood-btn--active' : ''}`}
                onClick={() => handleMoodCheckin(2, mood === 'bad' ? null : 'bad')}
                aria-label="Feeling bad"
              >
                👎
              </Button>
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
          </Card>
        </div>

        <Card className="dashboard__quick-actions">
          <h2 className="dashboard__card-title">Quick Actions</h2>
          <div className="dashboard__actions-grid">
            <Button variant="ghost" className="dashboard__action-btn" onClick={() => navigate('/board')}>
              Add Application
            </Button>
            <Button variant="ghost" className="dashboard__action-btn" onClick={() => navigate('/collection')}>
              View Badges
            </Button>
            <Button variant="ghost" className="dashboard__action-btn" onClick={() => navigate('/challenges')}>
              Check Challenges
            </Button>
            <Button variant="ghost" className="dashboard__action-btn" onClick={() => navigate('/friends')}>
              See Friends
            </Button>
            <Button
              variant="ghost"
              className="dashboard__action-btn"
              onClick={() => goalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              Edit Goals
            </Button>
          </div>
        </Card>
      </main>

      <Modal
        isOpen={editModalGoal !== null}
        onClose={() => setEditModalGoal(null)}
        title={`Set Target — ${editModalGoal?.label}`}
      >
        <div className="dashboard__goal-modal">
          <p className="dashboard__goal-modal-label">
            How many this week?
          </p>
          <input
            className="dashboard__goal-target-input"
            type="number"
            min="1"
            value={editTargetValue}
            onChange={(e) => setEditTargetValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSetTarget(editModalGoal?.type)}
            autoFocus
          />
          <div className="dashboard__goal-modal-actions">
            <Button variant="ghost" onClick={() => setEditModalGoal(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => handleSetTarget(editModalGoal?.type)}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
