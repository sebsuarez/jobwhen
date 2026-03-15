// pages/Friends.jsx
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import '../styles/Friends.css'

// TODO: REPLACE THIS WITH REAL DATA FROM BACKEND ONCE SETUP!
const friends = [
  {
    id: 1,
    name: 'Armin S.',
    status: 'Google, Hire Me!',
    applied: 10,
    level: 7,
  },
  {
    id: 2,
    name: 'Ryan O.',
    status: 'Rejected Again :(',
    applied: 20,
    level: 13,
  },
  {
    id: 3,
    name: 'Jason N.',
    status: 'Just got HIRED!',
    applied: 67,
    level: 20,
  },
  {
    id: 4,
    name: 'Sebastian S.',
    status: 'Interviewing Tomorrow',
    applied: 10,
    level: 10,
  },
  {
    id: 5,
    name: 'Omar A.',
    status: 'Grinding Today',
    applied: 13,
    level: 5,
  },
]

export default function Friends() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="friends-page">
      <Sidebar />

      <main className="friends-page__main">
        <section className="friends-panel">
          <div className="friends-panel__header">
            <div>
              <h1 className="friends-panel__title">Friends</h1>
              <p className="friends-panel__subtitle">
                Stay accountable and cheer each other on
              </p>
            </div>

            <Button
              variant="primary"
              className="friends-panel__add-btn"
              onClick={() => setIsModalOpen(true)}
            >
              Add Friend
            </Button>
          </div>

          <div className="friends-list">
            {friends.map((friend) => (
              <Card key={friend.id} className="friend-card">
                <div className="friend-card__left">
                  <div className="friend-card__avatar" />
                  <div className="friend-card__info">
                    <h3 className="friend-card__name">{friend.name}</h3>
                    <p className="friend-card__status">{friend.status}</p>
                  </div>
                </div>

                <div className="friend-card__right">
                  <div className="friend-card__stat">
                    <span className="friend-card__value">{friend.applied}</span>
                    <span className="friend-card__label">Applied</span>
                  </div>

                  <div className="friend-card__stat">
                    <span className="friend-card__value">Lv. {friend.level}</span>
                    <span className="friend-card__label">Level</span>
                  </div>

                  <Button variant="secondary" className="friend-card__btn">
                    Encourage
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Friend"
      >
        <div className="friends-modal">
          <label className="friends-modal__label">Friend Username or Email</label>
          <input
            className="friends-modal__input"
            type="text"
            placeholder="Enter username or email"
          />

          <div className="friends-modal__actions">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">Send Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}