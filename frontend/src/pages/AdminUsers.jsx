// pages/AdminUsers.jsx

import { useState } from 'react'
import AdminSidebar from "../components/AdminSidebar"
import Modal from "../components/Modal"
import '../styles/AdminUsers.css'

const PENDING_USERS = [
    { id: 1, name: 'Armin S.', email: 'armin@ucalgary.ca', role: 'Seeker', initials: 'AS' },
    { id: 2, name: 'Ryan O.', email: 'ryan@ucalgary.ca', role: 'Seeker', initials: 'RO' },
    { id: 3, name: 'Jason N.', email: 'jason@ucalgary.ca', role: 'Seeker', initials: 'JN' },
    { id: 4, name: 'Sebastian S.', email: 'seb@ucalgary.ca', role: 'Seeker', initials: 'SS' },
    { id: 5, name: 'Omar A.', email: 'omar@ucalgary.ca', role: 'Mentor', initials: 'OA' },
]

export default function AdminUsers() {
    const [selected, setSelected] = useState(null)

    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="app-content admin-users__main">
                <div className="admin-users__header">
                    <h1 className="admin-users__title">User Management</h1>
                    <p className="admin-users__subtitle">Review and manage platform users</p>
                </div>

                <div className="admin-users__list">
                    {PENDING_USERS.map((user) => (
                        <div key={user.id} className="admin-users__card">
                            <div className="admin-users__avatar">{user.initials}</div>
                            <div className="admin-users__info">
                                <span className="admin-users__name">{user.name}</span>
                                <span className="admin-users__email">{user.email}</span>
                            </div>
                            <span className="admin-users__role">{user.role}</span>
                            <button className="btn btn--primary" onClick={() => setSelected(user)}>
                                Manage
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
                <p className="admin-users__modal-email">{selected?.email}</p>
                <div className="admin-users__modal-field">
                    <span className="admin-users__modal-label">Current Role</span>
                    <span className="admin-users__role">{selected?.role}</span>
                </div>
                <div className="admin-users__modal-actions">
                    <button className="btn btn--ghost" onClick={() => setSelected(null)}>Cancel</button>
                    <button className="btn btn--danger" onClick={() => setSelected(null)}>Suspend User</button>
                    <button className="btn btn--primary" onClick={() => setSelected(null)}>Approve</button>
                </div>
            </Modal>
        </div>
    )
}
