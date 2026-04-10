// pages/Profile.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth'
import { fetchProfileInsights, updateProfile } from '../api/profileQueries'
import { fetchJobApplications } from '../api/boardQueries'
import { fetchCompletedChallengesCount } from '../api/challengeQueries'
import '../styles/Profile.css'

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
  const location = useLocation()
  const { user, refreshUser, logout } = useAuth()

  const [editOpen, setEditOpen] = useState(() => !!location.state?.openEditModal)
  const [draftName, setDraftName] = useState('')
  const [draftHeadline, setDraftHeadline] = useState('')
  const [draftLocation, setDraftLocation] = useState('')
  const [draftEmoji, setDraftEmoji] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileStats, setProfileStats] = useState({
    applications: 0,
    badges: 0,
    challengesCompleted: 0,
  })

  useEffect(() => {
    if (!user) return

    let cancelled = false

    Promise.all([
      fetchProfileInsights(),
      fetchJobApplications(user.userId),
      fetchCompletedChallengesCount(),
    ])
      .then(([insights, applications, challengesCompleted]) => {
        if (cancelled) return
        setProfileStats({
          applications: applications.length,
          badges: insights.myBadges.length,
          challengesCompleted,
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  useEffect(() => {
    if (editOpen && user) {
      setDraftName(user.fullName ?? '')
      setDraftHeadline(user.headline ?? '')
      setDraftLocation(user.location ?? '')
      setDraftEmoji(user.avatar ?? '')
    }
  }, [editOpen, user])

  const openEdit = () => setEditOpen(true)

  const handleSave = async () => {
    if (!draftName.trim()) {
      setProfileError('Display Name is required.')
      return
    }
    setProfileError('')
    setSaving(true)
    try {
      await updateProfile({
        fullName: draftName.trim() || undefined,
        headline: draftHeadline.trim() || undefined,
        location: draftLocation.trim() || undefined,
        avatar: draftEmoji || undefined,
      })
      await refreshUser()
      setEditOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const currentLevel = user?.currentLevel ?? 1
  const currentXp = user?.currentXp ?? 0
  const xpPerLevel = 60
  const xpIntoLevel = currentXp % xpPerLevel
  const progressPercent = Math.min((xpIntoLevel / xpPerLevel) * 100, 100)

  const stats = [
    { label: 'Total XP', value: String(currentXp), className: 'profile-stat__value--xp' },
    { label: 'Applications', value: String(profileStats.applications), className: 'profile-stat__value--applications' },
    { label: 'Badges Achieved', value: String(profileStats.badges), className: 'profile-stat__value--badges' },
    { label: 'Challenges Completed', value: String(profileStats.challengesCompleted), className: 'profile-stat__value--challenges' },
  ]

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
                {user?.headline && <p>{user.headline}</p>}
                {user?.location && <p>{user.location}</p>}
              </div>

              <Button className="profile-card__logout" type="button" onClick={handleLogout}>
                Log Out
              </Button>
            </Card>

          </div>

          <div className="profile-layout__right">
            <Card className="profile-level">
              <div className="profile-level__top">
                <h2 className="profile-level__title">Level {currentLevel}</h2>
                <span className="profile-level__xp">XP {xpIntoLevel}/{xpPerLevel}</span>
              </div>

              <div className="profile-level__bar">
                <div className="profile-level__fill" style={{ width: `${progressPercent}%` }} />
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

      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setProfileError('') }} title="Edit Profile">
        <div className="profile-edit">
          <div className="profile-edit__preview">
            <div className="profile-edit__avatar-preview">
              {draftEmoji || <span className="profile-edit__avatar-placeholder">?</span>}
            </div>
            <p className="profile-edit__preview-name">{draftName || 'Your Name'}</p>
          </div>

          <label className="profile-edit__label">Display Name *</label>
          <input
            className="profile-edit__name-input"
            type="text"
            value={draftName}
            onChange={(e) => { setDraftName(e.target.value); setProfileError('') }}
            placeholder="Enter display name"
            maxLength={40}
          />
          {profileError && <p className="profile-edit__error">{profileError}</p>}

          <label className="profile-edit__label">Headline</label>
          <input
            className="profile-edit__name-input"
            type="text"
            value={draftHeadline}
            onChange={(e) => setDraftHeadline(e.target.value)}
            placeholder="e.g. Software Engineer at Amazon"
            maxLength={100}
          />

          <label className="profile-edit__label">Location</label>
          <input
            className="profile-edit__name-input"
            type="text"
            value={draftLocation}
            onChange={(e) => setDraftLocation(e.target.value)}
            placeholder="e.g. Calgary, AB"
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
