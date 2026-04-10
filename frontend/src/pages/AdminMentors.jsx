// pages/AdminMentors.jsx

import { useEffect, useState } from 'react'
import AdminSidebar from "../components/AdminSidebar"
import Button from "../components/Button"
import Modal from "../components/Modal"
import { fetchPendingMentors, approveMentor, rejectMentor } from '../api/adminQueries'
import '../styles/AdminMentors.css'

export default function AdminMentors() {
    const [mentors, setMentors] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        fetchPendingMentors()
            .then(setMentors)
            .finally(() => setLoading(false))
    }, [])

    const handleApprove = async () => {
        await approveMentor(selected.userId)
        setMentors((prev) => prev.filter((m) => m.mentorProfileId !== selected.mentorProfileId))
        setSelected(null)
    }

    const handleReject = async () => {
        await rejectMentor(selected.userId)
        setMentors((prev) => prev.filter((m) => m.mentorProfileId !== selected.mentorProfileId))
        setSelected(null)
    }
    
    if (loading) return null

    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="app-content admin-mentors__main">
                <div className="admin-mentors__header">
                    <h1 className="admin-mentors__title">Mentor Applications</h1>
                    <p className="admin-mentors__subtitle">Users requesting mentor status</p>
                </div>

                <div className="admin-mentors__list">
                    {mentors.map((mentor) => (
                        <div key={mentor.mentorProfileId} className="admin-mentors__card">
                            <div className="admin-mentors__card-info">
                                <span className="admin-mentors__name">{mentor.fullName}</span>
                                <span className="admin-mentors__meta">{mentor.jobTitle} @ {mentor.company}</span>
                            </div>
                            <Button variant="primary" onClick={() => setSelected(mentor)}>
                                Review
                            </Button>
                        </div>
                    ))}
                </div>
            </main>

            <Modal
                isOpen={!!selected}
                onClose={() => setSelected(null)}
                title={selected?.fullName}
            >
                <div className="admin-mentors__modal-field">
                    <span className="admin-mentors__modal-label">Email</span>
                    <p className="admin-mentors__modal-value">{selected?.email}</p>
                </div>
                {selected?.headline && (
                    <div className="admin-mentors__modal-field">
                        <span className="admin-mentors__modal-label">Headline</span>
                        <p className="admin-mentors__modal-value">{selected.headline}</p>
                    </div>
                )}
                <div className="admin-mentors__modal-field">
                    <span className="admin-mentors__modal-label">Job Title</span>
                    <p className="admin-mentors__modal-value">{selected?.jobTitle || '—'}</p>
                </div>
                <div className="admin-mentors__modal-field">
                    <span className="admin-mentors__modal-label">Company</span>
                    <p className="admin-mentors__modal-value">{selected?.company || '—'}</p>
                </div>
                <div className="admin-mentors__modal-field">
                    <span className="admin-mentors__modal-label">Why they want to mentor</span>
                    <p className="admin-mentors__modal-value">{selected?.expertise || '—'}</p>
                </div>
                <div className="admin-mentors__modal-actions">
                    <Button variant="ghost" onClick={handleReject}>Reject</Button>
                    <Button variant="primary" onClick={handleApprove}>Approve</Button>
                </div>
            </Modal>
        </div>
    )
}
