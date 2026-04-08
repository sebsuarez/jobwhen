// pages/Friends.jsx
import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { fetchMyFriends, sendEncouragement } from '../api/friendQueries'
import '../styles/Friends.css'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [loadingFriends, setLoadingFriends] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [encouragements, setEncouragements] = useState({})
  const [notification, setNotification] = useState('')

  useEffect(() => {
    fetchMyFriends()
      .then(setFriends)
      .catch((err) => console.error('Failed to load friends:', err))
      .finally(() => setLoadingFriends(false))
  }, [])

  const handleEncourage = async (friend) => {
    try {
      await sendEncouragement(friend.userId)
      setEncouragements((prev) => {
        const existing = prev[friend.userId]
        return {
          ...prev,
          [friend.userId]: { count: existing ? existing.count + 1 : 1 },
        }
      })
      setNotification(`You encouraged ${friend.fullName}`)
    } catch (err) {
      setNotification(`Failed to encourage ${friend.fullName}`)
    }
  }

  useEffect(() => {
    if (!notification) return

    const timer = setTimeout(() => {
      setNotification('')}, 2000)

    return () => clearTimeout(timer)}, [notification])

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
              onClick={() => setIsModalOpen(true)}>Add Friend</Button>
      
          </div>

          <div className="friends-list">
            {friends.map((friend) => {
              const encouragement = encouragements[friend.id]

              return (
                <Card key={friend.id} className="friend-card">
                  <div className="friend-card__left">
                    <div className="friend-card__avatar" />
                    <div className="friend-card__info">
                      <h3 className="friend-card__name">{friend.name}</h3>
                      <p className="friend-card__status">{friend.status}</p>

                      {encouragement && (
                        <div className="friend-encouragement">
                          <span className="friend-encouragement__count">
                            {encouragement.count} encouragement
                            {encouragement.count > 1 ? 's' : ''} sent
                          </span>
                        </div>
                      )}
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

                    <Button
                      variant="ghost"
                      className="friend-card__btn"
                      onClick={() => handleEncourage(friend)}>Encourge</Button>
      
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Friend">
        <div className="friends-modal">
          <label className="friends-modal__label">Friend Username or Email</label>
          <input
            className="friends-modal__input"
            type="text"
            placeholder="Enter username or email"/>
          <div className="friends-modal__actions">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">Send Request</Button>
          </div>
        </div>
      </Modal>
       {notification && <div className="notification-popup">{notification}</div>}
    </div>
  )
}