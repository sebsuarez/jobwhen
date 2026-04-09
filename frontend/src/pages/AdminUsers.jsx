// pages/AdminUsers.jsx

import { useEffect, useState } from 'react'
import AdminSidebar from "../components/AdminSidebar"
import Button from "../components/Button"
import Modal from "../components/Modal"
import { fetchAllUsers } from '../api/adminQueries'
import '../styles/AdminUsers.css'

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        fetchAllUsers()
            .then(setUsers)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return null

    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="app-content admin-users__main">
                <div className="admin-users__header">
                    <h1 className="admin-users__title">User Management</h1>
                    <p className="admin-users__subtitle">Review and manage platform users</p>
                </div>

                <div className="admin-users__list">
                    {users.map((user) => (
                        <div key={user.userId} className="admin-users__card">
                            <div className="admin-users__avatar">{user.fullName.split(' ').map((n) => n[0]).join('')}</div>
                            <div className="admin-users__info">
                                <span className="admin-users__name">{user.fullName}</span>
                                <span className="admin-users__email">{user.email}</span>
                            </div>
                            <span className="admin-users__role">{user.roleName}</span>
                            <Button variant="primary" onClick={() => setSelected(user)}>
                                Manage
                            </Button>
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
                    <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
                    <Button variant="danger" onClick={() => setSelected(null)}>Suspend User</Button>
                    <Button variant="primary" onClick={() => setSelected(null)}>Approve</Button>
                </div>
            </Modal>
        </div>
    )
}
