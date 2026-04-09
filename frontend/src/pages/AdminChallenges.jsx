// pages/AdminChallenges.jsx

import { useEffect, useState } from 'react'
import AdminSidebar from "../components/AdminSidebar"
import Button from "../components/Button"
import Modal from "../components/Modal"
import { fetchPendingChallenges } from '../api/adminQueries'
import '../styles/AdminChallenges.css'

export default function AdminChallenges() {
    const [challenges, setChallenges] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        fetchPendingChallenges()
            .then(setChallenges)
            .finally(() => setLoading(false))
    }, [])

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
                                <span className="admin-challenges__card-meta">By {challenge.mentorName} · {challenge.createdAt}</span>
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
                <p className="admin-challenges__modal-meta">By {selected?.submittedBy} · {selected?.submittedAt}</p>
                <div className="admin-challenges__modal-actions">
                    <Button variant="ghost" onClick={() => setSelected(null)}>Reject</Button>
                    <Button variant="primary" onClick={() => setSelected(null)}>Approve</Button>
                </div>
            </Modal>
        </div>
    )
}
