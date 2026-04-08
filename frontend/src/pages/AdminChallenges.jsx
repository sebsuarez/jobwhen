// pages/AdminChallenges.jsx

import AdminSidebar  from "../components/AdminSidebar";
import '../styles/AdminChallenges.css'

export default function AdminChallenges() {
    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="app-content admin-challenges__main">
                <div className="admin-challenges__header">
                    <h1 className="admin-challenges__title">Challenge Review</h1>
                    <p className="admin-challenges__subtitle">Challenges pending moderation approval</p>
                </div>
            </main>
        </div>
    )
}