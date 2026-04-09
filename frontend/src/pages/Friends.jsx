// pages/Friends.jsx
import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { fetchMyFriends, sendEncouragement, searchUsers, sendFriendRequest,  fetchPendingRequests, respondToFriendRequest } from '../api/friendQueries'
import '../styles/Friends.css'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [loadingFriends, setLoadingFriends] = useState(true)
  const [pendingRequests, setPendingRequests] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [sentRequests, setSentRequests] = useState({})
  const [encouragements, setEncouragements] = useState({})
  const [notification, setNotification] = useState('')

  useEffect(() => {
    fetchMyFriends()
      .then(setFriends)
      .catch((err) => console.error('Failed to load friends:', err))
      .finally(() => setLoadingFriends(false))

    fetchPendingRequests()
      .then(setPendingRequests)
      .catch((err) => console.error('Failed to load pending requests:', err))
  }, [])

  const handleRespondToRequest = async (request, accept) => {
    try {
      await respondToFriendRequest(request.friendshipId, accept)
      setPendingRequests((prev) => prev.filter((r) => r.friendshipId !== request.friendshipId))
      if (accept) {
        setFriends((prev) => [...prev, { userId: request.userId, fullName: request.fullName, headline: request.headline, currentLevel: request.currentLevel }])
        setNotification(`You are now friends with ${request.fullName}`)
      } else {
        setNotification(`Declined request from ${request.fullName}`)
      }
    } catch (err) {
      setNotification(err.message || 'Failed to respond to request')
    }
  }

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)
    setSearchResults([])

    if (query.length < 2) return

    setSearchLoading(true)
    try {
      const results = await searchUsers(query)
      setSearchResults(results)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSendRequest = async (user) => {
    try {
      await sendFriendRequest(user.userId)
      setSentRequests((prev) => ({ ...prev, [user.userId]: true }))
      setNotification(`Friend request sent to ${user.fullName}`)
    } catch (err) {
      setNotification(err.message || `Failed to send request to ${user.fullName}`)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

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
      setNotification(err.message || `Failed to encourage ${friend.fullName}`)
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

          {pendingRequests.length > 0 && (
            <div className="pending-requests">
              <h2 className="pending-requests__title">Friend Requests ({pendingRequests.length})</h2>
              <div className="pending-requests__list">
                {pendingRequests.map((request) => (
                  <div key={request.friendshipId} className="pending-request-card">
                    <div className="pending-request-card__info">
                      <span className="pending-request-card__name">{request.fullName}</span>
                      <span className="pending-request-card__headline">{request.headline}</span>
                    </div>
                    <div className="pending-request-card__actions">
                      <Button variant="ghost" onClick={() => handleRespondToRequest(request, false)}>Decline</Button>
                      <Button variant="primary" onClick={() => handleRespondToRequest(request, true)}>Accept</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="friends-list">
            {loadingFriends ? (
              <p className="friends-panel__empty">Loading friends...</p>
            ) : friends.length === 0 ? (
              <p className="friends-panel__empty">No friends yet, go add some!</p>
            ) : friends.map((friend) => {
              const encouragement = encouragements[friend.userId]

              return (
                <Card key={friend.userId} className="friend-card">
                  <div className="friend-card__left">
                    <div className="friend-card__avatar" />
                    <div className="friend-card__info">
                      <h3 className="friend-card__name">{friend.fullName}</h3>
                      <p className="friend-card__status">{friend.headline}</p>

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
                      <span className="friend-card__value">Lv. {friend.currentLevel}</span>
                      <span className="friend-card__label">Level</span>
                    </div>

                    <Button
                      variant="ghost"
                      className="friend-card__btn"
                      onClick={() => handleEncourage(friend)}>Encourage</Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Friend">
        <div className="friends-modal">
          <label className="friends-modal__label">Search by name or email</label>
          <input
            className="friends-modal__input"
            type="text"
            placeholder="Enter name or email"
            value={searchQuery}
            onChange={handleSearch}
          />

          {searchLoading && <p className="friends-modal__status">Searching...</p>}

          {searchResults.length > 0 && (
            <div className="friends-modal__results">
              {searchResults.map((user) => (
                <div key={user.userId} className="friends-modal__result">
                  <div className="friends-modal__result-info">
                    <span className="friends-modal__result-name">{user.fullName}</span>
                    <span className="friends-modal__result-email">{user.email}</span>
                  </div>
                  <Button
                    variant="primary"
                    disabled={sentRequests[user.userId]}
                    onClick={() => handleSendRequest(user)}>
                    {sentRequests[user.userId] ? 'Sent' : 'Add'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="friends-modal__status">No users found.</p>
          )}

          <div className="friends-modal__actions">
            <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
          </div>
        </div>
      </Modal>
       {notification && <div className="notification-popup">{notification}</div>}
    </div>
  )
}