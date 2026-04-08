// pages/AdminUsers.jsx

import AdminSidebar from "../components/AdminSidebar";
import '../styles/AdminUsers.css'

export default function AdminUsers() {
    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="app-content admin-users__main">
                <div className="admin-users__header">
                    <h1 className="admin-users__title">User Management</h1>
                    <p className="admin-users__subtitle">Review and manage platform users</p>
                </div>
            </main>
        </div>
    )
}
