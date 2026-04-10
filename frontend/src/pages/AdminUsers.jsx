// pages/AdminUsers.jsx

import { useEffect, useState } from 'react'
import AdminSidebar from "../components/AdminSidebar"
import Button from "../components/Button"
import Modal from "../components/Modal"
import { fetchAllUsers, suspendUser, unsuspendUser } from '../api/adminQueries'
import '../styles/AdminUsers.css'

function formatRole(role) {
    return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchAllUsers()
            .then(setUsers)
            .finally(() => setLoading(false))
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        setLoading(true)
        fetchAllUsers(search || null)
            .then(setUsers)
            .finally(() => setLoading(false))
    }

    const handleSuspend = async () => {
        // TODO: replace '' with a note from a text input field in the modal
        await suspendUser(selected.userId, '')
        setUsers((prev) => prev.map((u) => u.userId === selected.userId ? { ...u, isActive: false } : u))
        setSelected(null)
    }

    const handleUnsuspend = async () => {
        await unsuspendUser(selected.userId)
        setUsers((prev) => prev.map((u) => u.userId === selected.userId ? { ...u, isActive: true } : u))
        setSelected(null)
    }

    if (loading) return null

    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="app-content admin-users__main">
                <div className="admin-users__header">
                    <h1 className="admin-users__title">User Management</h1>
                    <p className="admin-users__subtitle">Review and manage platform users</p>
                </div>

                <form className="admin-users__search" onSubmit={handleSearch}>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                    />
                    <Button variant="primary" type="submit">Search</Button>
                </form>

                <div className="admin-users__list">
                    {users.map((user) => (
                        <div key={user.userId} className="admin-users__card">
                            <div className="admin-users__avatar">{user.fullName.split(' ').map((n) => n[0]).join('')}</div>
                            <div className="admin-users__info">
                                <span className="admin-users__name">{user.fullName}</span>
                                <span className="admin-users__email">{user.email}</span>
                            </div>
                            <span className="admin-users__role">{formatRole(user.roleName)}</span>
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
                title={selected?.fullName}
            >
                <p className="admin-users__modal-email">{selected?.email}</p>
                <div className="admin-users__modal-field">
                    <span className="admin-users__modal-label">Current Role</span>
                    <span className="admin-users__role">{selected ? formatRole(selected.roleName) : ''}</span>
                </div>
                <div className="admin-users__modal-actions">
                    <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
                    {selected?.isActive
                        ? <Button variant="danger" onClick={handleSuspend}>Suspend User</Button>
                        : <Button variant="primary" onClick={handleUnsuspend}>Unsuspend User</Button>
                    }
                </div>
            </Modal>
        </div>
    )
}
