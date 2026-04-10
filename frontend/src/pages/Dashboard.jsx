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
const MOOD_SLIDER_COLORS = {
  1: '#ef4444',
  2: '#f97316',
  3: '#facc15',
  4: '#84cc16',
  5: '#22c55e',
}

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
  const [selectedMoodScore, setSelectedMoodScore] = useState(3)
  const [savedMoodScore, setSavedMoodScore] = useState(null)
  const [moodHistory, setMoodHistory] = useState([])
  const [moodTrend, setMoodTrend] = useState(null)

  useEffect(() => {
    if (!user) return

    const today = new Date().toISOString().slice(0, 10)
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
        setMoodTrend(moodInsights.myMoodTrend)
        const latest = moodInsights.myMoodHistory?.[0]
        if (latest?.moodScore) {
          setSelectedMoodScore(latest.moodScore)
          setSavedMoodScore(latest.checkedInAt?.slice(0, 10) === today ? latest.moodScore : null)
        } else {
          setSavedMoodScore(null)
        }
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
  const today = new Date().toISOString().slice(0, 10)
  const latestMood = moodHistory[0]
  const todaysMood = latestMood?.checkedInAt?.slice(0, 10) === today ? latestMood : null
  const moodSliderPercent = ((selectedMoodScore - 1) / 4) * 100
  const moodSliderColor = MOOD_SLIDER_COLORS[selectedMoodScore] ?? '#c084fc'

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

  const handleMoodCheckin = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      await logMoodCheckin(selectedMoodScore)
      const refreshed = await fetchMoodInsights()
      setMoodHistory(refreshed.myMoodHistory)
      setMoodTrend(refreshed.myMoodTrend)
      const latest = refreshed.myMoodHistory?.[0]
      if (latest?.moodScore) {
        setSelectedMoodScore(latest.moodScore)
        setSavedMoodScore(latest.checkedInAt?.slice(0, 10) === today ? latest.moodScore : null)
      } else {
        setSavedMoodScore(null)
      }
    } catch {}
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
            <p className="dashboard__mood-subtitle">Rate today from 1 to 5. Your friends can spot when you may need encouragement.</p>
            <div className="dashboard__mood-scale">
              <div className="dashboard__mood-scale-labels">
                <span aria-hidden="true">☹️</span>
                <span aria-hidden="true">😊</span>
              </div>
              <input
                className="dashboard__mood-slider"
                type="range"
                min="1"
                max="5"
                step="1"
                value={selectedMoodScore}
                onChange={(e) => setSelectedMoodScore(parseInt(e.target.value, 10))}
                style={{
                  '--mood-slider-percent': `${moodSliderPercent}%`,
                  '--mood-slider-color': moodSliderColor,
                }}
                aria-label="Mood score slider"
              />
              <p className="dashboard__mood-selected">Today&apos;s mood: {selectedMoodScore}/5</p>
              {(savedMoodScore === null || selectedMoodScore !== savedMoodScore) && (
                <div className="dashboard__mood-actions">
                  <Button variant="primary" onClick={handleMoodCheckin}>
                    Save Mood
                  </Button>
                </div>
              )}
            </div>
            {todaysMood && selectedMoodScore === savedMoodScore && (
              <p className="dashboard__mood-history">
                Today&apos;s mood was saved.
              </p>
            )}
            {!todaysMood && latestMood && (
              <p className="dashboard__mood-history">
                Latest check-in: score {latestMood.moodScore}
              </p>
            )}
            {moodTrend?.hasEnoughDays && (
              <p className="dashboard__mood-trend">
                3-day average: {moodTrend.averageScore}
                {moodTrend.isLowMoodTrend ? ' · Friends can encourage you right now.' : ''}
              </p>
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
