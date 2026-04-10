// components/MentorChallenges.jsx

import { useEffect, useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import Card from './Card'
import { fetchMyCreatedChallenges, createChallenge, deleteChallenge } from '../api/challengeQueries'
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
  targetCount: '1',
  maxCompletionsPerUser: '1',
  reviewNote: '',
}

export default function MentorChallenges({ openCreate = false }) {
  const today = new Date().toISOString().split('T')[0]
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(openCreate)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyCreatedChallenges()
      .then(setChallenges)
      .finally(() => setLoading(false))
  }, [])

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = challenges.filter((c) => c.challengeStatus === status)
    return acc
  }, {})

  const handleRemove = async (challengeId) => {
    setDeleting(challengeId)
    try {
      const result = await deleteChallenge(challengeId)
      if (result.ok) {
        setChallenges((prev) => prev.filter((c) => c.challengeId !== challengeId))
      }
    } finally {
      setDeleting(null)
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'deadline') {
      e.target.setCustomValidity('')
    }
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    if (form.deadline < today) {
      const deadlineInput = e.currentTarget.elements.deadline
      deadlineInput.setCustomValidity("Users can't accept challenges back in time!")
      deadlineInput.reportValidity()
      setSubmitting(false)
      return
    }
    try {
      const result = await createChallenge({
        title: form.title.trim(),
        description: form.description.trim(),
        xpReward: form.reward ? parseInt(form.reward) : null,
        defaultTargetCount: form.targetCount ? parseInt(form.targetCount, 10) : 1,
        maxCompletionsPerUser: form.maxCompletionsPerUser ? parseInt(form.maxCompletionsPerUser, 10) : 1,
        dueDate: form.deadline || null,
      })
      if (result.ok) {
        const updated = await fetchMyCreatedChallenges()
        setChallenges(updated)
        setForm(EMPTY_FORM)
        setShowCreate(false)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

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
              <Card key={challenge.challengeId} className="mentor-challenges__card">
                <div className="mentor-challenges__card-header">
                  <div>
                    <h3 className="mentor-challenges__card-title">{challenge.title}</h3>
                    {challenge.dueDate && (
                      <p className="mentor-challenges__card-duration">Due {challenge.dueDate}</p>
                    )}
                  </div>

                  {status === 'approved' && challenge.participantLimit && (
                    <span className="mentor-challenges__participants">
                      Limit: {challenge.participantLimit}
                    </span>
                  )}
                  {/* TODO: wire to updateChallenge mutation */}
                  {status === 'in_review' && (
                    <Button variant="ghost" className="mentor-challenges__edit-btn" title="Edit">&#9998;</Button>
                  )}
                  {status === 'rejected' && (
                    <Button variant="danger" onClick={() => handleRemove(challenge.challengeId)} disabled={deleting === challenge.challengeId}>
                      {deleting === challenge.challengeId ? 'Removing...' : 'Remove'}
                    </Button>
                  )}
                </div>
                <p className="mentor-challenges__card-desc">{challenge.description}</p>
                <p className="mentor-challenges__card-desc">Target: {challenge.defaultTargetCount}</p>
                <p className="mentor-challenges__card-desc">Repeat limit: {challenge.maxCompletionsPerUser}</p>
              </Card>
            ))}
          </div>
        )
      })}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setError('') }} title="Create New Challenge">
        <form className="mentor-challenges__form" onSubmit={handleSubmit}>
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
                  required
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

              {/* TODO: wire reviewNote to backend when supported
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
              */}

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

              <div className="mentor-challenges__field">
                <label className="mentor-challenges__label">Target Count</label>
                <input
                  name="targetCount"
                  type="number"
                  value={form.targetCount}
                  onChange={handleFormChange}
                  min={1}
                  placeholder="1"
                  required
                />
              </div>

              <div className="mentor-challenges__field">
                <label className="mentor-challenges__label">Repeat Limit Per User</label>
                <input
                  name="maxCompletionsPerUser"
                  type="number"
                  value={form.maxCompletionsPerUser}
                  onChange={handleFormChange}
                  min={1}
                  placeholder="1"
                  required
                />
              </div>

              {/* TODO: wire isLoopable/maxLoops to backend when supported
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
              */}

              {error && <p style={{ color: 'var(--error, #f87171)', fontSize: 'var(--text-sm)' }}>{error}</p>}

              <div className="mentor-challenges__modal-actions">
                <Button variant="ghost" type="button" onClick={() => { setShowCreate(false); setError('') }}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </div>
            </form>
      </Modal>
    </aside>
  )
}
