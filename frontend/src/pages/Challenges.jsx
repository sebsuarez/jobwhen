// pages/Challenges.jsx

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import '../styles/Challenges.css'

// TODO: REPLACE THIS WITH REAL DATA FROM BACKEND ONCE SETUP!
const initialActiveChallenges = [
  {
    id: 1,
    title: 'Apply-a-thon',
    creator: 'Dr Chen',
    due: 'Mar 2nd',
    description: 'Submit 5 applications this week',
    current: 3,
    total: 5,
  },
  {
    id: 2,
    title: 'Interview Prep Sprint',
    creator: 'Lisa Wong',
    due: 'Mar 5th',
    description: 'Complete 3 mock interview questions',
    current: 1,
    total: 3,
  },
  {
    id: 3,
    title: 'Network Boost',
    creator: 'James Park',
    due: 'Mar 7th',
    description: 'Reach out to 2 new connections',
    current: 0,
    total: 2,
  },
]

const initialNewChallenges = [
  {
    id: 4,
    name: 'Lisa Wong',
    role: 'Senior SWE @ Meta',
    days: '3 days',
    title: 'Needs Some Love',
    description: 'Encourage/Motivate 5 of your friends',
    creator: 'Lisa Wong',
    due: 'Mar 10th',
    current: 0,
    total: 5,
  },
  {
    id: 5,
    name: 'James Park',
    role: 'Recruiter @ Shopify',
    days: '5 days',
    title: 'How are you?',
    description: 'Log your mood 3 times',
    creator: 'James Park',
    due: 'Mar 12th',
    current: 0,
    total: 3,
  },
  {
    id: 6,
    name: 'James Park',
    role: 'Recruiter @ Shopify',
    days: '5 days',
    title: 'How are you?',
    description: 'Log your mood 3 times',
    creator: 'James Park',
    due: 'Mar 12th',
    current: 0,
    total: 3,
  },
]

export default function Challenges() {
  const [activeChallenges, setActiveChallenges] = useState(initialActiveChallenges)
  const [newChallenges, setNewChallenges] = useState(initialNewChallenges)

  const handleAddChallenge = (challenge) => {
    if (activeChallenges.length >= 5) {
      alert('You can only have 5 active challenges at a time.')
      return
    }
    setActiveChallenges((prev) => [...prev, challenge])
    setNewChallenges((prev) => prev.filter((item) => item.id !== challenge.id))
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