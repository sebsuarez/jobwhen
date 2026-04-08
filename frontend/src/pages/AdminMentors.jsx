// pages/AdminMentors.jsx

import AdminSidebar from "../components/AdminSidebar"
import '../styles/AdminMentors.css'

export default function AdminMentors() {
    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="app-content admin-mentors__main">
                <div className="admin-mentors__header">
                    <h1 className="admin-mentors__title">Mentor Applications</h1>
                    <p className="admin-mentors__subtitle">Users requesting mentor status</p>
                </div>
            </main>
        </div>
    )
}
