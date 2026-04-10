// pages/AdminChallenges.jsx

import { useEffect, useState } from 'react'
import AdminSidebar from "../components/AdminSidebar"
import Button from "../components/Button"
import Modal from "../components/Modal"
import { fetchPendingChallenges, approveChallenge, rejectChallenge } from '../api/adminQueries'
import '../styles/AdminChallenges.css'

function formatDate(iso) {
    if (!iso) return '—'
    const date = new Date(iso)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(iso) {
    if (!iso) return '—'
    const date = new Date(iso)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        + ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function AdminChallenges() {
    const [challenges, setChallenges] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        fetchPendingChallenges()
            .then(setChallenges)
            .finally(() => setLoading(false))
    }, [])

    const handleApprove = async () => {
        await approveChallenge(selected.challengeId)
        setChallenges((prev) => prev.filter((c) => c.challengeId !== selected.challengeId))
        setSelected(null)
    }

    const handleReject = async () => {
        await rejectChallenge(selected.challengeId)
        setChallenges((prev) => prev.filter((c) => c.challengeId !== selected.challengeId))
        setSelected(null)
    }

    if (loading) return null

    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="app-content admin-challenges__main">
                <div className="admin-challenges__header">
                    <h1 className="admin-challenges__title">Challenge Review</h1>
                    <p className="admin-challenges__subtitle">Challenges pending moderation approval</p>
                </div>

                <div className="admin-challenges__list">
                    {challenges.map((challenge) => (
                        <div key={challenge.challengeId} className="admin-challenges__card">
                            <div className="admin-challenges__card-info">
                                <span className="admin-challenges__card-title">{challenge.title}</span>
                                <span className="admin-challenges__card-meta">By {challenge.mentorName} · Submitted {formatDateTime(challenge.createdAt)}</span>
                            </div>
                            <Button variant="primary" onClick={() => setSelected(challenge)}>
                                Review
                            </Button>
                        </div>
                    ))}
                </div>
            </main>

            <Modal
                isOpen={!!selected}
                onClose={() => setSelected(null)}
                title={selected?.title}
            >
                <div className="admin-challenges__modal-field">
                    <span className="admin-challenges__modal-label">Submitted by</span>
                    <p className="admin-challenges__modal-value">{selected?.mentorName}</p>
                </div>
                <div className="admin-challenges__modal-field">
                    <span className="admin-challenges__modal-label">Description</span>
                    <p className="admin-challenges__modal-value">{selected?.description || '—'}</p>
                </div>
                <div className="admin-challenges__modal-field">
                    <span className="admin-challenges__modal-label">XP Reward</span>
                    <p className="admin-challenges__modal-value">{selected?.xpReward ?? '—'}</p>
                </div>
                <div className="admin-challenges__modal-field">
                    <span className="admin-challenges__modal-label">Target Count</span>
                    <p className="admin-challenges__modal-value">{selected?.defaultTargetCount ?? '—'}</p>
                </div>
                <div className="admin-challenges__modal-field">
                    <span className="admin-challenges__modal-label">Max Completions per User</span>
                    <p className="admin-challenges__modal-value">{selected?.maxCompletionsPerUser ?? '—'}</p>
                </div>
                <div className="admin-challenges__modal-field">
                    <span className="admin-challenges__modal-label">Participant Limit</span>
                    <p className="admin-challenges__modal-value">{selected?.participantLimit ?? 'Unlimited'}</p>
                </div>
                <div className="admin-challenges__modal-field">
                    <span className="admin-challenges__modal-label">Start Date</span>
                    <p className="admin-challenges__modal-value">{formatDate(selected?.startDate)}</p>
                </div>
                <div className="admin-challenges__modal-field">
                    <span className="admin-challenges__modal-label">Due Date</span>
                    <p className="admin-challenges__modal-value">{formatDate(selected?.dueDate)}</p>
                </div>
                <div className="admin-challenges__modal-field">
                    <span className="admin-challenges__modal-label">Submitted</span>
                    <p className="admin-challenges__modal-value">{formatDateTime(selected?.createdAt)}</p>
                </div>
                <div className="admin-challenges__modal-actions">
                    <Button variant="ghost" onClick={handleReject}>Reject</Button>
                    <Button variant="primary" onClick={handleApprove}>Approve</Button>
                </div>
            </Modal>
        </div>
    )
}
