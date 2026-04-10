// pages/Dashboard.jsx
import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth'
import { fetchJobApplications } from '../api/boardQueries'
import { fetchCompletedChallengesCount } from '../api/challengeQueries'
import { fetchActiveGoals, fetchMoodInsights, logMoodCheckin, setGoal, updateGoalProgress } from '../api/dashboardQueries'
import { getSessionQuote } from '../data/quotes'
import '../styles/Dashboard.css'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const GOAL_CONFIGS = [
  { type: 'job_application', label: 'Job Applications' },
  { type: 'wellness_checkin', label: 'Wellness Check-in' },
  { type: 'interview_prep', label: 'Interview Prep' },
]

// Same XP for each goal type for now
const GOAL_XP = 30

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const goalsRef = useRef(null)

  const [quote] = useState(getSessionQuote)
  const [stats, setStats] = useState({ total: 0, offers: 0, challengesCompleted: 0 })
  const [goals, setGoals] = useState([])

  // Goal interaction state
  const [editModalGoal, setEditModalGoal] = useState(null)
  const [editTargetValue, setEditTargetValue] = useState('')
  const [targetError, setTargetError] = useState('')
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
      fetchActiveGoals(),
      fetchMoodInsights(),
      fetchCompletedChallengesCount(),
    ])
      .then(([apps, activeGoals, moodInsights, challengesCompleted]) => {
        if (cancelled) return
        const applied = apps.filter((a) => a.status !== 'wishlist')
        const offers = apps.filter((a) => a.status === 'offer').length
        const total = applied.length
        setStats({ total, offers, challengesCompleted })
        setGoals(activeGoals.map((g) => ({
          id: g.goalId,
          goalType: g.goalType,
          current: g.currentCount,
          target: g.targetCount,
          isCompleted: g.isCompleted,
        })))
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

  const handleUpdateProgress = async (goalType, delta) => {
    const goal = goals.find((g) => g.goalType === goalType)
    if (!goal) return
    if (delta > 0 && goal.isCompleted) return
    if (delta < 0 && goal.current <= 0) return

    try {
      const result = await updateGoalProgress(goal.id, delta)
      if (result.ok) {
        const g = result.goal
        applyGoalUpdate(goalType, { current: g.currentCount, target: g.targetCount, isCompleted: g.isCompleted })
        if (result.xpAwarded) {
          setXpEarnedGoal(goalType)
          setTimeout(() => setXpEarnedGoal(null), 2500)
        }
      }
    } catch { /* silent */ }
  }

  const handleSetTarget = async (goalType) => {
    const target = parseInt(editTargetValue, 10)
    if (!target || target < 1) {
      setTargetError('Please enter a number greater than 0.')
      return
    }
    setTargetError('')
    setEditModalGoal(null)

    try {
      const result = await setGoal(goalType, target)
      if (result.ok) {
        const g = result.goal
        const normalized = { id: g.goalId, goalType: g.goalType, current: g.currentCount, target: g.targetCount, isCompleted: g.isCompleted }
        setGoals((prev) => {
          const exists = prev.find((x) => x.goalType === goalType)
          return exists
            ? prev.map((x) => x.goalType === goalType ? normalized : x)
            : [...prev, normalized]
        })
        if (normalized.isCompleted) {
          setXpEarnedGoal(goalType)
          setTimeout(() => setXpEarnedGoal(null), 2500)
        }
      }
    } catch { /* silent */ }
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
            "{quote.text}"{quote.author ? ` ~ ${quote.author}` : ''}
          </p>
        </header>

        <div className="dashboard__stats">
          <Card className="dashboard__stat-card">
            <p className="dashboard__stat-label">Total Applied</p>
            <p className="dashboard__stat-value dashboard__stat-value--total">{stats.total}</p>
          </Card>
          <Card className="dashboard__stat-card">
            <p className="dashboard__stat-label">Challenges Completed</p>
            <p className="dashboard__stat-value dashboard__stat-value--challenges">{stats.challengesCompleted}</p>
          </Card>
          <Card className="dashboard__stat-card">
            <p className="dashboard__stat-label">Offers</p>
            <p className="dashboard__stat-value dashboard__stat-value--offer">{stats.offers}</p>
          </Card>
          <Card className="dashboard__stat-card">
            <p className="dashboard__stat-label">Day Streak</p>
            <p className="dashboard__stat-value dashboard__stat-value--streak">{user?.streakDays ?? 0}</p>
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
                              onClick={() => handleUpdateProgress(goal.type, -1)}
                              disabled={goal.target === null || goal.current <= 0}
                              aria-label={`Remove progress from ${goal.label}`}
                            >
                              −
                            </Button>
                            <Button
                              variant="ghost"
                              className="dashboard__goal-increment-btn"
                              onClick={() => handleUpdateProgress(goal.type, 1)}
                              disabled={goal.target === null}
                              aria-label={`Add progress to ${goal.label}`}
                            >
                              +
                            </Button>
                          </>
                        )}

                        {goal.target === null && (
                          <Button
                            variant="ghost"
                            className="dashboard__goal-icon-btn"
                            onClick={() => {
                              setEditModalGoal({ type: goal.type, label: goal.label })
                              setEditTargetValue('')
                            }}
                            aria-label={`Set ${goal.label} target`}
                          >
                            ✎
                          </Button>
                        )}
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
            <Button variant="ghost" className="dashboard__action-btn" onClick={() => navigate('/board', { state: { openAddModal: true } })}>
              Add Application
            </Button>
            <Button variant="ghost" className="dashboard__action-btn" onClick={() => navigate('/profile', { state: { openEditModal: true } })}>
              Edit Profile
            </Button>
            <Button variant="ghost" className="dashboard__action-btn" onClick={() => navigate('/challenges')}>
              Check Challenges
            </Button>
            <Button variant="ghost" className="dashboard__action-btn" onClick={() => navigate('/friends', { state: { openAddFriend: true } })}>
              Add Friend
            </Button>
            {user?.role?.roleName === 'mentor' && user?.isMentorApproved && (
              <Button variant="ghost" className="dashboard__action-btn" onClick={() => navigate('/challenges', { state: { openCreateModal: true } })}>
                Create Challenge
              </Button>
            )}
          </div>
        </Card>
      </main>

      <Modal
        isOpen={editModalGoal !== null}
        onClose={() => { setEditModalGoal(null); setTargetError('') }}
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
            onChange={(e) => { setEditTargetValue(e.target.value); setTargetError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSetTarget(editModalGoal?.type)}
            autoFocus
          />
          {targetError && <p className="dashboard__goal-modal-error">{targetError}</p>}
          <div className="dashboard__goal-modal-actions">
            <Button variant="ghost" onClick={() => setEditModalGoal(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => handleSetTarget(editModalGoal?.type)}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
