// pages/Profile.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth'
import { updateProfile } from '../api/profileQueries'
import '../styles/Profile.css'

const stats = [
  { label: 'Total XP', value: '2100', className: 'profile-stat__value--xp' },
  { label: 'Applications', value: '10', className: 'profile-stat__value--applications' },
  { label: 'Badges Achieved', value: '6', className: 'profile-stat__value--badges' },
  { label: 'Challenges Completed', value: '7', className: 'profile-stat__value--challenges' },
  { label: 'Friends', value: '3', className: 'profile-stat__value--friends' },
  { label: 'Friends Encouraged', value: '13', className: 'profile-stat__value--encouraged' },
]

const EMOJIS = [
  // Faces
  '😀','😂','😍','😎','🥳','😴','🤔','😤','🥰','😭','🤩','🥺',
  // Animals
  '🐶','🐱','🐻','🦊','🐼','🐨','🐯','🦁','🦝','🐸','🦄','🐺',
  // Nature & objects
  '🌟','🔥','💎','🎯','🚀','⚡','🌈','🍀','👾','🎮','💻','🎵',
  // Food & fun
  '🍕','🍜','🧃','🍉','🎂','🧁','🍩','☕','🏆','🎲','🎸','🛸',
]

export default function Profile() {
  const navigate = useNavigate()
  const { user, refreshUser, logout } = useAuth()

  const [editOpen, setEditOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftHeadline, setDraftHeadline] = useState('')
  const [draftEmoji, setDraftEmoji] = useState('')
  const [saving, setSaving] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const openEdit = () => {
    setDraftName(user?.fullName ?? '')
    setDraftHeadline(user?.headline ?? '')
    setDraftEmoji(user?.avatar ?? '')
    setEditOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        fullName: draftName.trim() || undefined,
        headline: draftHeadline.trim() || undefined,
        avatar: draftEmoji || undefined,
      })
      await refreshUser()
      setEditOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-page">
      <Sidebar />

      <main className="profile-page__main">
        <div className="profile-layout">
          <div className="profile-layout__left">
            <Card className="profile-card">
              <button className="profile-card__edit" type="button" aria-label="Edit profile" onClick={openEdit}>
                ✎
              </button>

              <div className="profile-card__avatar">
                {user?.avatar && <span className="profile-card__avatar-emoji">{user.avatar}</span>}
              </div>

              <h1 className="profile-card__name">{user?.fullName ?? 'User'}</h1>

              <div className="profile-card__details">
                <p>{user?.email ?? 'No email available'}</p>
                <p>{user?.role?.roleName ?? 'job_seeker'}</p>
              </div>

              <Button className="profile-card__logout" type="button" onClick={handleLogout}>
                Log Out
              </Button>
            </Card>

            <Card className="profile-bio">
              <h2 className="profile-section__title">Bio</h2>

              <div className="profile-bio__input-wrap">
                <input
                  type="text"
                  placeholder="e.g. Grinding Today!"
                  className="profile-bio__input"
                />
              </div>
            </Card>
          </div>

          <div className="profile-layout__right">
            <Card className="profile-level">
              <div className="profile-level__top">
                <h2 className="profile-level__title">Level 7</h2>
                <span className="profile-level__xp">XP 300/500</span>
              </div>

              <div className="profile-level__bar">
                <div className="profile-level__fill" />
              </div>
            </Card>

            <Card className="profile-stats">
              <h2 className="profile-section__title">Stats</h2>

              <div className="profile-stats__grid">
                {stats.map((stat) => (
                  <div key={stat.label} className="profile-stat">
                    <p className="profile-stat__label">{stat.label}</p>
                    <p className={`profile-stat__value ${stat.className}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="profile-edit">
          <div className="profile-edit__preview">
            <div className="profile-edit__avatar-preview">
              {draftEmoji || <span className="profile-edit__avatar-placeholder">?</span>}
            </div>
            <p className="profile-edit__preview-name">{draftName || 'Your Name'}</p>
          </div>

          <label className="profile-edit__label">Display Name</label>
          <input
            className="profile-edit__name-input"
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Enter display name"
            maxLength={40}
          />

          <label className="profile-edit__label">Headline</label>
          <input
            className="profile-edit__name-input"
            type="text"
            value={draftHeadline}
            onChange={(e) => setDraftHeadline(e.target.value)}
            placeholder="e.g. Software Engineer at Amazon"
            maxLength={100}
          />

          <label className="profile-edit__label">Choose an Emoji Avatar</label>
          <div className="profile-edit__emoji-grid">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`profile-edit__emoji-btn${draftEmoji === emoji ? ' profile-edit__emoji-btn--selected' : ''}`}
                onClick={() => setDraftEmoji(emoji)}
                aria-label={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="profile-edit__actions">
            <Button type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
