// pages/Friends.jsx
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { fetchMyFriends, sendEncouragement, searchUsers, sendFriendRequest, fetchPendingRequests, respondToFriendRequest, removeFriend } from '../api/friendQueries'
import '../styles/Friends.css'

export default function Friends() {
  const location = useLocation()
  const [friends, setFriends] = useState([])
  const [loadingFriends, setLoadingFriends] = useState(true)
  const [pendingRequests, setPendingRequests] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(() => !!location.state?.openAddFriend)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [sentRequests, setSentRequests] = useState({})
  const [encouraged, setEncouraged] = useState({})
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [notification, setNotification] = useState('')

  useEffect(() => {
    fetchMyFriends()
      .then((data) => {
        setFriends(data)
        const alreadyEncouraged = {}
        data.forEach((f) => { if (f.youEncouraged) alreadyEncouraged[f.userId] = true })
        setEncouraged(alreadyEncouraged)
      })
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
      setEncouraged((prev) => ({ ...prev, [friend.userId]: true }))
      setNotification(`You encouraged ${friend.fullName}`)
    } catch (err) {
      setNotification(err.message || `Failed to encourage ${friend.fullName}`)
    }
  }

  const handleRemoveFriend = async (friend) => {
    try {
      await removeFriend(friend.userId)
      setFriends((prev) => prev.filter((f) => f.userId !== friend.userId))
      setSelectedFriend(null)
      setNotification(`${friend.fullName} has been removed from your friends.`)
    } catch (err) {
      setNotification(err.message || `Failed to remove ${friend.fullName}`)
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
            {loadingFriends ? (
              <p className="friends-panel__empty">Loading friends...</p>
            ) : friends.length === 0 ? (
              <p className="friends-panel__empty">No friends yet, go add some!</p>
            ) : friends.map((friend) => {
              return (
                <Card key={friend.userId} className="friend-card" onClick={() => setSelectedFriend(friend)}>
                  <div className="friend-card__left">
                    <div className="friend-card__avatar">
                      {friend.avatar && <span className="friend-card__avatar-emoji">{friend.avatar}</span>}
                    </div>
                    <div className="friend-card__info">
                      <div className="friend-card__name-row">
                        <h3 className="friend-card__name">{friend.fullName}</h3>
                        {friend.roleName === 'mentor' && <span className="friend-card__role-badge">Mentor</span>}
                      </div>
                      {friend.headline && <p className="friend-card__status">{friend.headline}</p>}
                      {friend.location && <p className="friend-card__status">{friend.location}</p>}

                    </div>
                  </div>

                  {friend.encouragedYou && (
                    <span className="friend-card__encouraged-you">{friend.fullName.split(' ')[0]} has Encouraged you!</span>
                  )}

                  <div className="friend-card__right">
                    {friend.roleName === 'job_seeker' && (
                      <div className="friend-card__stat">
                        <span className="friend-card__value friend-card__value--accent">{friend.applicationCount ?? 0}</span>
                        <span className="friend-card__label">Applied</span>
                      </div>
                    )}
                    <div className="friend-card__stat">
                      <span className="friend-card__value">Lv. {friend.currentLevel}</span>
                      <span className="friend-card__label">Level</span>
                    </div>

                    <Button
                      variant="ghost"
                      className="friend-card__btn"
                      disabled={!!encouraged[friend.userId]}
                      onClick={(e) => { e.stopPropagation(); handleEncourage(friend) }}>{encouraged[friend.userId] ? 'Encouraged' : 'Encourage'}</Button>
                  </div>
                </Card>
              )
            })}
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

      <Modal
        isOpen={!!selectedFriend}
        onClose={() => setSelectedFriend(null)}
        title="Friend Profile">
        {selectedFriend && (
          <div className="friend-profile-modal">
            <div className="friend-profile-modal__avatar">
              {selectedFriend.avatar
                ? <span className="friend-profile-modal__avatar-emoji">{selectedFriend.avatar}</span>
                : null}
            </div>

            <div className="friend-profile-modal__name-row">
              <h3 className="friend-profile-modal__name">{selectedFriend.fullName}</h3>
              {selectedFriend.roleName === 'mentor' && <span className="friend-card__role-badge">Mentor</span>}
            </div>

            {selectedFriend.headline && (
              <p className="friend-profile-modal__detail">{selectedFriend.headline}</p>
            )}
            {selectedFriend.location && (
              <p className="friend-profile-modal__detail">{selectedFriend.location}</p>
            )}

            <div className="friend-profile-modal__stats">
              {selectedFriend.roleName === 'job_seeker' && (
                <div className="friend-card__stat">
                  <span className="friend-card__value friend-card__value--accent">{selectedFriend.applicationCount ?? 0}</span>
                  <span className="friend-card__label">Applied</span>
                </div>
              )}
              <div className="friend-card__stat">
                <span className="friend-card__value">Lv. {selectedFriend.currentLevel}</span>
                <span className="friend-card__label">Level</span>
              </div>
            </div>

            <div className="friend-profile-modal__actions">
              <Button variant="ghost" onClick={() => setSelectedFriend(null)}>Close</Button>
              <Button variant="danger" onClick={() => handleRemoveFriend(selectedFriend)}>Remove Friend</Button>
            </div>
          </div>
        )}
      </Modal>

       {notification && <div className="notification-popup">{notification}</div>}
    </div>
  )
}