// pages/AdminMentors.jsx

import { useState } from 'react'
import AdminSidebar from "../components/AdminSidebar"
import Modal from "../components/Modal"
import '../styles/AdminMentors.css'

const PENDING_MENTORS = [
    { id: 1, name: 'Celine Y.', jobTitle: 'SWE', company: 'Replit', notes: 'I want to help students break into the tech industry by sharing my experience landing roles at fast-growing startups.' },
    { id: 2, name: 'Marcus T.', jobTitle: 'Product Manager', company: 'Shopify', notes: 'Passionate about helping new grads navigate the PM interview process and build strong portfolios.' },
    { id: 3, name: 'Priya K.', jobTitle: 'Data Scientist', company: 'Google', notes: 'I went through a tough job search myself and want to give back by coaching others on resumes and interviews.' },
]

export default function AdminMentors() {
    const [selected, setSelected] = useState(null)

    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="app-content admin-mentors__main">
                <div className="admin-mentors__header">
                    <h1 className="admin-mentors__title">Mentor Applications</h1>
                    <p className="admin-mentors__subtitle">Users requesting mentor status</p>
                </div>

                <div className="admin-mentors__list">
                    {PENDING_MENTORS.map((mentor) => (
                        <div key={mentor.id} className="admin-mentors__card">
                            <div className="admin-mentors__card-info">
                                <span className="admin-mentors__name">{mentor.name}</span>
                                <span className="admin-mentors__meta">{mentor.jobTitle} @ {mentor.company}</span>
                            </div>
                            <button className="admin-mentors__review-btn" onClick={() => setSelected(mentor)}>
                                Review
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            <Modal
                isOpen={!!selected}
                onClose={() => setSelected(null)}
                title={selected?.name}
            >
                <div className="admin-mentors__modal-field">
                    <span className="admin-mentors__modal-label">Job Title</span>
                    <p className="admin-mentors__modal-value">{selected?.jobTitle}</p>
                </div>
                <div className="admin-mentors__modal-field">
                    <span className="admin-mentors__modal-label">Company</span>
                    <p className="admin-mentors__modal-value">{selected?.company}</p>
                </div>
                <div className="admin-mentors__modal-field">
                    <span className="admin-mentors__modal-label">Why they want to mentor</span>
                    <p className="admin-mentors__modal-value">{selected?.notes}</p>
                </div>
                <div className="admin-mentors__modal-actions">
                    <button className="admin-mentors__btn admin-mentors__btn--reject" onClick={() => setSelected(null)}>Reject</button>
                    <button className="admin-mentors__btn admin-mentors__btn--approve" onClick={() => setSelected(null)}>Approve</button>
                </div>
            </Modal>
        </div>
    )
}
