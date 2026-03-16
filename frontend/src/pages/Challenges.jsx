// pages/Challenges.jsx

import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import '../styles/Challenges.css'

const activeChallenges = [
  {
    id: 1,
    title: 'Apply-a-thon',
    creator: 'Dr Chen',
    due: 'Mar 2nd',
    description: 'Submit 5 applications this week',
    progressText: '3/5',
    progressPercent: 60,
  },
  {
    id: 2,
    title: 'Interview Prep Sprint',
    creator: 'Lisa Wong',
    due: 'Mar 5th',
    description: 'Complete 3 mock interview questions',
    progressText: '1/3',
    progressPercent: 33,
  },
  {
    id: 3,
    title: 'Network Boost',
    creator: 'James Park',
    due: 'Mar 7th',
    description: 'Reach out to 2 new connections',
    progressText: '0/2',
    progressPercent: 0,
  },
]

const newChallenges = [
  {
    id: 1,
    name: 'Lisa Wong',
    role: 'Senior SWE @ Meta',
    days: '3 days',
    title: 'Needs Some Love',
    description: 'Encourage/Motivate 5 of your friends',
  },
  {
    id: 2,
    name: 'James Park',
    role: 'Recruiter @ Shopify',
    days: '5 days',
    title: 'How are you?',
    description: 'Log your mood 3 times',
  },
  {
    id: 3,
    name: 'James Park',
    role: 'Recruiter @ Shopify',
    days: '5 days',
    title: 'How are you?',
    description: 'Log your mood 3 times',
  },
]

export default function Challenges() {
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

                  <Button variant="danger" className="challenge-card__remove">
                    Remove
                  </Button>
                </div>

                <p className="challenge-card__description">
                  {challenge.description}
                </p>

                <div className="challenge-card__progress-row">
                  <span className="challenge-card__progress-text">
                    {challenge.progressText}
                  </span>
                </div>

                <div className="challenge-card__progress">
                  <div
                    className="challenge-card__progress-fill"
                    style={{ width: `${challenge.progressPercent}%` }}
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
                        <h3 className="new-challenge-card__name">{challenge.name}</h3>
                        <p className="new-challenge-card__role">{challenge.role}</p>
                      </div>
                    </div>

                    <span className="new-challenge-card__days">{challenge.days}</span>
                  </div>

                  <h4 className="new-challenge-card__title">{challenge.title}</h4>
                  <p className="new-challenge-card__desc">{challenge.description}</p>

                  <Button variant="primary" className="new-challenge-card__btn">
                    ADD
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}