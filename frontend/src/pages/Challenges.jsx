// pages/Challenges.jsx

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import '../styles/Challenges.css'
import { fetchActiveChallenges, fetchAvailableChallenges, joinChallenge, leaveChallenge } from '../api/challengeQueries'

export default function Challenges() {
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
    if (activeChallenges.length >= 5) {
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

  const handleRemoveChallenge = (challenge) => {
    setActiveChallenges((prev) => prev.filter((item) => item.id !== challenge.id))
    setNewChallenges((prev) => [...prev, challenge])
  }

  const increaseProgress = (id) => {
    setActiveChallenges((prev) =>
      prev.map((c) =>
        c.id === id && c.current < c.total
          ? { ...c, current: c.current + 1 }
          : c
      )
    )
  }

  const decreaseProgress = (id) => {
    setActiveChallenges((prev) =>
      prev.map((c) =>
        c.id === id && c.current > 0
          ? { ...c, current: c.current - 1 }
          : c
      )
    )
  }

  return (
    <div className="challenges-page">
      <Sidebar />

      <main className="challenges-page__main">
        <section className="challenges-panel">
          <div className="challenges-panel__header">
            <h1 className="challenges-panel__title">Active Challenges</h1>
            <p className="challenges-panel__subtitle">
              Complete mentor-created challenges to earn XP and new badges!
            </p>
          </div>

          <div className="challenges-list">
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="challenge-card">
                <div className="challenge-card__top">
                  <div>
                    <h2 className="challenge-card__title">{challenge.title}</h2>
                    <p className="challenge-card__meta">
                      Created by {challenge.creator} - due {challenge.due}
                    </p>
                  </div>

                  <Button
                    variant="danger"
                    className="challenge-card__remove"
                    onClick={() => handleRemoveChallenge(challenge)}>Remove</Button>
                </div>
                <p className="challenge-card__description">
                  {challenge.description}
                </p>

                <div className="challenge-card__progress-row">
                  <div className="challenge-card__controls">
                    <button
                      type="button"
                      className="challenge-card__control-btn"
                      onClick={() => decreaseProgress(challenge.id)}
                      disabled={challenge.current === 0}>-</button>
                   
                    <button
                      type="button"
                      className="challenge-card__control-btn"
                      onClick={() => increaseProgress(challenge.id)}
                      disabled={challenge.current === challenge.total}>+</button>
                  </div>

                  <span className="challenge-card__progress-text">
                    {challenge.current}/{challenge.total}
                  </span>
                </div>

                <div className="challenge-card__progress">
                  <div
                    className="challenge-card__progress-fill"
                    style={{
                      width: `${(challenge.current / challenge.total) * 100}%`,
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
                <Card key={challenge.id} className="new-challenge-card">
                  <div className="new-challenge-card__top">
                    <div className="new-challenge-card__person">
                      <div>
                        <h3 className="new-challenge-card__name">
                          {challenge.name}
                        </h3>
                        <p className="new-challenge-card__role">
                          {challenge.role}
                        </p>
                      </div>
                    </div>
                    <span className="new-challenge-card__days">
                      {challenge.days}
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
      </main>
    </div>
  )
}