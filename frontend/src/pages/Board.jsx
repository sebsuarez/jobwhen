// pages/Board.jsx
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Card from '../components/Card'
import '../styles/Board.css'

const COLUMNS = [
  {id: 'wishlist', label: 'Wishlist' },
  {id: 'applied', label: 'Applied' },
  {id: 'interview', label: 'Interview' },
  {id: 'offer', label: 'Offer' },
  {id: 'rejected', label: 'Rejected' },
  {id: 'ghosted', label: 'Ghosted' },
]

// TODO: REPLACE THIS WITH REAL DATA FROM BACKEND ONCE SETUP!
const MOCK_JOBS = [
  { id: 1, company: 'Amazon', role: 'SDE New Grad', location: 'Vancouver, BC', salary: '$110k - $140k', deadline: 'March 10, 2026', tags: ['on-site', 'Java'], status: 'wishlist' },
  { id: 2, company: 'Figma', role: 'UI/UX Designer', location: 'Seattle, WA', salary: '$90k', deadline: 'March 11, 2026', tags: ['remote', 'Figma'], status: 'wishlist' },
  { id: 3, company: 'Google', role: 'SWE Intern (4m)', location: 'Waterloo, ON', salary: '$45/hr', deadline: 'March 1, 2026', tags: ['Hybrid'], status: 'applied' },
  { id: 4, company: 'Stripe', role: 'Full Stack Engineer', location: 'Seattle, WA', salary: '$90k', deadline: 'February 28, 2026', tags: ['on-site', 'next.js'], status: 'applied' },
  { id: 5, company: 'Vercel', role: 'Backend Engineer', location: 'Remote', salary: '$110k - $140k', deadline: 'March 11, 2026', tags: ['remote', 'next.js'], status: 'applied' },
  { id: 6, company: 'Amazon', role: 'SDE New Grad', location: 'Vancouver, BC', salary: '$110k - $140k', deadline: 'March 10, 2026', tags: ['on-site', 'Java'], status: 'interview' },
  { id: 7, company: 'Figma', role: 'UI/UX Designer', location: 'Seattle, WA', salary: '$90k', deadline: 'March 11, 2026', tags: ['remote', 'Figma'], status: 'interview' },
  { id: 8, company: 'Amazon', role: 'SDE New Grad', location: 'Vancouver, BC', salary: '$110k - $140k', deadline: 'March 10, 2026', tags: ['on-site', 'Java'], status: 'rejected' },
  { id: 9, company: 'Amazon', role: 'SDE New Grad', location: 'Vancouver, BC', salary: '$110k - $140k', deadline: 'March 10, 2026', tags: ['on-site', 'Java'], status: 'ghosted' },
]

export default function Board() {
  const [showAddModal, setShowAddModal] = useState(false)

  // TODO: REPLACE THIS WITH PROPER FUNCTIONALITY WITH BACKEND ONCE SETUP
  const getColumnJobs = (columnId) =>
    MOCK_JOBS.filter((job) => job.status === columnId)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <div className="board__header">
          <div>
            <h1 className="page-title">Job Board</h1>
            <p className="page-subtitle">Drag cards between columns to update their status OR edit cards by clicking/tapping on them</p>
          </div>
          <div className="board__header-actions">
            <div className="board__search">
              <span className="board__search-icon">🔍</span>
              <input
                type="text"
                className="board__search-input"
                placeholder="Search..."
              />
            </div>
            <Button onClick={() => setShowAddModal(true)}>+ Add Job</Button>
          </div>
        </div>

        <div className="board__columns">
          {COLUMNS.map((col) => {
            const jobs = getColumnJobs(col.id)
            return (
              <div key={col.id} className="board__column">
                <div className="board__column-header">
                  <span className={`board__column-label board__column-label--${col.id}`}>
                    {col.label}
                  </span>
                  <span className="board__column-count">{jobs.length}</span>
                </div>
                <div className="board__column-body">
                  {jobs.length === 0 ? (
                    <p className="board__empty">No applications</p>
                  ) : (
                    jobs.map((job) => (
                      <Card key={job.id} className={`board__job board__job--${job.status}`} onClick={() => {}}>
                        <h4 className="board__job-company">{job.company}</h4>
                        <p className="board__job-role">{job.role}</p>
                        <p className="board__job-location">{job.location}</p>
                        <p className="board__job-salary">{job.salary}</p>
                        <span className="board__job-deadline">Deadline {job.deadline}</span>
                        <div className="board__job-tags">
                          {job.tags.map((tag) => (
                            <span key={tag} className="board__job-tag">{tag}</span>
                          ))}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Application">
          <div className="board__form">
            <label className="board__form-label">Company</label>
            <input type="text" placeholder="e.g. Google" />
            <label className="board__form-label">Role</label>
            <input type="text" placeholder="e.g. Frontend Developer" />
            <label className="board__form-label">Location</label>
            <input type="text" placeholder="e.g. Calgary, AB" />
            <label className="board__form-label">Date Applied</label>
            <input type="date" />
            <label className="board__form-label">Notes</label>
            <textarea rows={3} placeholder="Any notes..." />
            <div className="board__form-actions">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="submit">Add Application</Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  )
}