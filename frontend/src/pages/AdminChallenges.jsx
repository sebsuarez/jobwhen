// pages/AdminChallenges.jsx

import { useState } from 'react'
import AdminSidebar from "../components/AdminSidebar"
import Modal from "../components/Modal"
import '../styles/AdminChallenges.css'

const PENDING_CHALLENGES = [
    { id: 1, title: 'Cold Email Challenge', submittedBy: 'Dr Chen', submittedAt: '2h ago' },
    { id: 2, title: 'Mock Interview: Behavioural', submittedBy: 'Prof. Liu', submittedAt: '5h ago' },
    { id: 3, title: 'LinkedIn Profile Audit', submittedBy: 'Jane S.', submittedAt: '1d ago' },
]

export default function AdminChallenges() {
    const [selected, setSelected] = useState(null)

    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="app-content admin-challenges__main">
                <div className="admin-challenges__header">
                    <h1 className="admin-challenges__title">Challenge Review</h1>
                    <p className="admin-challenges__subtitle">Challenges pending moderation approval</p>
                </div>

                <div className="admin-challenges__list">
                    {PENDING_CHALLENGES.map((challenge) => (
                        <div key={challenge.id} className="admin-challenges__card">
                            <div className="admin-challenges__card-info">
                                <span className="admin-challenges__card-title">{challenge.title}</span>
                                <span className="admin-challenges__card-meta">By {challenge.submittedBy} · {challenge.submittedAt}</span>
                            </div>
                            <button className="btn btn--primary" onClick={() => setSelected(challenge)}>
                                Review
                            </button>
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
                    <button className="btn btn--ghost" onClick={() => setSelected(null)}>Reject</button>
                    <button className="btn btn--primary" onClick={() => setSelected(null)}>Approve</button>
                </div>
            </Modal>
        </div>
    )
}
