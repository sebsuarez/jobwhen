// components/MentorChallenges.jsx

import { useState } from 'react'
import '../styles/MentorChallenges.css'

const STATUS_ORDER = ['approved', 'in_review', 'rejected']

const STATUS_CONFIG = {
  approved:  { label: 'Approved',  className: 'mentor-challenges__status--approved' },
  in_review: { label: 'In Review', className: 'mentor-challenges__status--review' },
  rejected:  { label: 'Rejected',  className: 'mentor-challenges__status--rejected' },
}

// TODO: replace with real API data once backend is ready
const MOCK_CHALLENGES = [
  {
    id: 1,
    title: 'Apply-a-thon',
    duration: '5 Days',
    description: 'Submit 5 applications this week',
    reviewNote: 'Encourages consistent application habits over a short sprint.',
    status: 'approved',
    participants: 12,
    isLoopable: true,
    loopCount: 3,
    maxLoops: 5,
  },
  {
    id: 2,
    title: 'Apply-a-thon',
    duration: '5 Days',
    description: 'Submit 5 applications this week',
    reviewNote: 'Great for students who need a push to get started.',
    status: 'approved',
    participants: 8,
    isLoopable: false,
    loopCount: 0,
    maxLoops: null,
  },
  {
    id: 3,
    title: 'Apply-a-thon',
    duration: '5 Days',
    description: 'Submit 5 applications this week',
    reviewNote: 'Intended to build momentum early in the job search process.',
    status: 'in_review',
    participants: 0,
    isLoopable: true,
    loopCount: 0,
    maxLoops: 3,
  },
  {
    id: 4,
    title: 'Apply-a-thon',
    duration: '5 Days',
    description: 'Submit 5 applications this week',
    reviewNote: 'Motivates students to apply broadly across different industries.',
    status: 'rejected',
    participants: 0,
    isLoopable: false,
    loopCount: 0,
    maxLoops: null,
  },
]

export default function MentorChallenges() {
  const [challenges, setChallenges] = useState(MOCK_CHALLENGES)

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = challenges.filter((c) => c.status === status)
    return acc
  }, {})

  const handleRemove = (id) => {
    setChallenges((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <aside className="mentor-challenges">
      <div className="mentor-challenges__header">
        <div>
          <h2 className="mentor-challenges__title">My Active Challenges</h2>
          <p className="mentor-challenges__subtitle">Browse your created challenges</p>
        </div>
        <button className="mentor-challenges__new-btn">+ New Challenge</button>
      </div>

      {STATUS_ORDER.map((status) => {
        const group = grouped[status]
        if (group.length === 0) return null
        const { label, className } = STATUS_CONFIG[status]

        return (
          <div key={status} className="mentor-challenges__group">
            <p className={`mentor-challenges__status-label ${className}`}>{label}</p>

            {group.map((challenge) => (
              <div key={challenge.id} className="mentor-challenges__card">
                <div className="mentor-challenges__card-header">
                  <div>
                    <h3 className="mentor-challenges__card-title">{challenge.title}</h3>
                    <p className="mentor-challenges__card-duration">{challenge.duration}</p>
                  </div>

                  {status === 'approved' && (
                    <span className="mentor-challenges__participants">
                      Participants: {challenge.participants}
                    </span>
                  )}
                  {status === 'in_review' && (
                    <button className="mentor-challenges__edit-btn" title="Edit">&#9998;</button>
                  )}
                  {status === 'rejected' && (
                    <button
                      className="mentor-challenges__remove-btn"
                      onClick={() => handleRemove(challenge.id)}>
                      remove
                    </button>
                  )}
                </div>
                <p className="mentor-challenges__card-desc">{challenge.description}</p>
              </div>
            ))}
          </div>
        )
      })}
    </aside>
  )
}
