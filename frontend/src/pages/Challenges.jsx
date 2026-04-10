// pages/Challenges.jsx

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import MentorChallenges from '../components/MentorChallenges'
import { useAuth } from '../hooks/useAuth'
import '../styles/Challenges.css'
import {
  collectChallengeReward,
  fetchActiveChallenges,
  fetchAvailableChallenges,
  joinChallenge,
  leaveChallenge,
  updateChallengeProgress,
} from '../api/challengeQueries'

export default function Challenges() {
  const { user } = useAuth()
  const location = useLocation()
  const isApprovedMentor = user?.role?.roleName === 'mentor' && user?.isMentorApproved === true
  const [activeChallenges, setActiveChallenges] = useState([])
  const [newChallenges, setNewChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [collectingChallengeId, setCollectingChallengeId] = useState(null)
  const [collectedChallengeId, setCollectedChallengeId] = useState(null)
  const [collectedXpAmount, setCollectedXpAmount] = useState(null)

  useEffect(() => {
    loadChallenges()
  }, [])

  async function loadChallenges() {
    setLoading(true)
    setError(null)
    try {
      const [active, available] = await Promise.all([
        fetchActiveChallenges(),
        fetchAvailableChallenges(),
      ])
      setActiveChallenges(active)
      setNewChallenges(available)
    } catch {
      setError('Failed to load challenges.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddChallenge = async (challenge) => {
    const activeCount = activeChallenges.filter(
      ({ participationStatus }) => participationStatus === 'active',
    ).length

    if (activeCount >= 5) {
      alert('You can only have 5 active challenges at a time.')
      return
    }
    try {
      const result = await joinChallenge(challenge.challengeId)
      if (result.ok) {
        await loadChallenges()
      } else {
        alert(result.message)
      }
    } catch {
      alert('Failed to join challenge.')
    }
  }

  const handleRemoveChallenge = async (challenge) => {
    try {
      const result = await leaveChallenge(challenge.challengeId)
      if (result.ok) {
        await loadChallenges()
      } else {
        alert(result.message)
      }
    } catch {
      alert('Failed to leave challenge.')
    }
  }

  const handleCollectReward = async (challengeParticipantId) => {
    try {
      setCollectingChallengeId(challengeParticipantId)
      const result = await collectChallengeReward(challengeParticipantId)
      if (result.ok) {
        const xpMatch = result.message.match(/Collected (\d+) XP/)
        setCollectedChallengeId(challengeParticipantId)
        setCollectedXpAmount(xpMatch ? xpMatch[1] : null)
        setTimeout(() => {
          setCollectedChallengeId(null)
          setCollectedXpAmount(null)
          loadChallenges()
        }, 900)
      } else {
        alert(result.message)
      }
    } catch {
      alert('Failed to collect challenge reward.')
    } finally {
      setCollectingChallengeId(null)
    }
  }

  const getCollectLabel = (challenge) => {
    if (collectingChallengeId === challenge.challengeParticipantId) {
      return 'Collecting...'
    }
    if (collectedChallengeId === challenge.challengeParticipantId) {
      return collectedXpAmount ? `+${collectedXpAmount} XP` : 'Collected'
    }
    return `Collect ${challenge.xpReward} XP`
  }

  const formatRecurrenceText = (maxCompletionsPerUser, remainingCompletions) => {
    const completedCount = Math.max(
      0,
      maxCompletionsPerUser - remainingCompletions,
    )
    return `↻ ${completedCount}/${maxCompletionsPerUser} completed`
  }

  const isExpiredChallenge = (challenge) => {
    if (!challenge.dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(`${challenge.dueDate}T00:00:00`)
    return dueDate < today
  }

  const increaseProgress = async (id) => {
    try {
      const result = await updateChallengeProgress(id, 1)
      if (result.ok) {
        await loadChallenges()
      }
    } catch {
      alert('Failed to update challenge progress.')
    }
  }

  const decreaseProgress = async (id) => {
    try {
      const result = await updateChallengeProgress(id, -1)
      if (result.ok) {
        await loadChallenges()
      }
    } catch {
      alert('Failed to update challenge progress.')
    }
  }

  if (loading) return <div className="challenges-page"><Sidebar /><main className="challenges-page__main"><p>Loading challenges...</p></main></div>
  if (error) return <div className="challenges-page"><Sidebar /><main className="challenges-page__main"><p>{error}</p></main></div>

  return (
    <div className="challenges-page">
      <Sidebar />

      <main className="challenges-page__main">
        <div className="challenges-page__layout">
        <section className="challenges-panel">
          <div className="challenges-panel__header">
            <h1 className="challenges-panel__title">Challenges</h1>
            <p className="challenges-panel__subtitle">
              Complete mentor-created challenges to earn XP and new badges!
            </p>
          </div>

          <div className="challenges-list">
            {activeChallenges.length === 0 ? (
              <Card className="challenges-empty-state">
                <p className="challenges-empty-state__text">No active challenges yet.</p>
              </Card>
            ) : (
              activeChallenges.map((challenge) => (
                (() => {
                  const isExpired = isExpiredChallenge(challenge)
                  return (
                <Card key={challenge.challengeParticipantId} className="challenge-card">
                  <div className="challenge-card__top">
                    <div className="challenge-card__main">
                      <h2 className="challenge-card__title">{challenge.title}</h2>
                      <p className="challenge-card__meta">
                        Created by {challenge.mentorName} - due {challenge.dueDate}
                      </p>
                    </div>

                    <div className="challenge-card__actions">
                      {isExpired ? (
                        <Button
                          variant="danger"
                          className="challenge-card__remove"
                          onClick={() => handleRemoveChallenge(challenge)}>Remove</Button>
                      ) : challenge.participationStatus === 'completed' ? (
                        <Button
                          variant="primary"
                          className="challenge-card__collect"
                          onClick={() => handleCollectReward(challenge.challengeParticipantId)}
                          disabled={collectingChallengeId === challenge.challengeParticipantId}
                        >
                          {getCollectLabel(challenge)}
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          className="challenge-card__remove"
                          onClick={() => handleRemoveChallenge(challenge)}>Remove</Button>
                      )}
                      <p className="challenge-card__meta challenge-card__meta--recurring">
                        {formatRecurrenceText(
                          challenge.maxCompletionsPerUser,
                          challenge.remainingCompletions,
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="challenge-card__description">
                    {challenge.description}
                  </p>

                  {isExpired ? (
                    <p className="challenge-card__expired">Expired. You can only remove this challenge.</p>
                  ) : null}

                  <div className="challenge-card__progress-row">
                    <button
                      type="button"
                      className="challenge-card__control-btn"
                      onClick={() => decreaseProgress(challenge.challengeParticipantId)}
                      disabled={challenge.progressCount === 0 || isExpired}>-</button>

                    <div className="challenge-card__progress">
                      <div
                        className="challenge-card__progress-fill"
                        style={{
                          width: `${(challenge.progressCount / challenge.targetCount) * 100}%`,
                        }}
                      />
                      <span className="challenge-card__progress-text">
                        {challenge.progressCount}/{challenge.targetCount}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="challenge-card__control-btn"
                      onClick={() => increaseProgress(challenge.challengeParticipantId)}
                      disabled={challenge.progressCount === challenge.targetCount || challenge.participationStatus === 'completed' || isExpired}>+</button>
                  </div>
                </Card>
                  )
                })()
              ))
            )}
          </div>

          <Card className="new-challenges">
            <h2 className="new-challenges__title">More Challenges to Claim</h2>

            {newChallenges.length === 0 ? (
              <p className="new-challenges__empty">
                Ahead of the game! No one has created a challenge you haven&apos;t taken yet. Check back later for new challenges from your mentors.
              </p>
            ) : (
              <div className="new-challenges__grid">
                {newChallenges.map((challenge) => (
                  <Card key={challenge.challengeId} className="new-challenge-card">
                    <div className="new-challenge-card__top">
                      <div className="new-challenge-card__person">
                        <div>
                          <h3 className="new-challenge-card__name">
                            {challenge.mentorName}
                          </h3>
                        </div>
                      </div>
                      <span className="new-challenge-card__days">
                        {Math.max(0, Math.ceil((new Date(challenge.dueDate) - new Date()) / (1000 * 60 * 60 * 24)))} days
                      </span>
                    </div>
                    <h4 className="new-challenge-card__title">
                      {challenge.title}
                    </h4>
                    <p className="new-challenge-card__desc">
                      {challenge.description}
                    </p>
                    <p className="new-challenge-card__desc new-challenge-card__desc--recurring">
                      {formatRecurrenceText(
                        challenge.maxCompletionsPerUser,
                        challenge.remainingCompletions,
                      )}
                    </p>

                    <Button
                      variant="primary"
                      className="new-challenge-card__btn"
                      onClick={() => handleAddChallenge(challenge)}>ADD</Button>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </section>
          {isApprovedMentor && <MentorChallenges openCreate={!!location.state?.openCreateModal} />}
        </div>
      </main>
    </div>
  )
}
