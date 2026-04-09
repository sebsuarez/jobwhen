// components/MentorChallenges.jsx

import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import Card from './Card'
import '../styles/MentorChallenges.css'

const STATUS_ORDER = ['approved', 'in_review', 'rejected']

const STATUS_CONFIG = {
  approved:  { label: 'Approved',  className: 'mentor-challenges__status--approved' },
  in_review: { label: 'In Review', className: 'mentor-challenges__status--review' },
  rejected:  { label: 'Rejected',  className: 'mentor-challenges__status--rejected' },
}

const EMPTY_FORM = {
  title: '',
  deadline: '',
  description: '',
  reward: '',
  reviewNote: '',
}

export default function MentorChallenges() {
  const [challenges, setChallenges] = useState(MOCK_CHALLENGES)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = challenges.filter((c) => c.status === status)
    return acc
  }, {})

  const handleRemove = (id) => {
    setChallenges((prev) => prev.filter((c) => c.id !== id))
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wire to backend — challenge submitted for admin review
    const newChallenge = {
      id: Date.now(),
      title: form.title,
      duration: form.deadline ? `Due ${form.deadline}` : 'No deadline',
      description: form.description,
      reviewNote: form.reviewNote,
      status: 'in_review',
      participants: 0,
      isLoopable: form.isLoopable,
      loopCount: 0,
      maxLoops: form.isLoopable ? Number(form.maxLoops) || null : null,
    }
    setChallenges((prev) => [...prev, newChallenge])
    setForm(EMPTY_FORM)
    setShowCreate(false)
  }

  return (
    <aside className="mentor-challenges">
      <div className="mentor-challenges__header">
        <div>
          <h2 className="mentor-challenges__title">My Active Challenges</h2>
          <p className="mentor-challenges__subtitle">Browse your created challenges</p>
        </div>
        <Button variant="primary" className="mentor-challenges__new-btn" onClick={() => setShowCreate(true)}>+ New Challenge</Button>
      </div>

      {STATUS_ORDER.map((status) => {
        const group = grouped[status]
        if (group.length === 0) return null
        const { label, className } = STATUS_CONFIG[status]

        return (
          <div key={status} className="mentor-challenges__group">
            <p className={`mentor-challenges__status-label ${className}`}>{label}</p>

            {group.map((challenge) => (
              <Card key={challenge.id} className="mentor-challenges__card">
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
                    <Button variant="ghost" className="mentor-challenges__edit-btn" title="Edit">&#9998;</Button>
                  )}
                  {status === 'rejected' && (
                    <Button variant="danger" onClick={() => handleRemove(challenge.id)}>remove</Button>
                  )}
                </div>
                <p className="mentor-challenges__card-desc">{challenge.description}</p>
              </Card>
            ))}
          </div>
        )
      })}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Challenge">
        <form onSubmit={handleSubmit}>
              <div className="mentor-challenges__field">
                <label className="mentor-challenges__label">Challenge Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. One More!"
                  required
                />
              </div>

              <div className="mentor-challenges__field">
                <label className="mentor-challenges__label">Deadline</label>
                <input
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleFormChange}
                />
              </div>

              <div className="mentor-challenges__field">
                <label className="mentor-challenges__label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  required
                />
              </div>

              <div className="mentor-challenges__field">
                <label className="mentor-challenges__label">Review Note (visible to admin only)</label>
                <textarea
                  name="reviewNote"
                  value={form.reviewNote}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="Why should this challenge be approved?"
                />
              </div>

              <div className="mentor-challenges__field">
                <label className="mentor-challenges__label">Reward (XP)</label>
                <input
                  name="reward"
                  type="number"
                  value={form.reward}
                  onChange={handleFormChange}
                  min={0}
                  placeholder="0"
                />
              </div>

              <div className="mentor-challenges__field mentor-challenges__field--row">
                <span className="mentor-challenges__label">Loopable</span>
                <button
                  type="button"
                  className={`mentor-challenges__loopable-btn${form.isLoopable ? ' mentor-challenges__loopable-btn--on' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, isLoopable: !prev.isLoopable, maxLoops: '' }))}>
                  {form.isLoopable ? 'On' : 'Off'}
                </button>

                {form.isLoopable && (
                  <input
                    name="maxLoops"
                    type="number"
                    value={form.maxLoops}
                    onChange={handleFormChange}
                    min={1}
                    placeholder="Max loops"
                    className="mentor-challenges__max-loops"
                  />
                )}
              </div>

              <div className="mentor-challenges__modal-actions">
                <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Submit for Review</Button>
              </div>
            </form>
      </Modal>
    </aside>
  )
}
