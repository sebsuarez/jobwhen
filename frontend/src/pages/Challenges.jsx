// pages/Challenges.jsx

import { useState, useEffect } from 'react'
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
  const isMentor = user?.role?.roleName === 'mentor'
  const [activeChallenges, setActiveChallenges] = useState([])
  const [newChallenges, setNewChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      const result = await collectChallengeReward(challengeParticipantId)
      if (result.ok) {
        alert(result.message)
        await loadChallenges()
      } else {
        alert(result.message)
      }
    } catch {
      alert('Failed to collect challenge reward.')
    }
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
            <h1 className="challenges-panel__title">Active Challenges</h1>
            <p className="challenges-panel__subtitle">
              Complete mentor-created challenges to earn XP and new badges!
            </p>
          </div>

          <div className="challenges-list">
            {activeChallenges.map((challenge) => (
              <Card key={challenge.challengeParticipantId} className="challenge-card">
                <div className="challenge-card__top">
                  <div>
                    <h2 className="challenge-card__title">{challenge.title}</h2>
                    <p className="challenge-card__meta">
                      Created by {challenge.mentorName} - due {challenge.dueDate}
                    </p>
                  </div>

                  {challenge.participationStatus === 'completed' ? (
                    <Button
                      variant="primary"
                      className="challenge-card__collect"
                      onClick={() => handleCollectReward(challenge.challengeParticipantId)}>Collect</Button>
                  ) : (
                    <Button
                      variant="danger"
                      className="challenge-card__remove"
                      onClick={() => handleRemoveChallenge(challenge)}>Remove</Button>
                  )}
                </div>
                <p className="challenge-card__description">
                  {challenge.description}
                </p>

                {challenge.participationStatus === 'completed' ? (
                  <p className="challenge-card__completed">
                    Challenge complete. Collect {challenge.xpReward} XP.
                  </p>
                ) : null}

                <div className="challenge-card__progress-row">
                  <div className="challenge-card__controls">
                    <button
                      type="button"
                      className="challenge-card__control-btn"
                      onClick={() => decreaseProgress(challenge.challengeParticipantId)}
                      disabled={challenge.progressCount === 0 || challenge.participationStatus === 'completed'}>-</button>

                    <button
                      type="button"
                      className="challenge-card__control-btn"
                      onClick={() => increaseProgress(challenge.challengeParticipantId)}
                      disabled={challenge.progressCount === challenge.targetCount || challenge.participationStatus === 'completed'}>+</button>
                  </div>

                  <span className="challenge-card__progress-text">
                    {challenge.progressCount}/{challenge.targetCount}
                  </span>
                </div>

                <div className="challenge-card__progress">
                  <div
                    className="challenge-card__progress-fill"
                    style={{
                      width: `${(challenge.progressCount / challenge.targetCount) * 100}%`,
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>

          <Card className="new-challenges">
            <h2 className="new-challenges__title">New Created Challenges</h2>

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

                  <Button
                    variant="primary"
                    className="new-challenge-card__btn"
                    onClick={() => handleAddChallenge(challenge)}>ADD</Button>
                </Card>
              ))}
            </div>
          </Card>
        </section>
          {isMentor && <MentorChallenges />}
        </div>
      </main>
    </div>
  )
}
